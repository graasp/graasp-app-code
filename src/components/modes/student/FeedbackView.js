import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import Loader from '../../common/Loader';
import DiffEditor from '../../common/DiffEditor';

const styles = () => ({
  main: {
    flexGrow: 1,
    height: '100%',
    width: '100%',
    background: 'white',
  },
});

// eslint-disable-next-line react/prefer-stateless-function
class FeedbackView extends Component {
  static propTypes = {
    classes: PropTypes.shape({
      main: PropTypes.string,
    }).isRequired,
    fullscreen: PropTypes.bool.isRequired,
    ready: PropTypes.bool,
    activity: PropTypes.bool,
  };

  static defaultProps = {
    activity: false,
    ready: false,
  };

  render() {
    const { classes, ready, activity, fullscreen } = this.props;

    if (!ready || activity) {
      return <Loader />;
    }

    return (
      <div className={classes.main}>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <DiffEditor fullscreen={fullscreen} />
          </Grid>
        </Grid>
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

const StyledComponent = withStyles(styles)(FeedbackView);

const ConnectedComponent = connect(mapStateToProps)(StyledComponent);

export default withTranslation()(ConnectedComponent);
