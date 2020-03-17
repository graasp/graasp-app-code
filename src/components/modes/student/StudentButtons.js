import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactGa from 'react-ga';
import PropTypes from 'prop-types';
import { Fab, CircularProgress, Tooltip, withStyles } from '@material-ui/core';
import {
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon,
  VerticalSplit as VerticalSplitIcon,
  ViewHeadline as ViewHeadlineIcon,
} from '@material-ui/icons';
import { withRouter } from 'react-router';
import { DEFAULT_VIEW, FEEDBACK_VIEW } from '../../../config/views';
import { addQueryParamsToUrl } from '../../../utils/url';
import { FEEDBACK, INPUT } from '../../../config/appInstanceResourceTypes';
import { getContext, runCode, saveCode } from '../../../actions';
import { postAction } from '../../../actions/action';
import { VIEWED } from '../../../config/verbs';

class StudentButtons extends Component {
  static styles = theme => ({
    fab: {
      margin: theme.spacing(),
      position: 'fixed',
      zIndex: 1000,
      top: theme.spacing(2),
      right: theme.spacing(),
    },
    fab1: {
      top: theme.spacing(3) + 40,
    },
    fab2: {
      top: theme.spacing(4) + 2 * 40,
    },
    fab3: {
      top: theme.spacing(5) + 3 * 40,
    },
  });

  static propTypes = {
    classes: PropTypes.shape({
      fab: PropTypes.string,
      fab1: PropTypes.string,
      fab2: PropTypes.string,
      fab3: PropTypes.string,
      fab4: PropTypes.string,
    }).isRequired,
    t: PropTypes.func.isRequired,
    dispatchRunCode: PropTypes.func.isRequired,
    dispatchSaveCode: PropTypes.func.isRequired,
    dispatchPostAction: PropTypes.func.isRequired,
    dispatchGetContext: PropTypes.func.isRequired,
    currentCode: PropTypes.string.isRequired,
    savedCode: PropTypes.string,
    codeActivity: PropTypes.bool.isRequired,
    feedback: PropTypes.string,
    view: PropTypes.string,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    savedCode: '',
    feedback: null,
    view: DEFAULT_VIEW,
  };

  handleSave = () => {
    const { currentCode, savedCode } = this.props;

    if (currentCode !== savedCode) {
      this.handleSaveCode();
    }
  };

  handleSaveCode = () => {
    const { dispatchSaveCode, currentCode } = this.props;

    dispatchSaveCode({ currentCode });
  };

  handleRun = () => {
    const { currentCode, dispatchRunCode } = this.props;
    const job = { data: currentCode };

    dispatchRunCode(job);
  };

  handleNavigate = view => {
    const { dispatchGetContext, dispatchPostAction, history } = this.props;
    history.push(`index.html${addQueryParamsToUrl({ view })}`);
    dispatchGetContext();
    dispatchPostAction({
      verb: VIEWED,
      data: {
        view,
      },
    });
    ReactGa.event({
      category: 'code',
      action: VIEWED,
      value: view,
    });
  };

  render() {
    const {
      t,
      currentCode,
      savedCode,
      feedback,
      view,
      classes,
      codeActivity,
    } = this.props;

    const feedbackDisabled = !feedback;
    const isFeedbackView = view === FEEDBACK_VIEW;
    const saveDisabled = currentCode === savedCode || isFeedbackView;
    const runDisabled = _.isEmpty(currentCode) || isFeedbackView;

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
    ];

    if (codeActivity) {
      buttons.push(<CircularProgress className={classes.fab} key="progress" />);
    } else {
      buttons.push(
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
        </Fab>
      );
    }

    if (view === DEFAULT_VIEW && !feedbackDisabled) {
      buttons.unshift(
        <Fab
          onClick={() => this.handleNavigate(FEEDBACK_VIEW)}
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

    if (isFeedbackView) {
      buttons.unshift(
        <Fab
          onClick={() => this.handleNavigate(DEFAULT_VIEW)}
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

const mapStateToProps = ({ context, appInstanceResources, code }) => {
  const { userId, offline, appInstanceId } = context;
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  const feedbackResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === userId && type === FEEDBACK;
    }
  );

  return {
    offline,
    appInstanceId,
    feedback: feedbackResource && feedbackResource.data,
    mode: context.mode,
    view: context.view,
    currentCode: code.content,
    savedCode: inputResource && inputResource.data,
    codeActivity: Boolean(code.activity.length),
  };
};

const mapDispatchToProps = {
  dispatchRunCode: runCode,
  dispatchSaveCode: saveCode,
  dispatchGetContext: getContext,
  dispatchPostAction: postAction,
};

const StyledComponent = withStyles(StudentButtons.styles)(StudentButtons);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withRouter(TranslatedComponent);
