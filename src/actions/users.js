import { flag, getApiContext, isErrorResponse, postMessage } from './common';
import {
  FLAG_GETTING_USERS,
  GET_USERS_FAILED,
  GET_USERS_SUCCEEDED,
  GET_USERS,
} from '../types';
import {
  DEFAULT_GET_REQUEST,
  SPACES_ENDPOINT,
  USERS_ENDPOINT,
} from '../config/api';

const flagGettingUsers = flag(FLAG_GETTING_USERS);

const getUsers = async () => async (dispatch, getState) => {
  dispatch(flagGettingUsers(true));
  try {
    const { spaceId, apiHost, standalone, offline } = getApiContext(getState);

    // if standalone, you cannot connect to api
    if (standalone) {
      return false;
    }

    if (offline) {
      return postMessage({
        type: GET_USERS,
      });
    }

    const url = `//${apiHost + SPACES_ENDPOINT}/${spaceId}/${USERS_ENDPOINT}`;

    const response = await fetch(url, DEFAULT_GET_REQUEST);

    // throws if it is an error
    await isErrorResponse(response);

    const users = response.json();
    return dispatch({
      type: GET_USERS_SUCCEEDED,
      payload: users,
    });
  } catch (err) {
    return dispatch({
      type: GET_USERS_FAILED,
      payload: err,
    });
  } finally {
    dispatch(flagGettingUsers(false));
  }
};

export {
  // todo: remove when more exports are here
  // eslint-disable-next-line import/prefer-default-export
  getUsers,
};
