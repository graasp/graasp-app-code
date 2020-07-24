import { LOCAL_API_HOST } from './api';

export const DEFAULT_LANG = 'en';
export const DEFAULT_MODE = 'student';
export const DEFAULT_VIEW = 'normal';

let defaultApiHost;
try {
  defaultApiHost =
    window.parent.location.hostname === 'localhost' ? LOCAL_API_HOST : null;
} catch {
  // for testing
  defaultApiHost = LOCAL_API_HOST;
}

const DEFAULT_API_HOST = defaultApiHost;

// matches page view
export const DEFAULT_FONT_SIZE = 18;
export const FULL_SCREEN_FONT_SIZE = 24;

export const DEFAULT_MAX_INPUT_LENGTH = 5000;
export const DEFAULT_MAX_ROWS = 10;

// we haven't decided what to call the student mode
export const STUDENT_MODES = ['student', 'consumer', 'learner'];

// we haven't decided what to call the teacher mode
export const TEACHER_MODES = ['teacher', 'producer', 'educator', 'admin'];

// orientations
export const VERTICAL_ORIENTATION = 'VERTICAL_ORIENTATION';
export const HORIZONTAL_ORIENTATION = 'HORIZONTAL_ORIENTATION';
export const DEFAULT_ORIENTATION = VERTICAL_ORIENTATION;

// text colors
export const HELPER_TEXT_COLOR = 'rgba(0, 0, 0, 0.54)';

export const MAX_NUM_FILES = 10;
// ten megabytes times 1024 kilobytes/megabyte * 1024 bytes/kilobyte
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const PUBLIC_VISIBILITY = 'public';
export const PRIVATE_VISIBILITY = 'private';
export const DEFAULT_VISIBILITY = PRIVATE_VISIBILITY;

export { DEFAULT_API_HOST };
