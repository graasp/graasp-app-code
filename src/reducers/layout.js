import {
  OPEN_SETTINGS,
  CLOSE_SETTINGS,
  OPEN_INPUT_SETTINGS,
  CLOSE_INPUT_SETTINGS,
  OPEN_FILE_SETTINGS,
  CLOSE_FILE_SETTINGS,
  OPEN_INPUT_PROMPT,
  CLOSE_INPUT_PROMPT,
} from '../types';

const INITIAL_STATE = {
  settings: {
    open: false,
    inputDisplayed: false,
  },
  fileSettings: {
    open: false,
  },
  inputPrompt: {
    open: false,
    text: '',
  },
};

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case OPEN_INPUT_PROMPT:
      return {
        ...state,
        inputPrompt: {
          open: true,
          ...payload,
        },
      };
    case CLOSE_INPUT_PROMPT:
      return {
        ...state,
        inputPrompt: {
          text: '',
          open: false,
        },
      };
    case OPEN_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          open: true,
        },
      };
    case CLOSE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          open: false,
        },
      };
    case OPEN_INPUT_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          inputDisplayed: true,
        },
      };
    case CLOSE_INPUT_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          inputDisplayed: false,
        },
      };
    case OPEN_FILE_SETTINGS:
      return {
        ...state,
        fileSettings: {
          ...state.fileSettings,
          open: true,
        },
      };
    case CLOSE_FILE_SETTINGS:
      return {
        ...state,
        fileSettings: {
          ...state.fileSettings,
          open: false,
        },
      };
    default:
      return state;
  }
};
