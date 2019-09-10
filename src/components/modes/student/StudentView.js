import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { ReactTerminalStateless, ReactThemes } from 'react-terminal-component';
import AceEditor from 'react-ace';
import { setCode, printOutput, setInput, sendInput } from '../../../actions';
import {
  FEEDBACK,
  INPUT,
  STDIN,
} from '../../../config/appInstanceResourceTypes';
import { setCode } from '../../../actions';
import { FEEDBACK, INPUT } from '../../../config/appInstanceResourceTypes';
import Loader from '../../common/Loader';
import Editor from './Editor';
import {
  DEFAULT_ORIENTATION,
  HORIZONTAL_ORIENTATION,
  VERTICAL_ORIENTATION,
} from '../../../config/settings';

const Terminal = require('javascript-terminal');

const styles = theme => ({
  main: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  message: {
    padding: theme.spacing.unit,
    backgroundColor: theme.status.danger.background[500],
    color: theme.status.danger.color,
    marginBottom: theme.spacing.unit * 2,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  helperText: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginTop: '8px',
  },
});

// eslint-disable-next-line react/prefer-stateless-function
class StudentView extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    dispatchPrintOutput: PropTypes.func.isRequired,
    dispatchSetInput: PropTypes.func.isRequired,
    dispatchSendInput: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      main: PropTypes.string,
      container: PropTypes.string,
      message: PropTypes.string,
      button: PropTypes.string,
      textField: PropTypes.string,
    }).isRequired,
    appInstanceId: PropTypes.string.isRequired,
    ready: PropTypes.bool,
    activity: PropTypes.bool,
    output: PropTypes.string,
    stdin: PropTypes.string,
    isInputDisplayed: PropTypes.bool.isRequired,
    orientation: PropTypes.oneOf([
      VERTICAL_ORIENTATION,
      HORIZONTAL_ORIENTATION,
    ]),
  };

  static defaultProps = {
    activity: false,
    ready: false,
    output: '',
    stdin: '',
    orientation: DEFAULT_ORIENTATION,
  };

  // this handler is called for each new input character
  // new line character is not received here
  handleTerminalInput = c => {
    const { dispatchPrintOutput, dispatchSendInput } = this.props;

    // echo back new character
    dispatchPrintOutput(c);

    // send a new character to worker
    dispatchSendInput(c);
  };

  // this handler is called for each new line character
  handleTerminalStateChange = () => {
    const { dispatchPrintOutput, dispatchSendInput } = this.props;
    const c = '\n';

    // echo back new line character
    dispatchPrintOutput(c);

    // send a new line to worker
    dispatchSendInput(c);
  };

  onStdinLoad = () => {
    const { dispatchSetInput, stdin } = this.props;
    dispatchSetInput(stdin || '');

  };

  onStdinChange = value => {
    const { dispatchSetInput } = this.props;
    dispatchSetInput(value);
  };

  renderInput() {
    const { t, classes, appInstanceId, stdin, isInputDisplayed } = this.props;

    return (
      <Collapse in={isInputDisplayed}>
        <Typography variant="subtitle2" id="stdin-caption">
          <div className={classes.helperText}>{t('input data')}</div>
        </Typography>
        <AceEditor
          placeholder={t('// Write input data here (ex. csv, json, xml, etc.)')}
          mode="csv"
          theme="xcode"
          name={appInstanceId || Math.random()}
          width="100%"
          height="120px"
          fontSize={14}
          showPrintMargin
          showGutter
          highlightActiveLine
          value={stdin || ''}
          onLoad={this.onStdinLoad}
          onChange={this.onStdinChange}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </Collapse>
    );
  }

  render() {
    const { classes, ready, activity, output, orientation } = this.props;

    if (!ready || activity) {
      return <Loader />;
    }

    // prepare output for printing in the terminal
    const textOutput = Terminal.OutputFactory.makeTextOutput(output);
    const customOutputs = Terminal.Outputs.create([textOutput]);
    const emulatorState = Terminal.EmulatorState.create({
      outputs: customOutputs,
    });

    const horizontalOrientation = orientation === HORIZONTAL_ORIENTATION;
    return (
      <Grid
        container
        className={classes.main}
        spacing={0}
        direction={horizontalOrientation ? 'row' : 'column'}
      >
        <Grid item xs={12}>
          <Editor />
          <div>{this.renderInput()}</div>
        </Grid>
        <Grid item xs={12}>
          <ReactTerminalStateless
            autoFocus={false}
            acceptInput={true}
            clickToFocus={true}
              theme={{
              ...ReactThemes.hacker,
              spacing: '0',
              height: horizontalOrientation ? '50vh' : '100vh',
              width: horizontalOrientation ? '100vw' : '50vw',
            }}
            emulatorState={emulatorState}
            onInputChange={this.handleTerminalInput}
            onStateChange={this.handleTerminalStateChange}
            />
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = ({
  context,
  appInstanceResources,
  layout
  code,
  appInstance,
}) => {
  const { userId, offline, appInstanceId } = context;
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  const feedbackResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === userId && type === FEEDBACK;
    }
  );
  const stdinResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === STDIN;
  });
  const {
    content: {
      settings: { orientation },
    },
  } = appInstance;

  return {
    userId,
    offline,
    appInstanceId,
    orientation,
    inputResourceId: inputResource && (inputResource.id || inputResource._id),
    activity: Boolean(appInstanceResources.activity.length),
    ready: appInstanceResources.ready,
    feedback: feedbackResource && feedbackResource.data,
    stdin: stdinResource && stdinResource.data,
    output: code.output,
    isInputDisplayed: layout.settings.isInputDisplayed,
  };
};

const mapDispatchToProps = {
  dispatchSetCode: setCode,
  dispatchSetInput: setInput,
  dispatchSendInput: sendInput,
  dispatchPrintOutput: printOutput,
};

const StyledComponent = withStyles(styles)(StudentView);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

export default withTranslation()(ConnectedComponent);
