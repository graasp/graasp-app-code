import {
  GET_APP_INSTANCE_RESOURCES_SUCCEEDED,
  GET_APP_INSTANCE_RESOURCES_FAILED,
  POST_APP_INSTANCE_RESOURCE_SUCCEEDED,
  POST_APP_INSTANCE_RESOURCE_FAILED,
  PATCH_APP_INSTANCE_RESOURCE_SUCCEEDED,
  PATCH_APP_INSTANCE_RESOURCE_FAILED,
  DELETE_APP_INSTANCE_RESOURCE_SUCCEEDED,
  DELETE_APP_INSTANCE_RESOURCE_FAILED,
} from '../types';
import { showErrorToast } from '../utils/toasts';

// by default there are no app instance resources when the app starts
const INITIAL_STATE = {
  content: [],
};

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case GET_APP_INSTANCE_RESOURCES_SUCCEEDED:
      return {
        // we do not want to mutate the state object, so we destructure it here
        ...state,
        content: payload,
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
