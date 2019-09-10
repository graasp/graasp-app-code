import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import ReactTerminal, { ReactThemes } from 'react-terminal-component';
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
    }).isRequired,
    ready: PropTypes.bool,
    activity: PropTypes.bool,
    output: PropTypes.string,
    orientation: PropTypes.oneOf([
      VERTICAL_ORIENTATION,
      HORIZONTAL_ORIENTATION,
    ]),
  };

  static defaultProps = {
    activity: false,
    ready: false,
    output: '',
    orientation: DEFAULT_ORIENTATION,
  };

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
        </Grid>
        <Grid item xs={12}>
          <ReactTerminal
            autoFocus={false}
            theme={{
              ...ReactThemes.hacker,
              spacing: '0',
              height: horizontalOrientation ? '50vh' : '100vh',
              width: horizontalOrientation ? '100vw' : '50vw',
            }}
            emulatorState={emulatorState}
          />
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = ({
  context,
  appInstanceResources,
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
    output: code.output,
  };
};

const mapDispatchToProps = {
  dispatchSetCode: setCode,
};

const StyledComponent = withStyles(styles)(StudentView);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

export default withTranslation()(ConnectedComponent);
