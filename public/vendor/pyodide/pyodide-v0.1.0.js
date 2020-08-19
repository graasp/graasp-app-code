/*

Test of pyodide, with
    - stdout and stderr collected and displayed in a pre element
    - error message sent to stderr
    - last result displayed with sys.displayhook
    - dynamic loading of modules referenced by import statements
    - file support
    - matplotlib support

Author: Yves Piguet, EPFL, 2019-2020

Usage:
    const options = {
        postExec: function () { /* executed when execution is finished ** },
        write: function (str) { /* write text output ** },
        clearText: function () { /* clear text output ** },
        setFigureURL: function (dataURL) { /* show graphical output ** },
        notifyDirtyFile: function (path) { /* notify that a file has been modified ** },
        handleInput: boolean /* see below **
    };
    const p = new Pyodide(options);
    p.load();   // optional arg: function called once everything is loaded
    p.run(src);
    ...
    let dirtyFilePaths = p.getDirtyFilePaths(reset);
    // fetch dirtyFilePaths in sessionStorage and save them, upon page unload
    // or periodically, typically with reset=true to mark saved files as clean

With option handleInput=true, some support for input function is provided.
It's limited to calls outside any function definition. The whole code is
compiled as a coroutine, replacing "input(...)" with "(yield(False,...,locals()))",
and the function is executed as a coroutine, sending input string (first
None) and receiving prompt for next input until a StopIteration exception
is raised. A last yield(True,None,locals()) is executed at the end to
assign variables changed after the last input(); True (=done) means that
the code has completed.
To enable it:
- pass handleInput:true in Pyodide constructor options
- after executing method p.run(src), check if p.requestInput is true; if it is,
get input from the user with prompt p.inputPrompt (null if None was passed to
Python's function "input"), execute p.submitInput(input), and continue checking
p.requestInput and getting more input from the user until p.requestInput is false.

/** Simple virtual file system
*/
class FileSystem {
  /** Create a FileSystem object with data stored in sessionStorage
   @return {FileSystem}
   */
  static create() {
    return self.sessionStorage
      ? new FileSystemSessionStorage()
      : new FileSystemJS();
  }
}

/** Simple virtual file system with data stored internally
 */
class FileSystemJS extends FileSystem {
  constructor() {
    super();
    this.fs = {};
  }

  getDir() {
    return Object.keys(this.fs);
  }

  getFile(filename) {
    return this.fs[filename];
  }

  setFile(filename, content) {
    this.fs[filename] = content;
  }
}

/** Simple virtual file system with data stored as separate entries in
 sessionStorage
 */
class FileSystemSessionStorage extends FileSystem {
  getDir() {
    return Object.keys(self.sessionStorage);
  }

  getFile(filename) {
    return self.sessionStorage.getItem(filename);
  }

  setFile(filename, content) {
    self.sessionStorage.setItem(filename, content);
  }
}

class Pyodide {
  constructor(options) {
    this.postExec = (options && options.postExec) || (() => {});
    this.write = (options && options.write) || ((str) => {});
    this.clearText = (options && options.clearText) || (() => {});
    this.setFigureURL = (options && options.setFigureURL) || ((url) => {});
    this.notifyDirtyFile =
      (options && options.notifyDirtyFile) || ((path) => {});
    this.notifyStatus = (options && options.notifyStatus) || ((status) => {});

    this.handleInput = (options && options.handleInput) || false;
    this.requestInput = false;
    this.inputPrompt = null;

    // requested modules waiting to be fetched
    this.requestedModuleNames = [];
    // requested modules which have been fetched successfully
    this.loadedModuleNames = [];
    // requested modules which couldn't be fetched successfully
    this.failedModuleNames = [];

    // virtual file system
    this.fs = FileSystem.create();
    // files which have been created or modified
    this.dirtyFiles = [];
  }

  load(then) {
    this.notifyStatus('loading Pyodide');
    self.languagePluginUrl = 'pyodide-build-0.14.1/';
    languagePluginLoader.then(() => {
      this.notifyStatus('setup');

      self.pyodideGlobal = {
        requestModule: (name) => this.requestModule(name),
        fs: this.fs,
        markFileDirty: (path) => this.markFileDirty(path),
      };

      pyodide.runPython(`
                import sys
                from js import pyodideGlobal
                class __ImportIntercept:
                    def find_spec(self, name, path, module):
                        pyodideGlobal.requestModule(name)
                sys.meta_path.append(__ImportIntercept())

                import io
                import js

                class MyTextFile(io.StringIO):
                    def __init__(self, filename, mode="r"):
                        self.filename = filename
                        self.readOnly = mode == "r"
                        content = js.pyodideGlobal.fs.getFile(filename)
                        if content is None:
                            if self.readOnly:
                                raise FileNotFoundError(filename)
                            content = ""
                        else:
                            if mode == "w":
                                content = ""
                            elif mode == "x":
                                raise FileExistsError(filename)
                        super().__init__(content if content is not None else "")
                        if mode == "a":
                            self.seek(0, 2)
                    def close(self):
                        if not self.readOnly:
                            content = self.getvalue()
                            js.pyodideGlobal.fs.setFile(self.filename, content)
                            pyodideGlobal.markFileDirty(self.filename)
                            super().close()

                global open
                def open(filename, mode="r", encoding=None):
                    return MyTextFile(filename, mode)

                import os

                def __os_listdir(path="."):
                    return list(js.pyodideGlobal.fs.getDir())
                os.listdir = __os_listdir

                # user code execution
                global_variables = {
                    "open": open
                }
                def execute_code(src):
                    try:
                        code = compile(src, "<stdin>", mode="single")
                    except SyntaxError:
                        code = compile(src, "<stdin>", mode="exec")
                    exec(code, global_variables)
            `);

      then && then();
    });
  }

  requestModule(name) {
    if (
      this.requestedModuleNames.indexOf(name) < 0 &&
      this.loadedModuleNames.indexOf(name) < 0 &&
      this.failedModuleNames.indexOf(name) < 0
    ) {
      this.requestedModuleNames.push(name);
    }
  }

  markFileDirty(path) {
    if (this.dirtyFiles.indexOf(path) < 0) {
      this.dirtyFiles.push(path);
      this.notifyDirtyFile(path);
    }
  }

  getDirtyFilePaths(reset) {
    let dirtyFiles = this.dirtyFiles;
    if (reset) {
      this.dirtyFiles = [];
    }
    return dirtyFiles;
  }

  run(src) {
    // (re)set stdin and stderr
    pyodide.runPython(`
            import io, sys
            sys.stdout = io.StringIO()
            sys.stderr = sys.stdout
        `);

    // disable MatPlotLib output (will get it with matplotlib.pyplot.savefig)
    if (this.loadedModuleNames.indexOf('matplotlib') >= 0) {
      pyodide.runPython(`
                import matplotlib
                matplotlib.use('Agg')
            `);
    }

    if (this.handleInput) {
      pyodide.runPython(`
                class CodeWithInputEvaluator:

                    def __init__(self, src, global_variables):

                        import ast

                        def check_node(node, block_reason=None):
                            """Check that input function is called only from where it's supported,
                            i.e. at top-level if block_reason is None, not in functions or methods, and
                            nowhere if block_reason is a string describing the offending context. Raise
                            an exception otherwise.
                            """
                            if type(node) is ast.ClassDef:
                                block_reason = "class"
                            elif type(node) is ast.FunctionDef:
                                block_reason = "def"
                            elif type(node) is ast.Lambda:
                                block_reason = "lambda"
                            elif block_reason and type(node) is ast.Call and type(node.func) is ast.Name and node.func.id == "input":
                                raise Exception(f"input call not supported in {block_reason} at line {node.lineno}")
                            for child in ast.iter_child_nodes(node):
                                check_node(child, block_reason)

                        def check(src):
                            """Check that input function is called only from where it's supported,
                            i.e. at top-level, not in functions or methods. Raise an exception otherwise.
                            """
                            root = ast.parse(src)
                            check_node(root)

                        def replace_input_with_yield(src, function_name, global_var_names=[]):

                            """Compile source code and replace input calls with yield.
                            """
                            class Replacer(ast.NodeTransformer):
                                """NodeTransformer which replaces input(prompt) with
                                yield((False,prompt,locals()))
                                """
                                def visit_Call(self, node):
                                    self.generic_visit(node)
                                    if type(node.func) is ast.Name and node.func.id == "input":
                                        input_arg = node.args[0] if len(node.args) > 0 else ast.NameConstant(value=None)
                                        y = ast.Yield(value=ast.Tuple(
                                            elts=[
                                                ast.NameConstant(value=False),
                                                input_arg,
                                                ast.Call(func=ast.Name(id="locals", ctx=ast.Load()), args=[], keywords=[])
                                            ],
                                            ctx=ast.Load()
                                        ))
                                        return y
                                    return node

                            # compile to ast
                            root = ast.parse(src)

                            # check that input is called only from top-level code, not functions
                            check_node(root)

                            # replace input(prompt) with yield (False,prompt,locals())
                            replacer = Replacer()
                            root1 = replacer.visit(root)

                            # replace last statement with "import sys; sys.displayhook(expr)" if it's an expr
                            last_el = root1.body[-1]
                            if type(last_el) is ast.Expr:
                                expr = root1.body.pop()
                                root1.body.append(ast.Import(
                                    names=[
                                        ast.alias(name="sys", asname=None)
                                    ]
                                ))
                                root1.body.append(ast.Expr(
                                    value=ast.Call(
                                        func=ast.Attribute(attr="displayhook", value=ast.Name(id="sys", ctx=ast.Load()), ctx=ast.Load()),
                                        args=[expr.value],
                                        keywords=[]
                                    )
                                ))

                            # append yield (True,None,locals())
                            y = ast.Expr(
                                value=ast.Yield(value=ast.Tuple(
                                    elts=[
                                        ast.NameConstant(value=True),
                                        ast.NameConstant(value=None),
                                        ast.Call(func=ast.Name(id="locals", ctx=ast.Load()), args=[], keywords=[])
                                    ],
                                    ctx=ast.Load()
                                ))
                            )
                            root1.body.append(y)

                            # define a coroutine
                            root1.body = [
                                ast.FunctionDef(
                                    name=function_name,
                                    args=ast.arguments(
                                        args=[ast.arg(arg=g, annotation=None) for g in global_var_names],
                                        defaults=[],
                                        kwarg=None,
                                        kw_defaults=[],
                                        kwonlyargs=[],
                                        vararg=None
                                    ),
                                    body=root1.body,
                                    decorator_list=[],
                                    returns=None
                                )
                            ]

                            # add dummy missing lineno and col_offset to make compiler happy
                            for node in ast.walk(root1):
                                if not hasattr(node, "lineno"):
                                    node.lineno = 1
                                if not hasattr(node, "col_offset"):
                                    node.col_offset = 999

                            # compile
                            code = compile(root1, "<ast>", "exec")

                            return code

                        def run_code_with_input_as_coroutine(src, global_variables):
                            code = replace_input_with_yield(src, "corout", global_variables)
                            gl = {}
                            exec(code, gl)
                            co = gl["corout"](**global_variables)
                            return co

                        self.global_variables = global_variables
                        self.co = run_code_with_input_as_coroutine(src, global_variables)
                        self.done, self.prompt, new_global_variables = self.co.send(None)
                        self.global_variables.update(new_global_variables)

                    def submit_input(self, input):
                        self.done, self.prompt, new_global_variables = self.co.send(input)
                        self.global_variables.update(new_global_variables)

                    def cancel_input(self):
                        self.co.close()
            `);
    }

    // run src until all requested modules have been loaded (or failed)
    let errMsg = '';
    this.requestedModuleNames = [];
    try {
      this.notifyStatus('running');
      self.pyodideGlobal.setFigureURL = (url) => this.setFigureURL(url);
      pyodide.globals.src = src;
      if (this.handleInput) {
        // convert src to a coroutine
        pyodide.runPython(
          'evaluator = CodeWithInputEvaluator(src, global_variables)'
        );
        this.requestInput = false;
        pyodide.runPython(`
                    done = evaluator.done
                    input_prompt = evaluator.prompt
                `);
        if (!pyodide.globals.done) {
          this.inputPrompt = pyodide.globals.input_prompt;
          this.requestInput = true;
        }
      } else {
        pyodide.runPython('execute_code(src)');
      }

      if (this.loadedModuleNames.indexOf('matplotlib') >= 0) {
        pyodide.runPython(`
                    import matplotlib.pyplot, io, base64, js
                    if matplotlib.pyplot.get_fignums():
                        with io.BytesIO() as buf:
                            matplotlib.pyplot.savefig(buf, format="png")
                            buf.seek(0)
                            js.pyodideGlobal.setFigureURL("data:image/png;base64," +
                                base64.b64encode(buf.read()).decode("ascii"))
                `);
      }
    } catch (err) {
      if (
        /ModuleNotFoundError/.test(err.message) &&
        this.requestedModuleNames.length > 0
      ) {
        const nextModuleName = this.requestedModuleNames.shift();
        this.notifyStatus('loading module ' + nextModuleName);
        pyodide
          .loadPackage(nextModuleName)
          .then(() => {
            this.loadedModuleNames.push(nextModuleName);
            this.notifyStatus('running');
            this.run(src);
          })
          .catch(() => {
            this.failedModuleNames.push(nextModuleName);
            this.postExec && this.postExec();
          });
        // skip output and ui changes performed upon end
        // since we're not finished yet
        return false;
      } else {
        errMsg = err.message;
      }
    }

    let stdout = pyodide.runPython('sys.stdout.getvalue()');
    this.write(stdout + errMsg);

    this.postExec && this.postExec();

    return true;
  }

  submitInput(str) {
    if (this.requestInput) {
      // (re)set stdin and stderr
      pyodide.runPython(`
                import io, sys
                sys.stdout = io.StringIO()
                sys.stderr = sys.stdout
            `);

      this.requestInput = false;
      let errMsg = '';
      self.input_string = str;
      pyodide.runPython(`
                import js
                evaluator.submit_input(js.input_string)
                done = evaluator.done
                input_prompt = evaluator.prompt
            `);
      if (!pyodide.globals.done) {
        this.inputPrompt = pyodide.globals.next_prompt;
        this.requestInput = true;
      }

      let stdout = pyodide.runPython('sys.stdout.getvalue()');
      this.write(stdout + errMsg);
      this.postExec && this.postExec();
    }
  }

  cancelInput() {
    if (this.requestInput) {
      this.requestInput = false;
      try {
        pyodide.runPython(`
                    evaluator.cancel_input()
                `);
      } catch (err) {}
    }
  }

  clearFigure() {
    if (this.loadedModuleNames.indexOf('matplotlib') >= 0) {
      pyodide.runPython(`
                import matplotlib.pyplot
                matplotlib.pyplot.close()
            `);
      const transp1by1 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      this.setFigureURL(transp1by1);
    }
  }

  clear() {
    this.clearText();
    this.clearFigure();
  }
}
