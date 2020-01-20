/*

Test of pyodide, with
	- stdout and stderr collected and displayed in a pre element
	- error message sent to stderr
	- last result displayed with sys.displayhook
	- dynamic loading of modules referenced by import statements
	- file support
	- runs asynchronously in a webworker, with timeout and interruption

Author: Yves Piguet, EPFL, 2019-2020

Usage:

let pyWorker = new PyWorker();
pyWorker.onStatusChanged = (statusString) => { ... };
pyWorker.onTerminated = () => { ... };
pyWorker.onOutput = (text) => { ... };
pyWorker.onInput = (prompt) => { ... };
pyWorker.onFigure = (imageDataURL) => { ... }
pyWorker.onTimeout = () => { ... };
pyWorker.onDirtyFile = (path) => { ... };
pyWorker.onFile = (path, data) => { ... };
pyWorker.addCommand("name", (data) => { ... });

pyWorker.preload();	// optional

pyWorker.run("...");
pyWorker.stop();

*/

class PyWorker {
  constructor(workerURL) {
    this.workerURL = workerURL || 'pyodide-webworker.js';
    this.worker = null;
    this.isRunning = false;
    this.timeout = 180; // seconds (should be enough for numpy + scipy + matplotlib)
    this.timeoutId = -1;
    this.outputBuffer = '';

    // callbacks
    this.onOutput = null;
    this.onInput = null;
    this.onFigure = null;
    this.onTimeout = null;
    this.onDirtyFile = null;
    this.onFile = null;
    this.onStatusChanged = null;
    this.onTerminated = null;

    // commands added by addCommand(name, (data) => { ... })
    // (can be called from webworker with sendCommand;
    // from Python, with import js; js.sendCommand(name, data) )
    this.commands = {};
  }

  addCommand(name, fun) {
    this.commands[name] = fun;
  }

  stop() {
    if (this.worker != null) {
      this.worker.terminate();
      this.worker = null;
      this.isRunning = false;
      this.onTerminated && this.onTerminated();
    }
  }

  create() {
    this.stop();
    this.worker = new Worker(this.workerURL);
    this.isRunning = false;
    this.worker.addEventListener('message', ev => {
      switch (ev.data.cmd) {
        case 'print':
          this.printToOutput(ev.data.data);
          break;
        case 'clear':
          this.clearOutput();
          break;
        case 'figure':
          this.onFigure && this.onFigure(ev.data.data);
          break;
        case 'dirty':
          this.onDirtyFile && this.onDirtyFile(ev.data.data);
          break;
        case 'file':
          this.onFile && this.onFile(ev.data.path, ev.data.data);
          break;
        case 'input':
          this.isRunning = false;
          this.onInput && this.onInput(ev.data.prompt);
          break;
        case 'status':
          this.webworkerStatus = ev.data.status;
          this.onStatusChanged && this.onStatusChanged(this.webworkerStatus);
          break;
        case 'done':
          this.isRunning = false;
          this.webworkerStatus = '';
          this.onStatusChanged && this.onStatusChanged('');
          this.onTerminated && this.onTerminated();
          break;
        default:
          if (
            ev.data.cmd.slice(0, 4) === 'cmd:' &&
            this.commands[ev.data.cmd.slice(4)]
          ) {
            this.commands[ev.data.cmd.slice(4)](ev.data.data);
          }
          break;
      }
    });
    this.worker.addEventListener('error', ev => {
      console.info(ev);
    });
  }

  handleTimeout() {
    if (this.timeout >= 0) {
      if (this.timeoutId >= 0) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => {
        if (this.isRunning) {
          this.stop();
          this.onStatusChanged && this.onStatusChanged('');
          this.onTimeout && this.onTimeout();
        }
        this.timeoutId = -1;
      }, 1000 * this.timeout);
    }
  }

  run(src) {
    if (this.worker == null || this.isRunning) {
      this.create();
    }
    const msg =
      src != null
        ? {
            cmd: 'run',
            code: src,
          }
        : {
            cmd: 'preload',
          };
    this.worker.postMessage(JSON.stringify(msg));
    this.isRunning = true;
    this.handleTimeout();
  }

  submitInput(str) {
    if (this.worker && !this.isRunning) {
      const msg = {
        cmd: 'submit',
        str: str,
      };
      this.worker.postMessage(JSON.stringify(msg));
      this.isRunning = true;
      this.handleTimeout();
    }
  }

  cancelInput() {
    if (this.worker && !this.isRunning) {
      const msg = {
        cmd: 'cancel',
      };
      this.worker.postMessage(JSON.stringify(msg));
    }
  }

  getFile(path) {
    const msg = {
      cmd: 'get',
      path: path,
    };
    this.worker.postMessage(JSON.stringify(msg));
  }

  putFile(path, data) {
    const msg = {
      cmd: 'put',
      path: path,
      data: data,
    };
    this.worker.postMessage(JSON.stringify(msg));
  }

  preload() {
    this.run(null);
  }

  clearOutput() {
    this.outputBuffer = '';
    this.onOutput && this.onOutput(this.outputBuffer);
  }

  clearFigure() {
    const msg = {
      cmd: 'clearFigure',
    };
    this.worker.postMessage(JSON.stringify(msg));
  }

  printToOutput(str) {
    this.outputBuffer += str;
    this.onOutput && this.onOutput(this.outputBuffer);
  }
}

export default PyWorker;
