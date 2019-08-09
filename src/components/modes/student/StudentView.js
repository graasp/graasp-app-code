import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { addQueryParamsToUrl } from '../../../utils/url';

const styles = theme => ({
  main: {
    textAlign: 'center',
    margin: theme.spacing.unit,
  },
  message: {
    padding: theme.spacing.unit,
    backgroundColor: theme.status.danger.background[500],
    color: theme.status.danger.color,
    marginBottom: theme.spacing.unit * 2,
  },
});

export const StudentView = ({ t, classes }) => (
  <Grid container spacing={24}>
    <Grid item xs={12} className={classes.main}>
      <Paper className={classes.message}>
        {t(
          'This is the student view. Switch to the teacher view by clicking on the URL below.'
        )}
        <a href={addQueryParamsToUrl({ mode: 'teacher' })}>
          <pre>
            {`${window.location.host}/${addQueryParamsToUrl({
              mode: 'teacher',
            })}`}
          </pre>
        </a>
      </Paper>
    </Grid>
  </Grid>
);

StudentView.propTypes = {
  t: PropTypes.func.isRequired,
  classes: PropTypes.shape({
    main: PropTypes.object,
    message: PropTypes.object,
  }).isRequired,
};

const StyledComponent = withStyles(styles)(StudentView);

export default withTranslation()(StyledComponent);
