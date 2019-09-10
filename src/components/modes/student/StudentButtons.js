import React, { Component } from 'react';
import _ from 'lodash';
import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import VerticalSplitIcon from '@material-ui/icons/VerticalSplit';
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import InputIcon from '@material-ui/icons/Input';
import SaveIcon from '@material-ui/icons/Save';
import { DEFAULT_VIEW, FEEDBACK_VIEW } from '../../../config/views';
import { addQueryParamsToUrl } from '../../../utils/url';
import {
  FEEDBACK,
  INPUT,
  STDIN,
} from '../../../config/appInstanceResourceTypes';
import {
  patchAppInstanceResource,
  postAppInstanceResource,
  runCode,
  setInput,
  openInputSettings,
  closeInputSettings,
} from '../../../actions';
import { JAVASCRIPT } from '../../../config/programmingLanguages';

class StudentButtons extends Component {
  static propTypes = {
    classes: PropTypes.shape({
      fab: PropTypes.string,
      fab1: PropTypes.string,
      fab2: PropTypes.string,
      fab3: PropTypes.string,
      fab4: PropTypes.string,
    }).isRequired,
    t: PropTypes.func.isRequired,
    dispatchPostAppInstanceResource: PropTypes.func.isRequired,
    dispatchPatchAppInstanceResource: PropTypes.func.isRequired,
    dispatchRunCode: PropTypes.func.isRequired,
    dispatchOpenInputSettings: PropTypes.func.isRequired,
    dispatchCloseInputSettings: PropTypes.func.isRequired,
    currentCode: PropTypes.string.isRequired,
    currentInput: PropTypes.string.isRequired,
    programmingLanguage: PropTypes.string.isRequired,
    savedCode: PropTypes.string,
    savedInput: PropTypes.string,
    feedback: PropTypes.string,
    inputResourceId: PropTypes.string,
    stdinResourceId: PropTypes.string,
    userId: PropTypes.string,
    view: PropTypes.string,
    isInputDisplayed: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    savedCode: '',
    savedInput: '',
    feedback: null,
    userId: null,
    inputResourceId: null,
    stdinResourceId: null,
    view: DEFAULT_VIEW,
  };

  static styles = theme => ({
    fab: {
      margin: theme.spacing.unit,
      position: 'fixed',
      zIndex: 1000,
      top: theme.spacing.unit * 2,
      right: theme.spacing.unit * 1,
    },
    fab1: {
      top: theme.spacing.unit * 3 + 40,
    },
    fab2: {
      top: theme.spacing.unit * 4 + 2 * 40,
    },
    fab3: {
      top: theme.spacing.unit * 5 + 3 * 40,
    },
  });

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
    const { currentInput, currentCode, dispatchRunCode } = this.props;
    const job = {
      data: currentCode,
      input: currentInput,
    };

    dispatchRunCode(job);
  };

  handleOpenInput = () => {
    const {
      isInputDisplayed,
      dispatchOpenInputSettings,
      dispatchCloseInputSettings,
    } = this.props;

    if (isInputDisplayed) {
      dispatchCloseInputSettings();
    } else {
      dispatchOpenInputSettings();
    }
  };

  render() {
    const {
      t,
      currentCode,
      savedCode,
      currentInput,
      savedInput,
      feedback,
      view,
      classes,
      programmingLanguage,
    } = this.props;
    const feedbackDisabled = !feedback;
    const saveDisabled =
      currentCode === savedCode && currentInput === savedInput;
    const runDisabled = _.isEmpty(currentCode);
    const showInput = programmingLanguage === JAVASCRIPT;

    const buttons = [
      <Fab
        onClick={this.handleSave}
        disabled={saveDisabled}
        className={[classes.fab, classes.fab1]}
        color="primary"
        key="save"
        size="small"
      >
        <Tooltip title={t('Save')}>
          <SaveIcon />
        </Tooltip>
      </Fab>,
      <Fab
        onClick={this.handleRun}
        disabled={runDisabled}
        className={[classes.fab]}
        key="run"
        color="primary"
        size="small"
      >
        <Tooltip title={t('Run')}>
          <PlayArrowIcon />
        </Tooltip>
      </Fab>,
    ];

    if (showInput) {
      buttons.unshift(
        <Fab
          onClick={this.handleOpenInput}
          disabled={!showInput}
          className={[classes.fab, classes.fab3]}
          key="input"
          color="primary"
          size="small"
        >
          <Tooltip title={t('Input')}>
            <InputIcon />
          </Tooltip>
        </Fab>
      );
    }

    if (view === DEFAULT_VIEW && !feedbackDisabled) {
      buttons.unshift(
        <Fab
          href={`index.html${addQueryParamsToUrl({ view: FEEDBACK_VIEW })}`}
          disabled={feedbackDisabled}
          color="primary"
          size="small"
          key="feedback"
          className={[classes.fab, classes.fab2]}
        >
          <Tooltip title={t('Show Feedback')}>
            <VerticalSplitIcon
              style={{
                transform: 'rotate(180deg)',
              }}
            />
          </Tooltip>
        </Fab>
      );
    }

    if (view === FEEDBACK_VIEW) {
      buttons.unshift(
        <Fab
          href={`index.html${addQueryParamsToUrl({ view: DEFAULT_VIEW })}`}
          color="primary"
          size="small"
          key="editor"
          className={[classes.fab, classes.fab2]}
        >
          <Tooltip title={t('Show Editor')}>
            <ViewHeadlineIcon />
          </Tooltip>
        </Fab>
      );
    }
    return buttons;
  }
}

const mapStateToProps = ({
  context,
  appInstanceResources,
  appInstance,
  code,
  layout,
}) => {
  const { userId, offline, appInstanceId } = context;
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  const stdinResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === STDIN;
  });
  const feedbackResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === userId && type === FEEDBACK;
    }
  );

  return {
    userId,
    offline,
    appInstanceId,
    inputResourceId: inputResource && (inputResource.id || inputResource._id),
    activity: Boolean(appInstanceResources.activity.length),
    ready: appInstanceResources.ready,
    feedback: feedbackResource && feedbackResource.data,
    output: code.output,
    spaceId: context.spaceId,
    mode: context.mode,
    view: context.view,
    programmingLanguage: appInstance.content.settings.programmingLanguage,
    currentCode: code.content,
    currentInput: code.input,
    savedCode: inputResource && inputResource.data,
    savedInput: stdinResource && stdinResource.data,
    isInputDisplayed: layout.settings.isInputDisplayed,
  };
};

const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchRunCode: runCode,
  dispatchSetInput: setInput,
  dispatchOpenInputSettings: openInputSettings,
  dispatchCloseInputSettings: closeInputSettings,
};

const StyledComponent = withStyles(StudentButtons.styles)(StudentButtons);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

export default withTranslation()(ConnectedComponent);
