import {
  SET_PROGRAMMING_LANGUAGE,
  SET_CODE,
  SET_HEADER_CODE,
  SET_DEFAULT_CODE,
  SET_FOOTER_CODE,
  RUN_CODE_FAILED,
  SET_INPUT,
  APPEND_INPUT,
  SEND_INPUT,
  PRINT_OUTPUT,
  REGISTER_WORKER_SUCCEEDED,
  REGISTER_WORKER_FAILED,
} from '../types';
import {
  runJavaScript,
  runJavaScriptWithHeaderAndFooter,
} from '../runners/javascript';
import { JAVASCRIPT, PYTHON } from '../config/programmingLanguages';
import { runPython } from '../runners/python';
import pythonWorkerCode from '../workers/python';
import PyWorker from '../vendor/PyWorker';

const setProgrammingLanguage = data => dispatch =>
  dispatch({
    type: SET_PROGRAMMING_LANGUAGE,
    payload: data,
  });

const setCode = data => dispatch =>
  dispatch({
    type: SET_CODE,
    payload: data,
  });

const setHeaderCode = data => dispatch =>
  dispatch({
    type: SET_HEADER_CODE,
    payload: data,
  });

const setDefaultCode = data => dispatch =>
  dispatch({
    type: SET_DEFAULT_CODE,
    payload: data,
  });

const setFooterCode = data => dispatch =>
  dispatch({
    type: SET_FOOTER_CODE,
    payload: data,
  });

const printOutput = data => dispatch =>
  dispatch({
    type: PRINT_OUTPUT,
    payload: data,
  });

const setInput = data => dispatch =>
  dispatch({
    type: SET_INPUT,
    payload: data,
  });

const appendInput = data => (dispatch, getState) => {
  const {
    code: { worker },
  } = getState();

  dispatch({
    type: APPEND_INPUT,
    payload: data,
  });

  // send input to worker
  if (worker) {
    const job = { command: APPEND_INPUT, data };
    worker.postMessage(job);
  }
};

const sendInput = data => (dispatch, getState) => {
  const {
    code: { worker },
  } = getState();

  dispatch({
    type: APPEND_INPUT,
    payload: '',
  });

  // send input to worker
  if (worker) {
    const job = { command: SEND_INPUT, data };
    worker.postMessage(job);
  }
};

const registerWorker = () => (dispatch, getState) => {
  const {
    appInstance: {
      content: {
        settings: { programmingLanguage },
      },
    },
  } = getState();

  try {
    let worker;
    switch (programmingLanguage) {
      case PYTHON:
        worker = new PyWorker(
          `data://application/javascript,${pythonWorkerCode}`
        );
        worker.timeout = 60;
        worker.addCommand('alert', msg => {
          alert(msg);
        });
        worker.preload();
        worker.onOutput = text => {
          dispatch({
            payload: text,
            type: PRINT_OUTPUT,
          });
        };
        worker.preload();
        dispatch({
          type: REGISTER_WORKER_SUCCEEDED,
          payload: worker,
        });
        break;
      case JAVASCRIPT:
      default:
      // do nothing
    }
  } catch (err) {
    console.error(err);
    dispatch({
      type: REGISTER_WORKER_FAILED,
      payload: err,
    });
  } finally {
    // lower flag
  }
};

const runCode = job => (dispatch, getState) => {
  const {
    appInstance: {
      content: {
        settings: { programmingLanguage, headerCode, footerCode },
      },
    },
    code: { worker },
  } = getState();

  const { data, input } = job;
  const config = {
    code: data,
    headerCode,
    footerCode,
    input,
    worker,
  };

  try {
    switch (programmingLanguage) {
      case PYTHON:
        runPython(config, dispatch);
        break;
      case JAVASCRIPT:
        runJavaScriptWithHeaderAndFooter(config, dispatch);
        break;
      default:
        runJavaScript(data, dispatch);
    }
  } catch (err) {
    dispatch({
      type: RUN_CODE_FAILED,
      payload: err,
    });
  } finally {
    // lower flag
  }
};

export {
  setProgrammingLanguage,
  runCode,
  setCode,
  setHeaderCode,
  setFooterCode,
  setDefaultCode,
  setInput,
  appendInput,
  sendInput,
  printOutput,
  registerWorker,
};
