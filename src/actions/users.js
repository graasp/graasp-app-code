import _ from 'lodash';
import { flag, getApiContext, isErrorResponse, postMessage } from './common';
import {
  FLAG_GETTING_USERS,
  GET_USERS_FAILED,
  GET_USERS_SUCCEEDED,
  GET_USERS,
} from '../types';
import {
  DEFAULT_GET_REQUEST,
  GRAASP_USERS_ENDPOINT,
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

    // we have two endpoints for users
    const spaceUsersUrl = `//${
      apiHost + SPACES_ENDPOINT
    }/${spaceId}/${USERS_ENDPOINT}`;
    const graaspUsersUrl = `//${apiHost + GRAASP_USERS_ENDPOINT}`;

    // get users that are associated with this space
    const spaceUsersResponse = await fetch(spaceUsersUrl, DEFAULT_GET_REQUEST);

    // throws if it is an error
    await isErrorResponse(spaceUsersResponse);

    const spaceUsers = await spaceUsersResponse.json();

    // complement with graasp users that interacted with the application
    // these are users that access the app using their credentials
    // through the page view interface
    const {
      appInstanceResources: { content },
    } = getState();
    const graaspUsers = [];
    const userIds = spaceUsers.map((user) => user.id);
    // eslint-disable-next-line no-restricted-syntax
    for (const appInstanceResourceUser of content) {
      const userId = appInstanceResourceUser.user;
      if (!userIds.includes(userId)) {
        const graaspUserUrl = `${graaspUsersUrl}/${userId}`;
        try {
          // eslint-disable-next-line no-await-in-loop
          const graaspUsersResponse = await fetch(
            graaspUserUrl,
            DEFAULT_GET_REQUEST
          );

          // eslint-disable-next-line no-await-in-loop
          const graaspUser = await graaspUsersResponse.json();

          if (graaspUser && !_.isEmpty(graaspUser)) {
            graaspUsers.push(graaspUser);
          }
        } catch {
          // do nothing
        }
      }
    }
    const users = [...spaceUsers, ...graaspUsers];

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
