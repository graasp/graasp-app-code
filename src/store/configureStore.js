import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import ReduxThunk from 'redux-thunk';
import ReduxPromise from 'redux-promise';
import reducers from '../reducers';

/**
 * configures the store and returns it along with the history for the router
 * @param state
 * @returns {{store: Store<any>, history}}
 */
const configure = state => {
  // create the store
  const store = createStore(
    reducers,
    state,
    composeWithDevTools(applyMiddleware(ReduxThunk, ReduxPromise))
  );
  return {
    store,
  };
};

export default configure;
