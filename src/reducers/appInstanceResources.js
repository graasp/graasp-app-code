import {
  GET_APP_INSTANCE_RESOURCES_SUCCEEDED,
  GET_APP_INSTANCE_RESOURCES_FAILED,
  POST_APP_INSTANCE_RESOURCE_SUCCEEDED,
  POST_APP_INSTANCE_RESOURCE_FAILED,
  PATCH_APP_INSTANCE_RESOURCE_SUCCEEDED,
  PATCH_APP_INSTANCE_RESOURCE_FAILED,
  DELETE_APP_INSTANCE_RESOURCE_SUCCEEDED,
  DELETE_APP_INSTANCE_RESOURCE_FAILED,
  FLAG_GETTING_APP_INSTANCE_RESOURCES,
  FLAG_DELETING_APP_INSTANCE_RESOURCE,
  FLAG_POSTING_APP_INSTANCE_RESOURCE,
  FLAG_PATCHING_APP_INSTANCE_RESOURCE,
} from '../types';
import { showErrorToast } from '../utils/toasts';

// by default there are no app instance resources when the app starts
const INITIAL_STATE = {
  content: [],
  // array of flags to keep track of various actions
  activity: [],
  // flag to indicate that the app instance resources have been received
  ready: false,
};

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case FLAG_GETTING_APP_INSTANCE_RESOURCES:
    case FLAG_DELETING_APP_INSTANCE_RESOURCE:
    case FLAG_POSTING_APP_INSTANCE_RESOURCE:
    case FLAG_PATCHING_APP_INSTANCE_RESOURCE:
      return {
        ...state,
        // when true append to array, when false, pop from it
        activity: payload
          ? [...state.activity, payload]
          : [...state.activity.slice(1)],
      };

    case GET_APP_INSTANCE_RESOURCES_SUCCEEDED:
      return {
        // we do not want to mutate the state object, so we destructure it here
        ...state,
        content: payload,
        // flag that we have received the app instance resources
        ready: true,
      };
    case POST_APP_INSTANCE_RESOURCE_SUCCEEDED:
      return {
        // we do not want to mutate the state object, so we destructure it here
        ...state,
        // we assume that the payload is an object we do not have in our content
        content: [...state.content, payload],
      };
    case PATCH_APP_INSTANCE_RESOURCE_SUCCEEDED:
      return {
        // we do not want to mutate the state object, so we destructure it here
        ...state,
        // we only replace the element that has been replaced
        content: state.content.map(appInstanceResource => {
          if (appInstanceResource._id !== payload._id) {
            return appInstanceResource;
          }
          return payload;
        }),
      };
    case DELETE_APP_INSTANCE_RESOURCE_SUCCEEDED:
      return {
        // we do not want to mutate the state object, so we destructure it here
        ...state,
        content: [
          ...state.content.filter(
            appInstanceResource => appInstanceResource._id !== payload
          ),
        ],
      };

    case GET_APP_INSTANCE_RESOURCES_FAILED:
    case POST_APP_INSTANCE_RESOURCE_FAILED:
    case PATCH_APP_INSTANCE_RESOURCE_FAILED:
    case DELETE_APP_INSTANCE_RESOURCE_FAILED:
      // show error to user
      showErrorToast(payload);
      return state;

    default:
      return state;
  }
};
