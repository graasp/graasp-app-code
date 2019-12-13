import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { ReactTerminal, ReactThemes } from 'react-terminal-component';
import {
  setCode,
  printOutput,
  setInput,
  sendInput,
  registerWorker,
} from '../../../actions';
import {
  FEEDBACK,
  FILE,
  INPUT,
} from '../../../config/appInstanceResourceTypes';
import Loader from '../../common/Loader';
import Editor from './Editor';
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_ORIENTATION,
  FULL_SCREEN_FONT_SIZE,
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
});

// eslint-disable-next-line react/prefer-stateless-function
class StudentView extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    dispatchRegisterWorker: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      main: PropTypes.string,
      container: PropTypes.string,
      message: PropTypes.string,
      button: PropTypes.string,
      textField: PropTypes.string,
    }).isRequired,
    ready: PropTypes.bool,
    activity: PropTypes.bool,
    standalone: PropTypes.bool.isRequired,
    output: PropTypes.string,
    inputDisplayed: PropTypes.bool.isRequired,
    orientation: PropTypes.oneOf([
      VERTICAL_ORIENTATION,
      HORIZONTAL_ORIENTATION,
    ]),
    fullscreen: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    activity: false,
    ready: false,
    output: '',
    orientation: DEFAULT_ORIENTATION,
  };

  componentDidMount() {
    const { dispatchRegisterWorker } = this.props;
    // const { fileResources, dispatchRegisterWorker } = this.props;
    // console.log(fileResources);
    // const customFileSystem = Terminal.FileSystem.create({
    //   '/home': { },
    //   '/home/README': {content: 'This is a text file', canModify: false},
    //   '/home/nested/directory/file': {content: 'End of nested directory!'}
    // });
    dispatchRegisterWorker();
  }

  render() {
    const {
      t,
      classes,
      ready,
      activity,
      output,
      orientation,
      fullscreen,
      inputDisplayed,
      standalone,
    } = this.props;

    if (!standalone && (!ready || activity)) {
      return <Loader />;
    }

    // prepare output for printing in the terminal
    const textOutput = Terminal.OutputFactory.makeTextOutput(output);
    const customOutputs = Terminal.Outputs.create([textOutput]);
    const emulatorState = Terminal.EmulatorState.create({
      outputs: customOutputs,
      // fs: customFileSystem,
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
          <Editor fullscreen={fullscreen} />
        </Grid>
        <Collapse in={inputDisplayed}>
          <Grid item xs={12}>
            {t('Nothing Here Yet')}
          </Grid>
        </Collapse>
        <Collapse in={!inputDisplayed}>
          <Grid item xs={12}>
            <ReactTerminal
              autoFocus={false}
              clickToFocus
              theme={{
                ...ReactThemes.hacker,
                spacing: '0',
                height: horizontalOrientation ? '50vh' : '100vh',
                width: horizontalOrientation ? '100vw' : '50vw',
                fontSize: `${
                  fullscreen ? FULL_SCREEN_FONT_SIZE : DEFAULT_FONT_SIZE
                }px`,
              }}
              emulatorState={emulatorState}
            />
          </Grid>
        </Collapse>
      </Grid>
    );
  }
}

const mapStateToProps = ({
  context,
  appInstanceResources,
  layout,
  code,
  appInstance,
}) => {
  const { userId, offline, standalone } = context;
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  const feedbackResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === userId && type === FEEDBACK;
    }
  );
  const fileResources = appInstanceResources.content
    .filter(({ type }) => type === FILE)
    .map(({ data }) => data);

  const {
    content: {
      settings: { orientation },
    },
  } = appInstance;

  return {
    userId,
    offline,
    orientation,
    standalone,
    fileResources,
    inputResourceId: inputResource && (inputResource.id || inputResource._id),
    activity: Boolean(appInstanceResources.activity.length),
    ready: appInstanceResources.ready,
    feedback: feedbackResource && feedbackResource.data,
    output: code.output,
    inputDisplayed: layout.settings.inputDisplayed,
  };
};

const mapDispatchToProps = {
  dispatchSetCode: setCode,
  dispatchSetInput: setInput,
  dispatchSendInput: sendInput,
  dispatchPrintOutput: printOutput,
  dispatchRegisterWorker: registerWorker,
};

const StyledComponent = withStyles(styles)(StudentView);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

export default withTranslation()(ConnectedComponent);
