// example sanitize function
import { PRINT_OUTPUT, CLEAR_OUTPUT } from '../types';
import workerCode from './worker';
import { CLEAR, PRINT } from '../config/commands';

// todo: implement
const sanitize = code => {
  return code;
};

// We would like to use module type worker, but Firefox still does not support that (16/8/2019).
const workerOptions = {
  type: 'classic',
};

function createWorker(dispatch) {
  const worker = new Worker(
    `data://application/javascript,${workerCode}`,
    workerOptions
  );
  worker.onmessage = ev => {
    switch (ev.data.cmd) {
      case PRINT:
        dispatch({
          payload: ev.data.data,
          type: PRINT_OUTPUT,
        });
        break;
      case CLEAR:
        dispatch({
          type: CLEAR_OUTPUT,
        });
        break;
      default:
      // do nothing
    }
  };
  return worker;
}

// example run function
const runJavaScript = (code = '', dispatch) => {
  const worker = createWorker(dispatch);
  worker.postMessage(code);
};

// Header code is intended to be used for importing libraries, initialize screens, and so on.
// Footer code is intended to be used for display runnning status, free resources, and so on.
const runJavaScriptWithHeaderAndFooter = (
  headerCode = '',
  code = '',
  footerCode = '',
  dispatch
) => {
  const worker = createWorker(dispatch);
  if (headerCode) {
    worker.postMessage(headerCode);
  }

  worker.postMessage(code);

  if (footerCode) {
    worker.postMessage(footerCode);
  }
};
export { sanitize, runJavaScript, runJavaScriptWithHeaderAndFooter };
