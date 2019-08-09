import { toast } from 'react-toastify';
import {
  FAILED_TO_FETCH_MESSAGE_RAW,
  FAILED_TO_FETCH_MESSAGE_PRETTY,
  UNEXPECTED_ERROR_MESSAGE,
} from '../constants/messages';

const showErrorToast = payload => {
  let message = UNEXPECTED_ERROR_MESSAGE;
  if (payload instanceof String) {
    message = payload;
  } else if (payload instanceof Object) {
    if (payload.message) {
      ({ message } = payload);
    }
  }
  // provide more context
  if (message === FAILED_TO_FETCH_MESSAGE_RAW) {
    message = FAILED_TO_FETCH_MESSAGE_PRETTY;
  }

  toast.error(message, {
    toastId: message,
    autoClose: false,
  });
};

export {
  // eslint-disable-next-line import/prefer-default-export
  showErrorToast,
};
