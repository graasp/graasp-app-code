import { LOCAL_API_HOST } from './api';

export const DEFAULT_LANG = 'en';
export const DEFAULT_MODE = 'student';
export const DEFAULT_VIEW = 'normal';
export const DEFAULT_API_HOST =
  window.parent.location.hostname === 'localhost' ? LOCAL_API_HOST : null;
