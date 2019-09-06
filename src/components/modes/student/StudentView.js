import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { ReactTerminalStateless, ReactThemes } from 'react-terminal-component';
import AceEditor from 'react-ace';
import { setCode, printOutput, setInput, appendInput } from '../../../actions';
import {
  FEEDBACK,
  INPUT,
  STDIN,
} from '../../../config/appInstanceResourceTypes';
import Loader from '../../common/Loader';
import Editor from './Editor';
// import {
//   DEFAULT_MAX_INPUT_LENGTH,
//   DEFAULT_MAX_ROWS,
// } from '../../../config/settings';

const Terminal = require('javascript-terminal');

const styles = theme => ({
  main: {
    flex: 1,
    // 64px is the height of the header
    height: 'calc(100% - 64px)',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    overflowX: 'hidden',
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
    dispatchAppendInput: PropTypes.func.isRequired,
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
  };

  static defaultProps = {
    activity: false,
    ready: false,
    output: '',
    stdin: '',
  };

  // this handler is called for each new input character
  // new line character is not received here
  handleTerminalInput = c => {
    const { dispatchPrintOutput, dispatchAppendInput } = this.props;

    // echo back new character
    dispatchPrintOutput(c);

    // send a new character to worker (or just buffering ?)
    dispatchAppendInput(c);
  };

  // this handler is called for each new line character
  handleTerminalStateChange = () => {
    const { dispatchPrintOutput, dispatchAppendInput } = this.props;
    const c = '\n';

    // echo back new line character
    dispatchPrintOutput(c);

    // send a new line to worker (or just send new line character ?)
    dispatchAppendInput(c);
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
    const { t, classes, appInstanceId, stdin } = this.props;

    return (
      <div>
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
      </div>
    );
  }

  render() {
    const { classes, ready, activity, output } = this.props;

    if (!ready || activity) {
      return <Loader />;
    }

    // prepare output for printing in the terminal
    const textOutput = Terminal.OutputFactory.makeTextOutput(output);
    const customOutputs = Terminal.Outputs.create([textOutput]);
    const emulatorState = Terminal.EmulatorState.create({
      outputs: customOutputs,
    });

    return (
      <div className={classes.main}>
        <Editor />
        <div>{this.renderInput()}</div>
        <ReactTerminalStateless
          theme={{
            ...ReactThemes.hacker,
            width: '100%',
            height: '50%',
            spacing: '0',
          }}
          emulatorState={emulatorState}
          onInputChange={this.handleTerminalInput}
          onStateChange={this.handleTerminalStateChange}
          acceptInput="true"
          clickToFocus="true"
        />
      </div>
    );
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
  const stdinResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === STDIN;
  });

  return {
    userId,
    offline,
    appInstanceId,
    inputResourceId: inputResource && (inputResource.id || inputResource._id),
    activity: Boolean(appInstanceResources.activity.length),
    ready: appInstanceResources.ready,
    code: inputResource && inputResource.data,
    feedback: feedbackResource && feedbackResource.data,
    stdin: stdinResource && stdinResource.data,
    output: code.output,
  };
};

const mapDispatchToProps = {
  dispatchSetCode: setCode,
  dispatchSetInput: setInput,
  dispatchAppendInput: appendInput,
  dispatchPrintOutput: printOutput,
};

const StyledComponent = withStyles(styles)(StudentView);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

export default withTranslation()(ConnectedComponent);
