// example sanitize function
import {
  PRINT_OUTPUT,
  CLEAR_OUTPUT,
  RUN_CODE,
  SET_INPUT,
  REGISTER_WORKER,
} from '../types';
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
  const job = { command: RUN_CODE, data: code };
  worker.postMessage(job);
};

// Header code is intended to be used for importing libraries, initialize screens, and so on.
// Footer code is intended to be used for display runnning status, free resources, and so on.
const runJavaScriptWithHeaderAndFooter = (config, dispatch) => {
  const { headerCode, footerCode, input, data: code } = config;
  const worker = createWorker(dispatch);
  dispatch({
    type: REGISTER_WORKER,
    payload: worker,
  });

  if (headerCode) {
    const job = { command: RUN_CODE, data: headerCode };
    worker.postMessage(job);
  }

  if (input) {
    const job = { command: SET_INPUT, data: input };
    worker.postMessage(job);
  }

  if (code) {
    const job = { command: RUN_CODE, data: code };
    worker.postMessage(job);
  }

  if (footerCode) {
    const job = { command: RUN_CODE, data: footerCode };
    worker.postMessage(job);
  }
};
export { sanitize, runJavaScript, runJavaScriptWithHeaderAndFooter };
