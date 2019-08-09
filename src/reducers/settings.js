import { OPEN_SETTINGS, CLOSE_SETTINGS } from '../types';

const INITIAL_STATE = {
  open: false,
};

export default (state = INITIAL_STATE, { type }) => {
  switch (type) {
    case OPEN_SETTINGS:
      return {
        ...state,
        open: true,
      };
    case CLOSE_SETTINGS:
      return {
        ...state,
        open: false,
      };
    default:
      return state;
  }
};
