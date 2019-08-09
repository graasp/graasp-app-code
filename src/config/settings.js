import { LOCAL_API_HOST } from './api';

export const DEFAULT_LANG = 'en';
export const DEFAULT_MODE = 'student';
export const DEFAULT_VIEW = 'normal';
export const DEFAULT_API_HOST =
  window.parent.location.hostname === 'localhost' ? LOCAL_API_HOST : null;

export const DEFAULT_MAX_INPUT_LENGTH = 5000;
export const DEFAULT_MAX_ROWS = 10;

// we haven't decided what to call the student mode
export const STUDENT_MODES = ['student', 'consumer', 'learner'];

// we haven't decided what to call the teacher mode
export const TEACHER_MODES = ['teacher', 'producer', 'educator', 'admin'];
