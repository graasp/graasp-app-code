import _ from 'lodash';
import {
  GET_APP_INSTANCE_FAILED,
  GET_APP_INSTANCE_SUCCEEDED,
  PATCH_APP_INSTANCE_FAILED,
  PATCH_APP_INSTANCE_SUCCEEDED,
  FLAG_PATCHING_APP_INSTANCE,
  FLAG_GETTING_APP_INSTANCE,
} from '../types';
import { showErrorToast } from '../utils/toasts';
import { JAVASCRIPT } from '../config/programmingLanguages';

const DEFAULT_SETTINGS = {
  programmingLanguage: JAVASCRIPT,
};

const INITIAL_STATE = {
  content: {
    settings: DEFAULT_SETTINGS,
  },
  ready: false,
  // array of flags to keep track of various actions
  activity: [],
};

export default (state = INITIAL_STATE, { payload, type }) => {
  switch (type) {
    case FLAG_GETTING_APP_INSTANCE:
    case FLAG_PATCHING_APP_INSTANCE:
      return {
        ...state,
        // when true append to array, when false, pop from it
        activity: payload
          ? [...state.activity, payload]
          : [...state.activity.slice(1)],
      };

    case GET_APP_INSTANCE_SUCCEEDED:
    case PATCH_APP_INSTANCE_SUCCEEDED:
      // back to defaults if payload is null or settings are empty
      if (!payload || !payload.settings || _.isEmpty(payload.settings)) {
        return {
          ...state,
          content: {
            ...state.content,
            settings: DEFAULT_SETTINGS,
          },
          // mark instance as ready
          ready: true,
        };
      }
      return {
        ...state,
        content: payload,
        // mark instance as ready
        ready: true,
      };

    case PATCH_APP_INSTANCE_FAILED:
    case GET_APP_INSTANCE_FAILED:
      // show error to user
      showErrorToast(payload);
      return state;

    default:
      return state;
  }
};
