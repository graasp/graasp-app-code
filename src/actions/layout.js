import { CLOSE_SETTINGS, OPEN_SETTINGS } from '../types';

const openSettings = () => dispatch =>
  dispatch({
    type: OPEN_SETTINGS,
  });

const closeSettings = () => dispatch =>
  dispatch({
    type: CLOSE_SETTINGS,
  });

export { openSettings, closeSettings };
