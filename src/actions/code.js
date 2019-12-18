import {
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
  FLAG_RUNNING_CODE,
  FLAG_REGISTERING_WORKER,
} from '../types';
import { runJavaScript } from '../runners/javascript';
import { JAVASCRIPT, PYTHON } from '../config/programmingLanguages';
import { runPython } from '../runners/python';
import pythonWorkerCode from '../workers/python';
import PyWorker from '../vendor/PyWorker';
import { flag } from './common';

const flagRunningCode = flag(FLAG_RUNNING_CODE);
const flagRegisteringWorker = flag(FLAG_REGISTERING_WORKER);

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

const registerWorker = programmingLanguage => dispatch => {
  dispatch(flagRegisteringWorker(true));

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

        worker.onOutput = text => {
          dispatch({
            payload: text,
            type: PRINT_OUTPUT,
          });
        };

        // when finished registering the callback removes the activity flag
        worker.onTerminated = () => {
          dispatch(flagRegisteringWorker(false));
        };
        worker.preload();

        dispatch({
          type: REGISTER_WORKER_SUCCEEDED,
          payload: worker,
        });

        break;
      case JAVASCRIPT:
      default:
        // todo: do this in a callback
        dispatch(flagRegisteringWorker(false));
    }
  } catch (err) {
    console.error(err);
    dispatch({
      type: REGISTER_WORKER_FAILED,
      payload: err,
    });
    dispatch(flagRegisteringWorker(false));
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
    code: { worker, activity },
  } = getState();

  // do not run if there is anything active currently
  if (activity.length) {
    return false;
  }

  const { data, input } = job;
  const config = {
    code: data,
    headerCode,
    footerCode,
    input,
    worker,
  };

  try {
    dispatch(flagRunningCode(true));

    // callback to execute after running code
    const callback = () => {
      dispatch(flagRunningCode(false));
    };
    switch (programmingLanguage) {
      case PYTHON:
        // todo: improve
        if (!worker) {
          alert(
            'Pyodide did not initialize correctly. Please refresh the page.'
          );
        }
        return runPython(config, callback);

      case JAVASCRIPT:
      default:
        runJavaScript(config, dispatch);
        return callback();
    }
  } catch (err) {
    // todo abort worker execution
    console.error(err);
    dispatch(flagRunningCode(false));
    return dispatch({
      type: RUN_CODE_FAILED,
      payload: err,
    });
  } finally {
    // lower flag
  }
};

export {
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
