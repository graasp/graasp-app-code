import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { ReactTerminal, ReactThemes } from 'react-terminal-component';
import { setCode, printOutput, setInput, sendInput } from '../../../actions';
import { FEEDBACK, INPUT } from '../../../config/appInstanceResourceTypes';
import Loader from '../../common/Loader';
import Editor from './Editor';
import {
  DEFAULT_FONT_SIZE,
  FULL_SCREEN_FONT_SIZE,
} from '../../../config/settings';
import Figures from './Figures';

const Terminal = require('javascript-terminal');

const styles = theme => ({
  main: {
    flexGrow: 1,
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
    output: PropTypes.string,
    fullscreen: PropTypes.bool.isRequired,
    figuresDisplayed: PropTypes.bool.isRequired,
    // fs is an object of unpredictable shape
    // eslint-disable-next-line react/forbid-prop-types
    fs: PropTypes.object.isRequired,
  };

  static defaultProps = {
    activity: false,
    ready: false,
    output: '',
  };

  render() {
    const {
      classes,
      ready,
      activity,
      output,
      fullscreen,
      standalone,
      figuresDisplayed,
      fs,
    } = this.props;

    if (!standalone && (!ready || activity)) {
      return <Loader />;
    }

    // prepare output for printing in the terminal
    const textOutput = Terminal.OutputFactory.makeTextOutput(output);
    const customOutputs = Terminal.Outputs.create([textOutput]);
    const emulatorState = Terminal.EmulatorState.create({
      outputs: customOutputs,
      fs: Terminal.FileSystem.create(fs),
    });

    return (
      <div className={classes.main}>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <Editor fullscreen={fullscreen} />
          </Grid>
          <Grid item container xs={6}>
            <Grid item xs={12}>
              <ReactTerminal
                autoFocus={false}
                clickToFocus
                theme={{
                  ...ReactThemes.hacker,
                  spacing: '0',
                  height: figuresDisplayed ? '50vh' : '100vh',
                  width: '50vw',
                  fontSize: `${
                    fullscreen ? FULL_SCREEN_FONT_SIZE : DEFAULT_FONT_SIZE
                  }px`,
                }}
                emulatorState={emulatorState}
              />
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
    output: code.output,
    inputDisplayed: layout.settings.inputDisplayed,
    figuresDisplayed: Boolean(code.figures.length),
    fs: code.fs,
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
