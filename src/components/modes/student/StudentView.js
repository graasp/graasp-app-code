import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import {
  setCode,
  printOutput,
  setInput,
  sendInput,
  closeInputPrompt,
} from '../../../actions';
import { FEEDBACK, INPUT } from '../../../config/appInstanceResourceTypes';
import Loader from '../../common/Loader';
import Editor from './Editor';
import Figures from './Figures';
import Terminal from '../../common/Terminal';
import FormDialog from '../../common/FormDialog';

const styles = theme => ({
  main: {
    flexGrow: 1,
    height: '100%',
    width: '100%',
  },
  message: {
    padding: theme.spacing(),
    backgroundColor: theme.status.danger.background[500],
    color: theme.status.danger.color,
    marginBottom: theme.spacing(2),
  },
  textField: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
  button: {
    marginRight: theme.spacing(),
  },
  figures: {
    height: '50vh',
    width: '50vw',
    borderLeft: 'solid black 1px',
    overflow: 'scroll',
  },
});

// eslint-disable-next-line react/prefer-stateless-function
class StudentView extends Component {
  static propTypes = {
    classes: PropTypes.shape({
      main: PropTypes.string,
      container: PropTypes.string,
      message: PropTypes.string,
      button: PropTypes.string,
      textField: PropTypes.string,
      figures: PropTypes.string,
    }).isRequired,
    ready: PropTypes.bool,
    activity: PropTypes.bool,
    standalone: PropTypes.bool.isRequired,
    fullscreen: PropTypes.bool.isRequired,
    inputPromptOpen: PropTypes.bool.isRequired,
    inputPromptText: PropTypes.string.isRequired,
    figuresDisplayed: PropTypes.bool.isRequired,
    dispatchCloseInputPrompt: PropTypes.func.isRequired,
    worker: PropTypes.shape({
      submitInput: PropTypes.func,
      cancelInput: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    activity: false,
    ready: false,
  };

  render() {
    const {
      classes,
      ready,
      activity,
      fullscreen,
      standalone,
      figuresDisplayed,
      inputPromptOpen,
      inputPromptText,
      worker,
      dispatchCloseInputPrompt,
    } = this.props;

    if (!standalone && (!ready || activity)) {
      return <Loader />;
    }

    return (
      <div className={classes.main}>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <Editor fullscreen={fullscreen} />
          </Grid>
          <Grid item container xs={6}>
            <Grid item xs={12}>
              <Terminal fullscreen={fullscreen} />
            </Grid>
            <Collapse in={figuresDisplayed}>
              <Grid item xs={12}>
                <Grid container className={classes.figures} justify="center">
                  <Figures />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
        <FormDialog
          handleCancel={() => {
            worker.cancelInput();
            dispatchCloseInputPrompt();
          }}
          label="Input"
          text={inputPromptText}
          open={inputPromptOpen}
          handleSubmit={res => {
            worker.submitInput(res);
            dispatchCloseInputPrompt();
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ context, appInstanceResources, layout, code }) => {
  const { userId, offline, standalone } = context;
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
    offline,
    standalone,
    inputResourceId: inputResource && (inputResource.id || inputResource._id),
    activity: Boolean(appInstanceResources.activity.length),
    ready: appInstanceResources.ready,
    feedback: feedbackResource && feedbackResource.data,
    inputDisplayed: layout.settings.inputDisplayed,
    figuresDisplayed: Boolean(code.figures.length),
    inputPromptOpen: layout.inputPrompt.open,
    inputPromptText: layout.inputPrompt.text,
    worker: code.worker,
  };
};

const mapDispatchToProps = {
  dispatchSetCode: setCode,
  dispatchSetInput: setInput,
  dispatchSendInput: sendInput,
  dispatchPrintOutput: printOutput,
  dispatchCloseInputPrompt: closeInputPrompt,
};

const StyledComponent = withStyles(styles)(StudentView);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

export default withTranslation()(ConnectedComponent);
