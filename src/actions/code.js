import _ from 'lodash';
import ReactGa from 'react-ga';
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
  APPEND_FIGURE,
  RESET_NUM_UNEXECUTED_CHANGES,
  COUNT_CHANGE,
  RESET_NUM_UNSAVED_CHANGES,
} from '../types';
import { runJavaScript } from '../runners/javascript';
import {
  DEFAULT_PROGRAMMING_LANGUAGE,
  JAVASCRIPT,
  PYTHON,
} from '../config/programmingLanguages';
import { runPython } from '../runners/python';
import pythonWorkerCode from '../workers/python';
import PyWorker from '../vendor/PyWorker';
import { flag } from './common';
import { postAction } from './action';
import { EXECUTED, SAVED } from '../config/verbs';
import { INPUT } from '../config/appInstanceResourceTypes';
import {
  patchAppInstanceResource,
  postAppInstanceResource,
} from './appInstanceResources';

const flagRunningCode = flag(FLAG_RUNNING_CODE);
const flagRegisteringWorker = flag(FLAG_REGISTERING_WORKER);

const resetNumUnexecutedChanges = () => dispatch =>
  dispatch({
    type: RESET_NUM_UNEXECUTED_CHANGES,
  });

const resetNumUnsavedChanges = () => dispatch =>
  dispatch({
    type: RESET_NUM_UNSAVED_CHANGES,
  });

const countChange = () => dispatch =>
  dispatch({
    type: COUNT_CHANGE,
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

        // handle figures
        worker.onFigure = imageDataUrl => {
          dispatch({
            payload: imageDataUrl,
            type: APPEND_FIGURE,
          });
        };

        // handle dynamic user input
        worker.onInput = label => {
          // todo: use material-ui dialog
          const res = prompt(label);
          if (_.isNull(res)) {
            worker.cancelInput();
          } else {
            worker.submitInput(res);
          }
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
        settings: {
          // fallback to defaults
          programmingLanguage = DEFAULT_PROGRAMMING_LANGUAGE,
          headerCode = '',
          footerCode = '',
        },
      },
    },
    code: { worker, activity, fs, numUnexecutedChanges },
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
    fs,
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
    // fire and forget action
    dispatch(
      postAction({
        verb: EXECUTED,
        data: {
          programmingLanguage,
          // number of unexecuted changes executed here
          numExecutedChanges: numUnexecutedChanges,
          code: data,
          headerCode: headerCode || undefined,
          footerCode: footerCode || undefined,
        },
      })
    );

    ReactGa.event({
      category: 'code',
      action: 'run',
      value: numUnexecutedChanges,
    });

    // reset counter
    dispatch(resetNumUnexecutedChanges());
  }
};

// this helper allows us to call post or patch app instance resource
// selectively and access the redux state without binding it to
// components that need to dispatch a save code action
const saveCode = ({ currentCode }) => (dispatch, getState) => {
  const {
    appInstance: {
      content: {
        settings: {
          // fallback to defaults
          programmingLanguage = DEFAULT_PROGRAMMING_LANGUAGE,
        },
      },
    },
    appInstanceResources,
    code: { numUnsavedChanges },
    context: { userId },
  } = getState();

  // if there is a resource id already, update, otherwise create
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  const inputResourceId =
    inputResource && (inputResource.id || inputResource._id);
  if (inputResourceId) {
    // Note: (06/Sep/2019)
    // in local api server, consecutive callings of patchAppInstanceResource
    // often result in 'NetworkError when attempting to fetch resource'
    dispatch(
      patchAppInstanceResource({
        data: currentCode,
        id: inputResourceId,
      })
    );
  } else {
    dispatch(
      postAppInstanceResource({
        data: currentCode,
        type: INPUT,
        userId,
      })
    );
  }
  dispatch(
    postAction({
      verb: SAVED,
      data: {
        // number of unsaved changes saved here
        numSavedChanges: numUnsavedChanges,
        programmingLanguage,
        code: currentCode,
      },
    })
  );

  ReactGa.event({
    category: 'code',
    action: 'save',
    value: numUnsavedChanges,
  });

  // reset counter
  dispatch(resetNumUnsavedChanges());
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
  resetNumUnexecutedChanges,
  countChange,
  saveCode,
};
