import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './TeacherView.css';
import { deleteAppInstanceResource, openFileSettings } from '../../../actions';
import { getUsers } from '../../../actions/users';
import FileSettings from './FileSettings';
import Uploader from '../../common/Uploader';
import { deleteFile } from '../../../actions/file';
import { PUBLIC_VISIBILITY } from '../../../config/settings';
import { FILE } from '../../../config/appInstanceResourceTypes';

export class TeacherView extends Component {
  static styles = theme => ({
    root: {
      marginTop: theme.spacing.unit * 3,
      overflowX: 'auto',
    },
    main: {
      textAlign: 'center',
      padding: theme.spacing.unit,
    },
    button: {
      marginTop: theme.spacing.unit * 3,
    },
    table: {
      minWidth: 700,
    },
    message: {
      padding: theme.spacing.unit,
      backgroundColor: theme.status.danger.background[500],
      color: theme.status.danger.color,
      marginBottom: theme.spacing.unit * 2,
    },
    fab: {
      margin: theme.spacing.unit,
      position: 'fixed',
      bottom: theme.spacing.unit * 2,
      right: theme.spacing.unit * 2,
    },
    teacherView: {
      marginBottom: '100px',
    },
  });

  static propTypes = {
    t: PropTypes.func.isRequired,
    dispatchOpenFileSettings: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      root: PropTypes.string,
      table: PropTypes.string,
      main: PropTypes.string,
      button: PropTypes.string,
      message: PropTypes.string,
      fab: PropTypes.string,
      teacherView: PropTypes.string,
    }).isRequired,
    dispatchGetUsers: PropTypes.func.isRequired,
    dispatchDeleteAppInstanceResource: PropTypes.func.isRequired,
    dispatchDeleteFile: PropTypes.func.isRequired,
    // inside the shape method you should put the shape
    // that the resources your app uses will have
    appInstanceResources: PropTypes.arrayOf(
      PropTypes.shape({
        // we need to specify number to avoid warnings with local server
        _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        appInstanceId: PropTypes.string,
        data: PropTypes.object,
      })
    ),
    // this is the shape of the select options for students
    users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  static defaultProps = {
    appInstanceResources: [],
  };

  constructor(props) {
    super(props);
    const { dispatchGetUsers } = this.props;
    dispatchGetUsers();
  }

  handleDelete = async ({ id, uri }) => {
    const {
      dispatchDeleteAppInstanceResource,
      dispatchDeleteFile,
    } = this.props;
    try {
      await dispatchDeleteAppInstanceResource(id);
      await dispatchDeleteFile(uri);
    } catch (e) {
      // do something
    }
  };

  renderActions({ visibility, id, uri }) {
    const { t } = this.props;
    const actions = [
      <IconButton
        key="delete"
        color="primary"
        onClick={() => this.handleDelete({ id, uri })}
      >
        <DeleteIcon />
      </IconButton>,
    ];
    if (visibility === PUBLIC_VISIBILITY) {
      actions.push(
        <Tooltip
          key="visibility"
          title={t('This file was uploaded for everyone.')}
        >
          <span>
            <IconButton color="primary">
              <VisibilityIcon />
            </IconButton>
          </span>
        </Tooltip>
      );
    }
    return actions;
  }

  renderAppInstanceResources() {
    const { appInstanceResources, users, t } = this.props;
    // if there are no resources, show an empty table
    if (!appInstanceResources.length) {
      return (
        <TableRow>
          <TableCell colSpan={4} align="center">
            {t('No files have been uploaded.')}
          </TableCell>
        </TableRow>
      );
    }
    // map each app instance resource to a row in the table
    return appInstanceResources.map(
      ({ _id: id, data: { name, uri }, user, createdAt, visibility }) => {
        const userObj = users.find(student => student.id === user) || {};
        return (
          <TableRow key={id}>
            <TableCell scope="row">
              {createdAt && new Date(createdAt).toLocaleString()}
            </TableCell>
            <TableCell>{userObj.name || t('Anonymous')}</TableCell>
            <TableCell>
              <a href={uri} target="_blank" rel="noopener noreferrer">
                {name}
              </a>
            </TableCell>
            <TableCell>{this.renderActions({ visibility, id, uri })}</TableCell>
          </TableRow>
        );
      }
    );
  }

  render() {
    const { classes, t, dispatchOpenFileSettings } = this.props;
    return (
      <div className={classes.teacherView}>
        <Grid container spacing={0}>
          <Grid item xs={12} className={classes.main}>
            <Grid item xs={12} className={classes.main}>
              <Uploader visibility={PUBLIC_VISIBILITY} />
            </Grid>
            <Paper className={classes.root}>
              <Table className={classes.table} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Date')}</TableCell>
                    <TableCell>{t('User')}</TableCell>
                    <TableCell>{t('File Name')}</TableCell>
                    <TableCell>{t('Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{this.renderAppInstanceResources()}</TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
        <FileSettings />
        <Fab
          color="primary"
          aria-label={t('Settings')}
          className={classes.fab}
          onClick={dispatchOpenFileSettings}
        >
          <SettingsIcon />
        </Fab>
      </div>
    );
  }
}

// get the app instance resources that are saved in the redux store
const mapStateToProps = ({ users, appInstanceResources }) => ({
  users: users.content,
  appInstanceResources: _.sortBy(
    appInstanceResources.content.filter(({ type }) => type === FILE),
    ['createdAt']
  ).reverse(),
});

// allow this component to dispatch a post
// request to create an app instance resource
const mapDispatchToProps = {
  dispatchGetUsers: getUsers,
  dispatchDeleteAppInstanceResource: deleteAppInstanceResource,
  dispatchOpenFileSettings: openFileSettings,
  dispatchDeleteFile: deleteFile,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(TeacherView);

const StyledComponent = withStyles(TeacherView.styles)(ConnectedComponent);

export default withTranslation()(StyledComponent);
