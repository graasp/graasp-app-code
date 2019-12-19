import { DEFAULT_DELETE_REQUEST } from '../config/api';
import { isErrorResponse } from './common';
import {
  DELETE_FILE_SUCCEEDED,
  DELETE_FILE_FAILED,
  GET_FILES_FAILED,
  GET_FILES_SUCCEEDED,
} from '../types';

const getFiles = async files => async dispatch => {
  try {
    const filesToAdd = {};

    // using for in loops so that the await is legible
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const file of files) {
      const { name, uri } = file;
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(uri);
      // eslint-disable-next-line no-await-in-loop
      const text = await response.text();
      // all files go to the root folder for now
      filesToAdd[`/${name}`] = { content: text };
    }

    return dispatch({
      type: GET_FILES_SUCCEEDED,
      payload: filesToAdd,
    });
  } catch (e) {
    return dispatch({
      type: GET_FILES_FAILED,
    });
  }
};

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

export { deleteFile, getFiles };
