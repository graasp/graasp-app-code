// example sanitize function
import { PRINT_OUTPUT, CLEAR_OUTPUT } from '../types';
import workerCode from './worker';
import { CLEAR, PRINT } from '../config/commands';

// todo: implement
const sanitize = code => {
  return code;
};

function createWorker(dispatch) {
  const worker = new Worker(`data://application/javascript,${workerCode}`);
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

export { sanitize, runJavaScript };
