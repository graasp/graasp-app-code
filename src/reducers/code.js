import {
  SET_CODE,
  SET_HEADER_CODE,
  SET_FOOTER_CODE,
  PRINT_OUTPUT,
  CLEAR_OUTPUT,
  SET_INPUT,
  APPEND_INPUT,
  REGISTER_WORKER,
} from '../types';

const INITIAL_STATE = {
  content: '',
  header: '',
  footer: '',
  input: '',
  output: '',
  worker: null,
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
    case SET_INPUT:
      return {
        ...state,
        input: payload,
      };
    case APPEND_INPUT:
      return {
        ...state,
        input: state.input + payload,
      };
    case REGISTER_WORKER:
      return {
        ...state,
        worker: payload,
      };
    default:
      return state;
  }
};
