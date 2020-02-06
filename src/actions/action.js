import { DEFAULT_VISIBILITY } from '../config/settings';
import { flag, getApiContext, isErrorResponse, postMessage } from './common';
import {
  FLAG_POSTING_ACTION,
  POST_ACTION,
  POST_ACTION_FAILED,
  POST_ACTION_SUCCEEDED,
} from '../types';
import { ACTION_FORMAT } from '../config/formats';
import { ACTIONS_ENDPOINT, DEFAULT_POST_REQUEST } from '../config/api';

const flagPostingAction = flag(FLAG_POSTING_ACTION);

const postAction = async ({
  data,
  verb,
  visibility = DEFAULT_VISIBILITY,
} = {}) => async (dispatch, getState) => {
  dispatch(flagPostingAction(true));
  try {
    const {
      userId,
      appInstanceId,
      apiHost,
      offline,
      spaceId,
      subSpaceId,
      standalone,
    } = getApiContext(getState);

    // if standalone, you cannot connect to api
    if (standalone) {
      return false;
    }

    // if offline send message to parent requesting to create a resource
    if (offline) {
      return postMessage({
        type: POST_ACTION,
        payload: {
          data,
          verb,
          spaceId,
          subSpaceId,
          format: ACTION_FORMAT,
          appInstanceId,
          userId,
          visibility,
        },
      });
    }

    const url = `//${apiHost + ACTIONS_ENDPOINT}`;

    const body = {
      data,
      verb,
      space: spaceId,
      format: ACTION_FORMAT,
      appInstance: appInstanceId,
      visibility,
    };

    const response = await fetch(url, {
      ...DEFAULT_POST_REQUEST,
      body: JSON.stringify(body),
    });

    // throws if it is an error
    await isErrorResponse(response);

    const action = await response.json();

    return dispatch({
      type: POST_ACTION_SUCCEEDED,
      payload: action,
    });
  } catch (err) {
    return dispatch({
      type: POST_ACTION_FAILED,
      payload: err,
    });
  } finally {
    dispatch(flagPostingAction(false));
  }
};

export {
  // todo: remove when more exports are added
  // eslint-disable-next-line import/prefer-default-export
  postAction,
};
