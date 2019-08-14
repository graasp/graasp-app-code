import {
  FLAG_GETTING_USERS,
  GET_USERS_FAILED,
  GET_USERS_SUCCEEDED,
} from '../types';
import { showErrorToast } from '../utils/toasts';

const INITIAL_STATE = {
  content: [],
  // array of flags to keep track of various actions
  activity: [],
};

export default (state = INITIAL_STATE, { payload, type }) => {
  switch (type) {
    case FLAG_GETTING_USERS:
      return {
        ...state,
        // when true append to array, when false, pop from it
        activity: payload
          ? [...state.activity, payload]
          : [...state.activity.slice(1)],
      };

    case GET_USERS_SUCCEEDED:
      return {
        // we do not want to mutate the state object, so we destructure it here
        ...state,
        content: payload,
      };

    case GET_USERS_FAILED:
      // show error to user
      showErrorToast(payload);
      return state;

    default:
      return state;
  }
};
