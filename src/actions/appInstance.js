import {
  APP_INSTANCES_ENDPOINT,
  DEFAULT_GET_REQUEST,
  DEFAULT_PATCH_REQUEST,
} from '../config/api';
import { flag, getApiContext, isErrorResponse, postMessage } from './common';
import {
  FLAG_GETTING_APP_INSTANCE,
  FLAG_PATCHING_APP_INSTANCE,
  GET_APP_INSTANCE_FAILED,
  GET_APP_INSTANCE_SUCCEEDED,
  PATCH_APP_INSTANCE_FAILED,
  PATCH_APP_INSTANCE_SUCCEEDED,
  GET_APP_INSTANCE,
} from '../types';

const flagGettingAppInstance = flag(FLAG_GETTING_APP_INSTANCE);
const flagPatchingAppInstance = flag(FLAG_PATCHING_APP_INSTANCE);

const getAppInstance = async () => async (dispatch, getState) => {
  dispatch(flagGettingAppInstance(true));
  try {
    const {
      appInstanceId,
      spaceId,
      subSpaceId,
      apiHost,
      standalone,
      offline,
    } = getApiContext(getState);

    // if standalone, you cannot connect to api
    if (standalone) {
      return false;
    }

    // if offline send message to parent requesting resources
    if (offline) {
      return postMessage({
        type: GET_APP_INSTANCE,
        payload: {
          id: appInstanceId,
          spaceId,
          subSpaceId,
        },
      });
    }

    const url = `//${apiHost + APP_INSTANCES_ENDPOINT}/${appInstanceId}`;

    const response = await fetch(url, DEFAULT_GET_REQUEST);

    // throws if it is an error
    await isErrorResponse(response);

    const appInstance = await response.json();

    // send the app instance to the reducer
    return dispatch({
      type: GET_APP_INSTANCE_SUCCEEDED,
      payload: appInstance,
    });
  } catch (err) {
    return dispatch({
      type: GET_APP_INSTANCE_FAILED,
      payload: err,
    });
  } finally {
    dispatch(flagGettingAppInstance(false));
  }
};

const patchAppInstance = async ({ data } = {}) => async (
  dispatch,
  getState
) => {
  dispatch(flagPatchingAppInstance(true));
  try {
    const { appInstanceId, apiHost, standalone } = getApiContext(getState);

    // if standalone, you cannot connect to api
    if (standalone) {
      return false;
    }

    const url = `//${apiHost + APP_INSTANCES_ENDPOINT}/${appInstanceId}`;
    const body = {
      settings: data,
    };

    const response = await fetch(url, {
      ...DEFAULT_PATCH_REQUEST,
      body: JSON.stringify(body),
    });

    // throws if it is an error
    await isErrorResponse(response);

    const appInstance = await response.json();

    return dispatch({
      type: PATCH_APP_INSTANCE_SUCCEEDED,
      payload: appInstance,
    });
  } catch (err) {
    return dispatch({
      type: PATCH_APP_INSTANCE_FAILED,
      payload: err,
    });
  } finally {
    dispatch(flagPatchingAppInstance(false));
  }
};

export { patchAppInstance, getAppInstance };
