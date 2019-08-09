import Qs from 'qs';
import {
  FLAG_GETTING_CONTEXT,
  GET_CONTEXT_FAILED,
  GET_CONTEXT_SUCCEEDED,
} from '../types';
import { flag } from './common';
import { DEFAULT_API_HOST } from '../config/settings';

// flags
const flagGettingContext = flag(FLAG_GETTING_CONTEXT);

/**
 * synchronously gets the context from the query string
 * @returns {Function}
 */
const getContext = () => dispatch => {
  dispatch(flagGettingContext(true));
  try {
    const {
      mode = 'default',
      lang = 'en',
      apiHost = DEFAULT_API_HOST,
      appInstanceId = null,
      spaceId = null,
      subSpaceId = null,
      userId = null,
      sessionId = null,
    } = Qs.parse(window.location.search, { ignoreQueryPrefix: true });
    const context = {
      mode,
      lang,
      apiHost,
      appInstanceId,
      userId,
      sessionId,
      spaceId,
      subSpaceId,
    };
    dispatch({
      type: GET_CONTEXT_SUCCEEDED,
      payload: context,
    });
  } catch (err) {
    dispatch({
      type: GET_CONTEXT_FAILED,
      payload: err,
    });
  } finally {
    dispatch(flagGettingContext(false));
  }
};

export {
  // todo: remove with more exports
  // eslint-disable-next-line import/prefer-default-export
  getContext,
};
