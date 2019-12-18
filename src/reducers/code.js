import {
  SET_CODE,
  SET_HEADER_CODE,
  SET_DEFAULT_CODE,
  SET_FOOTER_CODE,
  PRINT_OUTPUT,
  CLEAR_OUTPUT,
  SET_INPUT,
  APPEND_INPUT,
  REGISTER_WORKER_SUCCEEDED,
  FLAG_RUNNING_CODE,
  FLAG_REGISTERING_WORKER,
  APPEND_OUTPUT,
  CLEAR_FIGURES,
  APPEND_FIGURE,
} from '../types';

const INITIAL_STATE = {
  content: '',
  header: '',
  default: '',
  footer: '',
  input: '',
  output: '',
  worker: null,
  figures: [],
  activity: [],
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
        output: payload,
      };
    case APPEND_OUTPUT:
      return {
        ...state,
        output: state.output + payload,
      };
    case APPEND_FIGURE:
      return {
        ...state,
        figures: state.figures.concat(payload),
      };
    case CLEAR_FIGURES:
      return {
        ...state,
        figures: [],
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
    case REGISTER_WORKER_SUCCEEDED:
      return {
        ...state,
        worker: payload,
      };
    case FLAG_REGISTERING_WORKER:
    case FLAG_RUNNING_CODE:
      return {
        ...state,
        // when true append to array, when false, pop from it
        activity: payload
          ? [...state.activity, payload]
          : [...state.activity.slice(1)],
      };
    default:
      return state;
  }
};
