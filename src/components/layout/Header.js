import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import VerticalSplitIcon from '@material-ui/icons/VerticalSplit';
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline';
import TableIcon from '@material-ui/icons/TableChart';
import RefreshIcon from '@material-ui/icons/Refresh';
import CloudIcon from '@material-ui/icons/Cloud';
import { withTranslation } from 'react-i18next';
import { addQueryParamsToUrl } from '../../utils/url';
import { ReactComponent as Logo } from '../../resources/logo.svg';
import {
  DEFAULT_MODE,
  STUDENT_MODES,
  TEACHER_MODES,
} from '../../config/settings';
import {
  DEFAULT_VIEW,
  DASHBOARD_VIEW,
  FEEDBACK_VIEW,
} from '../../config/views';
import './Header.css';
import {
  runCode,
  patchAppInstanceResource,
  postAppInstanceResource,
} from '../../actions';
import { FEEDBACK, INPUT } from '../../config/appInstanceResourceTypes';

class Header extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    dispatchPostAppInstanceResource: PropTypes.func.isRequired,
    dispatchPatchAppInstanceResource: PropTypes.func.isRequired,
    dispatchRunCode: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      root: PropTypes.string,
      grow: PropTypes.string,
      logo: PropTypes.string,
    }).isRequired,
    mode: PropTypes.string,
    currentCode: PropTypes.string.isRequired,
    programmingLanguage: PropTypes.string.isRequired,
    savedCode: PropTypes.string,
    inputResourceId: PropTypes.string,
    userId: PropTypes.string,
    view: PropTypes.string,
    feedback: PropTypes.string,
  };

  static defaultProps = {
    mode: DEFAULT_MODE,
    view: DEFAULT_VIEW,
    savedCode: '',
    userId: null,
    inputResourceId: null,
    feedback: null,
  };

  static styles = theme => ({
    root: {
      flexGrow: 1,
    },
    grow: {
      flexGrow: 1,
    },
    logo: {
      height: '48px',
      marginRight: theme.spacing.unit * 2,
    },
  });

  handleSave = () => {
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

  handleRun = () => {
    const { currentCode, dispatchRunCode } = this.props;
    dispatchRunCode(currentCode);
  };

  renderTeacherButtons() {
    const { view } = this.props;
    const buttons = [
      <IconButton onClick={this.handleRefresh} key="refresh">
        <RefreshIcon nativeColor="#fff" />
      </IconButton>,
    ];

    if (view === DEFAULT_VIEW) {
      buttons.push(
        <IconButton
          key="dashboard"
          href={`index.html${addQueryParamsToUrl({ view: DASHBOARD_VIEW })}`}
        >
          <CloudIcon nativeColor="#fff" />
        </IconButton>
      );
    } else {
      buttons.push(
        <IconButton
          key="table"
          href={`index.html${addQueryParamsToUrl({ view: DEFAULT_VIEW })}`}
        >
          <TableIcon nativeColor="#fff" />
        </IconButton>
      );
    }
    return buttons;
  }

  renderStudentButtons() {
    const { t, currentCode, savedCode, feedback, view } = this.props;
    const feedbackDisabled = !feedback;
    const saveDisabled = currentCode === savedCode;
    const runDisabled = _.isEmpty(currentCode);

    const buttons = [
      <Tooltip title={t('Save')} key="save">
        <div>
          <IconButton onClick={this.handleSave} disabled={saveDisabled}>
            <SaveIcon nativeColor="#fff" opacity={saveDisabled ? 0.5 : 1} />
          </IconButton>
        </div>
      </Tooltip>,
      <Tooltip title={t('Run')} key="run">
        <div>
          <IconButton onClick={this.handleRun} disabled={runDisabled}>
            <PlayArrowIcon nativeColor="#fff" opacity={runDisabled ? 0.5 : 1} />
          </IconButton>
        </div>
      </Tooltip>,
    ];

    if (view === DEFAULT_VIEW) {
      buttons.unshift(
        <Tooltip title={t('Show Feedback')} key="feedback">
          <div>
            <IconButton
              href={`index.html${addQueryParamsToUrl({ view: FEEDBACK_VIEW })}`}
              disabled={feedbackDisabled}
            >
              <VerticalSplitIcon
                nativeColor="#fff"
                opacity={feedbackDisabled ? 0.5 : 1}
                style={{
                  transform: 'rotate(180deg)',
                }}
              />
            </IconButton>
          </div>
        </Tooltip>
      );
    }

    if (view === FEEDBACK_VIEW) {
      buttons.unshift(
        <Tooltip title={t('Show Editor')} key="editor">
          <div>
            <IconButton
              href={`index.html${addQueryParamsToUrl({ view: DEFAULT_VIEW })}`}
            >
              <ViewHeadlineIcon nativeColor="#fff" />
            </IconButton>
          </div>
        </Tooltip>
      );
    }
    return buttons;
  }

  renderButtons() {
    const { mode } = this.props;

    if (STUDENT_MODES.includes(mode)) {
      return this.renderStudentButtons();
    }
    if (TEACHER_MODES.includes(mode)) {
      // return this.renderTeacherButtons();
      return null;
    }
    return null;
  }

  renderLanguage() {
    const { t, programmingLanguage } = this.props;

    return `: ${t(programmingLanguage)}`;
  }

  render() {
    const { t, classes } = this.props;
    return (
      <header>
        <AppBar position="static">
          <Toolbar>
            <Logo className={classes.logo} />
            <Typography variant="h6" color="inherit" className={classes.grow}>
              {t('Code') + this.renderLanguage()}
            </Typography>
            {this.renderButtons()}
          </Toolbar>
        </AppBar>
      </header>
    );
  }
}

const mapStateToProps = ({
  context,
  code,
  appInstanceResources,
  appInstance,
}) => {
  const { userId } = context;
  // check to see if there is already an app instance
  // resource containing input from this user
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  const feedbackResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === userId && type === FEEDBACK;
    }
  );
  return {
    userId,
    inputResourceId: inputResource && (inputResource.id || inputResource._id),
    appInstanceId: context.appInstanceId,
    spaceId: context.spaceId,
    mode: context.mode,
    view: context.view,
    currentCode: code.content,
    programmingLanguage: appInstance.content.settings.programmingLanguage,
    savedCode: inputResource && inputResource.data,
    feedback: feedbackResource && feedbackResource.data,
  };
};

const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchRunCode: runCode,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(Header.styles)(TranslatedComponent);
