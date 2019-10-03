import {
  OPEN_SETTINGS,
  CLOSE_SETTINGS,
  OPEN_INPUT_SETTINGS,
  CLOSE_INPUT_SETTINGS,
} from '../types';

const INITIAL_STATE = {
  settings: {
    open: false,
    inputDisplayed: false,
  },
};

export default (state = INITIAL_STATE, { type }) => {
  switch (type) {
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
    default:
      return state;
  }
};
