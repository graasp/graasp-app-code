import React from 'react';
import ReactGa from 'react-ga';
import PropTypes from 'prop-types';
import { I18nextProvider } from 'react-i18next';
import {
  MuiThemeProvider,
  createMuiTheme,
  withStyles,
} from '@material-ui/core/styles';
import { ToastContainer } from 'react-toastify';
import grey from '@material-ui/core/colors/grey';
import orange from '@material-ui/core/colors/orange';
import 'react-toastify/dist/ReactToastify.css';
import i18nConfig from '../config/i18n';
import App from './App';
import {
  REACT_APP_GRAASP_APP_ID,
  REACT_APP_GRAASP_DEVELOPER_ID,
  REACT_APP_VERSION,
  REACT_APP_GOOGLE_ANALYTICS_ID,
} from '../config/env';

ReactGa.initialize(REACT_APP_GOOGLE_ANALYTICS_ID);
ReactGa.ga(
  'send',
  'pageview',
  `/${REACT_APP_GRAASP_DEVELOPER_ID}/${REACT_APP_GRAASP_APP_ID}/${REACT_APP_VERSION}/`
);

const styles = {
  root: {
    flexGrow: 1,
    height: '100%',
  },
};

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#5050d2',
    },
    secondary: {
      main: '#fff',
    },
    default: grey,
    background: {
      paper: '#fff',
    },
  },
  status: {
    danger: {
      background: orange,
      color: '#fff',
    },
  },
  typography: {
    useNextVariants: true,
  },
});

const Root = ({ classes }) => (
  <div className={classes.root}>
    <MuiThemeProvider theme={theme}>
      <I18nextProvider i18n={i18nConfig}>
        <App />
        <ToastContainer />
      </I18nextProvider>
    </MuiThemeProvider>
  </div>
);

Root.propTypes = {
  classes: PropTypes.shape({
    root: PropTypes.string,
  }).isRequired,
};

const StyledComponent = withStyles(styles)(Root);

export default StyledComponent;
