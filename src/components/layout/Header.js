import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import {
  InsertDriveFile as InsertDriveFileIcon,
  Refresh as RefreshIcon,
  TableChart as TableIcon,
} from '@material-ui/icons';
import { withTranslation } from 'react-i18next';
import { addQueryParamsToUrl } from '../../utils/url';
import DownloadCSVButton from '../modes/teacher/DownloadCSVButton';
import { ReactComponent as Logo } from '../../resources/logo.svg';
import {
  DEFAULT_MODE,
  STUDENT_MODES,
  TEACHER_MODES,
} from '../../config/settings';
import { DEFAULT_VIEW, FILES_VIEW } from '../../config/views';
import {
  runCode,
  openInputSettings,
  closeInputSettings,
  patchAppInstanceResource,
  postAppInstanceResource,
  getAppInstanceResources,
  getUsers,
} from '../../actions';
import { INPUT, STDIN } from '../../config/appInstanceResourceTypes';
import { DEFAULT_PROGRAMMING_LANGUAGE } from '../../config/programmingLanguages';

class Header extends Component {
  static styles = theme => ({
    root: {
      flexGrow: 1,
    },
    grow: {
      flexGrow: 1,
    },
    logo: {
      height: '48px',
      marginRight: theme.spacing(2),
    },
    fab: {
      margin: theme.spacing(),
      position: 'fixed',
      top: theme.spacing(),
      right: theme.spacing(),
    },
    fab1: {
      top: theme.spacing(2) + 40,
    },
    fab2: {
      top: theme.spacing(3) + 2 * 40,
    },
    fab3: {
      top: theme.spacing(4) + 3 * 40,
    },
  });

  static propTypes = {
    t: PropTypes.func.isRequired,
    dispatchGetUsers: PropTypes.func.isRequired,
    dispatchGetAppInstanceResources: PropTypes.func.isRequired,
    dispatchPostAppInstanceResource: PropTypes.func.isRequired,
    dispatchPatchAppInstanceResource: PropTypes.func.isRequired,
    dispatchRunCode: PropTypes.func.isRequired,
    dispatchOpenInputSettings: PropTypes.func.isRequired,
    dispatchCloseInputSettings: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      root: PropTypes.string,
      grow: PropTypes.string,
      logo: PropTypes.string,
    }).isRequired,
    mode: PropTypes.string,
    currentCode: PropTypes.string.isRequired,
    currentInput: PropTypes.string,
    programmingLanguage: PropTypes.string.isRequired,
    savedCode: PropTypes.string,
    savedInput: PropTypes.string,
    inputResourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stdinResourceId: PropTypes.string,
    userId: PropTypes.string,
    view: PropTypes.string,
    inputDisplayed: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    mode: DEFAULT_MODE,
    view: DEFAULT_VIEW,
    savedCode: '',
    savedInput: '',
    userId: null,
    inputResourceId: null,
    stdinResourceId: null,
    currentInput: '',
  };

  handleOpenInput = () => {
    const {
      inputDisplayed,
      dispatchOpenInputSettings,
      dispatchCloseInputSettings,
    } = this.props;

    if (inputDisplayed) {
      dispatchCloseInputSettings();
    } else {
      dispatchOpenInputSettings();
    }
  };

  handleSave = () => {
    const { currentCode, currentInput, savedCode, savedInput } = this.props;

    // In local api server, consecutive callings of dispatchPatchAppInstanceResource often
    // results in 'NetworkError when attempting to fetch resource'  (6/Sep/2019).

    if (currentCode !== savedCode) {
      this.handleSaveCode();
    }

    if (currentInput !== savedInput) {
      this.handleSaveInput();
    }
  };

  handleSaveCode = () => {
    const {
      dispatchPatchAppInstanceResource,
      dispatchPostAppInstanceResource,
      inputResourceId,
      userId,
      currentCode,
    } = this.props;

    // if there is a resource id already, update, otherwise create
    if (inputResourceId) {
      dispatchPatchAppInstanceResource({
        data: currentCode,
        id: inputResourceId,
      });
    } else {
      dispatchPostAppInstanceResource({
        data: currentCode,
        type: INPUT,
        userId,
      });
    }
  };

  handleSaveInput = () => {
    const {
      dispatchPatchAppInstanceResource,
      dispatchPostAppInstanceResource,
      stdinResourceId,
      userId,
      currentInput,
    } = this.props;

    // if there is a resource id already, update, otherwise create
    if (stdinResourceId) {
      dispatchPatchAppInstanceResource({
        data: currentInput,
        id: stdinResourceId,
      });
    } else {
      dispatchPostAppInstanceResource({
        data: currentInput,
        type: STDIN,
        userId,
      });
    }
  };

  handleRun = () => {
    const { currentCode, currentInput, dispatchRunCode } = this.props;
    const job = {
      data: currentCode,
      input: currentInput,
    };

    dispatchRunCode(job);
  };

  handleRefresh = () => {
    const { dispatchGetAppInstanceResources, dispatchGetUsers } = this.props;
    dispatchGetAppInstanceResources();
    dispatchGetUsers();
  };

  renderTeacherButtons() {
    const { view } = this.props;
    const buttons = [
      <IconButton onClick={this.handleRefresh} key="refresh">
        <RefreshIcon color="secondary" />
      </IconButton>,
      <DownloadCSVButton />,
    ];

    if (view === DEFAULT_VIEW) {
      buttons.push(
        <IconButton
          key="dashboard"
          href={`index.html${addQueryParamsToUrl({ view: FILES_VIEW })}`}
        >
          <InsertDriveFileIcon color="secondary" />
        </IconButton>
      );
    } else {
      buttons.push(
        <IconButton
          key="table"
          href={`index.html${addQueryParamsToUrl({ view: DEFAULT_VIEW })}`}
        >
          <TableIcon color="secondary" />
        </IconButton>
      );
    }
    return buttons;
  }

  renderLanguage() {
    const { t, programmingLanguage } = this.props;

    return `: ${t(programmingLanguage)}`;
  }

  render() {
    const { mode, t, classes } = this.props;

    if (STUDENT_MODES.includes(mode)) {
      return null;
    }
    if (TEACHER_MODES.includes(mode)) {
      return (
        <header>
          <AppBar position="static">
            <Toolbar>
              <Logo className={classes.logo} />
              <Typography variant="h6" color="inherit" className={classes.grow}>
                {t('Code') + this.renderLanguage()}
              </Typography>
              {this.renderTeacherButtons()}
            </Toolbar>
          </AppBar>
        </header>
      );
    }
    return null;
  }
}

const mapStateToProps = ({
  context,
  code,
  layout,
  appInstanceResources,
  appInstance,
}) => {
  const { userId } = context;
  // check to see if there is already an app instance
  // resource containing input from this user
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  const stdinResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === STDIN;
  });
  const {
    programmingLanguage = DEFAULT_PROGRAMMING_LANGUAGE,
  } = appInstance.content.settings;
  return {
    userId,
    inputResourceId: inputResource && (inputResource.id || inputResource._id),
    stdinResourceId: stdinResource && (stdinResource.id || stdinResource._id),
    appInstanceId: context.appInstanceId,
    spaceId: context.spaceId,
    mode: context.mode,
    view: context.view,
    savedCode: inputResource && inputResource.data,
    savedInput: stdinResource && stdinResource.data,
    currentInput: code.input,
    inputDisplayed: layout.settings.inputDisplayed,
    programmingLanguage,
  };
};

const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchRunCode: runCode,
  dispatchOpenInputSettings: openInputSettings,
  dispatchCloseInputSettings: closeInputSettings,
  dispatchGetAppInstanceResources: getAppInstanceResources,
  dispatchGetUsers: getUsers,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);

const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(Header.styles)(TranslatedComponent);
