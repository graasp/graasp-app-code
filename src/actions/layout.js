import {
  CLOSE_SETTINGS,
  OPEN_SETTINGS,
  OPEN_INPUT_SETTINGS,
  CLOSE_INPUT_SETTINGS,
  OPEN_FILE_SETTINGS,
  CLOSE_FILE_SETTINGS,
} from '../types';

const openSettings = () => dispatch =>
  dispatch({
    type: OPEN_SETTINGS,
  });

const closeSettings = () => dispatch =>
  dispatch({
    type: CLOSE_SETTINGS,
  });

const openInputSettings = () => dispatch =>
  dispatch({
    type: OPEN_INPUT_SETTINGS,
  });

const closeInputSettings = () => dispatch =>
  dispatch({
    type: CLOSE_INPUT_SETTINGS,
  });

const openFileSettings = () => dispatch =>
  dispatch({
    type: OPEN_FILE_SETTINGS,
  });

const closeFileSettings = () => dispatch =>
  dispatch({
    type: CLOSE_FILE_SETTINGS,
  });

export {
  openSettings,
  closeSettings,
  openInputSettings,
  closeInputSettings,
  openFileSettings,
  closeFileSettings,
};
