import { OPEN_SETTINGS, CLOSE_SETTINGS } from '../types';

const INITIAL_STATE = {
  settings: {
    open: false,
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
    default:
      return state;
  }
};
