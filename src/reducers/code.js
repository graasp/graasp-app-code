import { SET_CODE } from '../types';

const INITIAL_STATE = {
  content: '',
};

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case SET_CODE:
      return {
        ...state,
        content: payload,
      };
    default:
      return state;
  }
};
