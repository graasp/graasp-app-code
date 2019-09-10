import {
  SET_CODE,
  SET_HEADER_CODE,
  SET_DEFAULT_CODE,
  SET_FOOTER_CODE,
  PRINT_OUTPUT,
  CLEAR_OUTPUT,
} from '../types';

const INITIAL_STATE = {
  content: '',
  header: '',
  default: '',
  footer: '',
  output: '',
};

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case SET_CODE:
      return {
        ...state,
        content: payload,
      };
    case SET_HEADER_CODE:
      return {
        ...state,
        header: payload,
      };
    case SET_DEFAULT_CODE:
      return {
        ...state,
        default: payload,
      };
    case SET_FOOTER_CODE:
      return {
        ...state,
        footer: payload,
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
