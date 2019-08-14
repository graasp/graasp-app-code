import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Response from './Response';

class Responses extends Component {
  static styles = theme => ({
    root: {
      width: '100%',
      marginTop: theme.spacing.unit * 3,
      overflowX: 'auto',
    },
    table: {
      minWidth: 700,
    },
  });

  static propTypes = {
    t: PropTypes.func.isRequired,
    appInstanceResources: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        data: PropTypes.string,
        type: PropTypes.string,
      })
    ),
    students: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      })
    ),
    classes: PropTypes.shape({
      root: PropTypes.string,
      table: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    appInstanceResources: [],
    students: [],
  };

  renderAppInstanceResources() {
    const { t, students, appInstanceResources } = this.props;

    // if there are no resources, show an empty table
    if (!appInstanceResources.length) {
      return (
        <TableRow>
          <TableCell align="center" colSpan={4}>
            {t('No Responses')}
          </TableCell>
        </TableRow>
      );
    }

    const anonymousUser = {
      name: t('Anonymous'),
    };

    // map each app instance resource to a row in the table
    return appInstanceResources.map(({ _id, user, data }) => {
      const studentObject =
        students.find(student => student.id === user) || anonymousUser;
      return (
        <Response _id={_id} key={_id} student={studentObject} data={data} />
      );
    });
  }

  render() {
    const {
      // this property allows us to do styling and is injected by withStyles
      classes,
      // this property allows us to do translations and is injected by i18next
      t,
    } = this.props;
    return (
      <div>
        <Typography variant="h6" color="inherit">
          {t('These are the responses submitted by the students.')}
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{t('Student')}</TableCell>
                <TableCell>{t('Input')}</TableCell>
                <TableCell>{t('Feedback')}</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{this.renderAppInstanceResources()}</TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

const StyledComponent = withStyles(Responses.styles)(Responses);

export default withTranslation()(StyledComponent);
