import { SET_CODE } from '../types';

const setCode = data => dispatch =>
  dispatch({
    type: SET_CODE,
    payload: data,
  });

export {
  // eslint-disable-next-line import/prefer-default-export
  setCode,
};
