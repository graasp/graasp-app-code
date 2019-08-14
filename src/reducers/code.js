import { SET_CODE, PRINT_OUTPUT, CLEAR_OUTPUT } from '../types';

const INITIAL_STATE = {
  content: '',
  output: '',
};

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case SET_CODE:
      return {
        ...state,
        content: payload,
      };
    case PRINT_OUTPUT:
      return {
        ...state,
        output: state.output + payload,
      };
    case CLEAR_OUTPUT:
      return {
        ...state,
        output: '',
      };
    default:
      return state;
  }
};
