import {
  DEFAULT_GET_REQUEST,
  DEFAULT_POST_REQUEST,
  DEFAULT_PATCH_REQUEST,
  DEFAULT_DELETE_REQUEST,
  APP_INSTANCE_RESOURCES_ENDPOINT,
} from '../config/api';
import {
  FLAG_GETTING_APP_INSTANCE_RESOURCES,
  GET_APP_INSTANCE_RESOURCES_FAILED,
  GET_APP_INSTANCE_RESOURCES_SUCCEEDED,
  FLAG_POSTING_APP_INSTANCE_RESOURCE,
  POST_APP_INSTANCE_RESOURCE_SUCCEEDED,
  POST_APP_INSTANCE_RESOURCE_FAILED,
  PATCH_APP_INSTANCE_RESOURCE_SUCCEEDED,
  PATCH_APP_INSTANCE_RESOURCE_FAILED,
  FLAG_PATCHING_APP_INSTANCE_RESOURCE,
  FLAG_DELETING_APP_INSTANCE_RESOURCE,
  DELETE_APP_INSTANCE_RESOURCE_FAILED,
  DELETE_APP_INSTANCE_RESOURCE_SUCCEEDED,
} from '../types';
import { flag, getApiContext, isErrorResponse } from './common';
import { showErrorToast } from '../utils/toasts';
import { MISSING_APP_INSTANCE_RESOURCE_ID_MESSAGE } from '../constants/messages';

const flagGettingAppInstanceResources = flag(
  FLAG_GETTING_APP_INSTANCE_RESOURCES
);
const flagPostingAppInstanceResource = flag(FLAG_POSTING_APP_INSTANCE_RESOURCE);
const flagPatchingAppInstanceResource = flag(
  FLAG_PATCHING_APP_INSTANCE_RESOURCE
);
const flagDeletingAppInstanceResource = flag(
  FLAG_DELETING_APP_INSTANCE_RESOURCE
);

const getAppInstanceResources = async ({
  userId,
  sessionId,
  type,
} = {}) => async (dispatch, getState) => {
  dispatch(flagGettingAppInstanceResources(true));
  try {
    const { appInstanceId, apiHost } = getApiContext(getState);

    let url = `//${apiHost +
      APP_INSTANCE_RESOURCES_ENDPOINT}?appInstanceId=${appInstanceId}`;

    // only add userId or sessionId, not both
    if (userId) {
      url += `&userId=${userId}`;
    } else if (sessionId) {
      url += `&sessionId=${sessionId}`;
    }
    // add type if present
    if (type) {
      url += `&type=${type}`;
    }

    const response = await fetch(url, DEFAULT_GET_REQUEST);

    // throws if it is an error
    await isErrorResponse(response);

    const appInstanceResources = await response.json();
    return dispatch({
      type: GET_APP_INSTANCE_RESOURCES_SUCCEEDED,
      payload: appInstanceResources,
    });
  } catch (err) {
    return dispatch({
      type: GET_APP_INSTANCE_RESOURCES_FAILED,
      payload: err,
    });
  } finally {
    dispatch(flagGettingAppInstanceResources(false));
  }
};

const postAppInstanceResource = async ({ data, userId } = {}) => async (
  dispatch,
  getState
) => {
  dispatch(flagPostingAppInstanceResource(true));
  try {
    const { appInstanceId, apiHost } = await getApiContext(getState);

    const url = `//${apiHost + APP_INSTANCE_RESOURCES_ENDPOINT}`;

    const body = {
      data,
      appInstance: appInstanceId,
      // here you can specify who the resource will belong to
      // but applies if the user making the request is an admin
      user: userId,
    };

    const response = await fetch(url, {
      ...DEFAULT_POST_REQUEST,
      body: JSON.stringify(body),
    });

    // throws if it is an error
    await isErrorResponse(response);

    const appInstanceResource = await response.json();

    return dispatch({
      type: POST_APP_INSTANCE_RESOURCE_SUCCEEDED,
      payload: appInstanceResource,
    });
  } catch (err) {
    return dispatch({
      type: POST_APP_INSTANCE_RESOURCE_FAILED,
      payload: err,
    });
  } finally {
    dispatch(flagPostingAppInstanceResource(false));
  }
};

const patchAppInstanceResource = async ({ id, data } = {}) => async (
  dispatch,
  getState
) => {
  dispatch(flagPatchingAppInstanceResource(true));
  try {
    const { apiHost } = await getApiContext(getState);

    if (!id) {
      return showErrorToast(MISSING_APP_INSTANCE_RESOURCE_ID_MESSAGE);
    }

    const url = `//${apiHost + APP_INSTANCE_RESOURCES_ENDPOINT}/${id}`;

    const body = {
      data,
    };

    const response = await fetch(url, {
      ...DEFAULT_PATCH_REQUEST,
      body: JSON.stringify(body),
    });

    // throws if it is an error
    await isErrorResponse(response);

    const appInstanceResource = await response.json();

    return dispatch({
      type: PATCH_APP_INSTANCE_RESOURCE_SUCCEEDED,
      payload: appInstanceResource,
    });
  } catch (err) {
    return dispatch({
      type: PATCH_APP_INSTANCE_RESOURCE_FAILED,
      payload: err,
    });
  } finally {
    dispatch(flagPatchingAppInstanceResource(false));
  }
};

const deleteAppInstanceResource = async id => async (dispatch, getState) => {
  dispatch(flagDeletingAppInstanceResource(true));
  try {
    const { apiHost } = await getApiContext(getState);

    if (!id) {
      return showErrorToast(MISSING_APP_INSTANCE_RESOURCE_ID_MESSAGE);
    }

    const url = `//${apiHost + APP_INSTANCE_RESOURCES_ENDPOINT}/${id}`;

    const response = await fetch(url, DEFAULT_DELETE_REQUEST);

    // throws if it is an error
    await isErrorResponse(response);

    return dispatch({
      type: DELETE_APP_INSTANCE_RESOURCE_SUCCEEDED,
      payload: id,
    });
  } catch (err) {
    return dispatch({
      type: DELETE_APP_INSTANCE_RESOURCE_FAILED,
      payload: err,
    });
  } finally {
    dispatch(flagDeletingAppInstanceResource(false));
  }
};

export {
  getAppInstanceResources,
  postAppInstanceResource,
  patchAppInstanceResource,
  deleteAppInstanceResource,
};
