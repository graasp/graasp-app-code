import { PRINT_OUTPUT } from '../types';

const runPython = (config = {}, dispatch) => {
  if (window.pyodide) {
    const { pyodide } = window;
    const { headerCode = '', footerCode = '', code = '' } = config;
    pyodide.runPython(`
      import io, sys
      sys.stdout = io.StringIO()
      sys.stderr = sys.stdout
    `);
    let errMsg = '';
    try {
      pyodide.runPython(headerCode);
      pyodide.runPython(code);
      pyodide.runPython(footerCode);
    } catch (err) {
      errMsg = err.toString();
    }

    const stdout = pyodide.runPython('sys.stdout.getvalue()');
    const output = stdout + errMsg;
    dispatch({
      type: PRINT_OUTPUT,
      payload: output,
    });
  }
};

// eslint-disable-next-line import/prefer-default-export
export { runPython };
