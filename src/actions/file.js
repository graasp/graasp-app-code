import { DEFAULT_DELETE_REQUEST } from '../config/api';
import { isErrorResponse } from './common';
import { DELETE_FILE_SUCCEEDED, DELETE_FILE_FAILED } from '../types';

const deleteFile = async uri => async dispatch => {
  try {
    const response = await fetch(uri, {
      ...DEFAULT_DELETE_REQUEST,
      credentials: undefined,
    });

    // throws if it is an error
    await isErrorResponse(response);

    return dispatch({
      type: DELETE_FILE_SUCCEEDED,
    });
  } catch (e) {
    return dispatch({
      type: DELETE_FILE_FAILED,
    });
  }
};

export {
  // eslint-disable-next-line import/prefer-default-export
  deleteFile,
};
