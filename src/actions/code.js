import {
  SET_LANGUAGE,
  SET_CODE,
  SET_HEADER_CODE,
  SET_FOOTER_CODE,
  RUN_CODE_FAILED,
  SET_INPUT,
  APPEND_INPUT,
  SEND_INPUT,
  PRINT_OUTPUT,
} from '../types';
import {
  runJavaScript,
  runJavaScriptWithHeaderAndFooter,
} from '../runners/javascript';
import { JAVASCRIPT, PYTHON } from '../config/programmingLanguages';
import { runPython } from '../runners/python';

const setLanguage = data => dispatch =>
  dispatch({
    type: SET_LANGUAGE,
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

const runCode = job => (dispatch, getState) => {
  const {
    appInstance: {
      content: {
        settings: { programmingLanguage, headerCode, footerCode },
      },
    },
  } = getState();

  const { data, input } = job;
  const config = {
    headerCode,
    footerCode,
    data,
    input,
  };

  try {
    switch (programmingLanguage) {
      case PYTHON:
        runPython(data, dispatch);
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
  setLanguage,
  runCode,
  setCode,
  setHeaderCode,
  setFooterCode,
  setInput,
  appendInput,
  sendInput,
  printOutput,
};
