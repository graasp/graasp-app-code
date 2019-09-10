import {
  SET_CODE,
  SET_HEADER_CODE,
  SET_FOOTER_CODE,
  RUN_CODE_FAILED,
} from '../types';
import {
  runJavaScript,
  runJavaScriptWithHeaderAndFooter,
} from '../runners/javascript';
import { JAVASCRIPT, PYTHON } from '../config/programmingLanguages';
import { runPython } from '../runners/python';

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

const runCode = data => (dispatch, getState) => {
  const {
    appInstance: {
      content: {
        settings: { programmingLanguage, headerCode, footerCode },
      },
    },
  } = getState();
  try {
    switch (programmingLanguage) {
      case PYTHON:
        runPython(data, dispatch);
        break;
      case JAVASCRIPT:
        runJavaScriptWithHeaderAndFooter(
          headerCode,
          data,
          footerCode,
          dispatch
        );
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

export { runCode, setCode, setHeaderCode, setFooterCode };
