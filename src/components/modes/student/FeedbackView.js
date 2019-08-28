import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import ReactTerminal, { ReactThemes } from 'react-terminal-component';
import Loader from '../../common/Loader';
import DiffEditor from '../../common/DiffEditor';

const Terminal = require('javascript-terminal');

const styles = theme => ({
  main: {
    flex: 1,
    height: '100%',
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
  };

  static defaultProps = {
    activity: false,
    ready: false,
    output: '',
  };

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
        <DiffEditor />
        <ReactTerminal
          autoFocus={false}
          theme={{
            ...ReactThemes.hacker,
            width: '100%',
            height: '50%',
            spacing: '0',
          }}
          emulatorState={emulatorState}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ appInstanceResources, code }) => {
  return {
    activity: Boolean(appInstanceResources.activity.length),
    ready: appInstanceResources.ready,
    output: code.output,
  };
};

const StyledComponent = withStyles(styles)(StudentView);

const ConnectedComponent = connect(mapStateToProps)(StyledComponent);

export default withTranslation()(ConnectedComponent);
