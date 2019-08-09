import { flag, getApiContext, isErrorResponse } from './common';
import {
  FLAG_GETTING_USERS,
  GET_USERS_FAILED,
  GET_USERS_SUCCEEDED,
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
    const { spaceId, apiHost } = getApiContext(getState);

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
