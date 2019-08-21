// example run function
import { PRINT_OUTPUT } from '../types';

const runPython = (code = '', dispatch) => {
  if (window.pyodide) {
    const output = window.pyodide.runPython(code);
    dispatch({
      type: PRINT_OUTPUT,
      payload: output,
    });
  }
};

// eslint-disable-next-line import/prefer-default-export
export { runPython };
