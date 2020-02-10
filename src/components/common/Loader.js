import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

const styles = theme => ({
  root: {
    textAlign: 'center',
    flex: 1,
    margin: theme.spacing(4),
  },
});

const Loader = ({ classes }) => (
  <Grid container spacing={0}>
    <Grid item xs={12} className={classes.root}>
      <CircularProgress />
    </Grid>
  </Grid>
);

Loader.propTypes = {
  classes: PropTypes.shape({ root: PropTypes.string }).isRequired,
};

const StyledComponent = withStyles(styles)(Loader);

export default StyledComponent;
