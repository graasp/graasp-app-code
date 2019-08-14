import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import './TeacherView.css';
import {
  patchAppInstanceResource,
  postAppInstanceResource,
  deleteAppInstanceResource,
  getUsers,
  openSettings,
} from '../../../actions';
import Responses from './Responses';
import { INPUT } from '../../../config/appInstanceResourceTypes';
import Settings from './Settings';

export class TeacherView extends Component {
  static propTypes = {
    classes: PropTypes.shape({
      root: PropTypes.string,
      main: PropTypes.string,
      fab: PropTypes.string,
    }).isRequired,
    t: PropTypes.func.isRequired,
    dispatchGetUsers: PropTypes.func.isRequired,
    dispatchOpenSettings: PropTypes.func.isRequired,
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
    students: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      })
    ).isRequired,
  };

  static styles = theme => ({
    root: {
      width: '100%',
      marginTop: theme.spacing.unit * 3,
    },
    main: {
      textAlign: 'center',
      margin: theme.spacing.unit,
      padding: theme.spacing.unit,
      overflowX: 'hidden',
    },
    fab: {
      margin: theme.spacing.unit,
      position: 'fixed',
      bottom: theme.spacing.unit * 2,
      right: theme.spacing.unit * 2,
    },
  });

  constructor(props) {
    super(props);
    const { dispatchGetUsers } = this.props;
    dispatchGetUsers();
  }

  render() {
    // extract properties from the props object
    const {
      t,
      students,
      appInstanceResources,
      dispatchOpenSettings,
      // this property allows us to do styling and is injected by withStyles
      classes,
    } = this.props;
    return (
      <div>
        <Grid container spacing={0} className={classes.root}>
          <Grid item xs={12} className={classes.main}>
            <Responses
              students={students}
              appInstanceResources={appInstanceResources.filter(
                resource => resource.type === INPUT
              )}
            />
          </Grid>
        </Grid>
        <Settings />
        <Fab
          color="primary"
          aria-label={t('Settings')}
          className={classes.fab}
          onClick={dispatchOpenSettings}
        >
          <SettingsIcon />
        </Fab>
      </div>
    );
  }
}

TeacherView.defaultProps = {
  appInstanceResources: [],
};

// get the app instance resources that are saved in the redux store
const mapStateToProps = ({ users, appInstanceResources }) => ({
  students: users.content,
  appInstanceResources: appInstanceResources.content,
});

// allow this component to dispatch a post
// request to create an app instance resource
const mapDispatchToProps = {
  dispatchGetUsers: getUsers,
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchDeleteAppInstanceResource: deleteAppInstanceResource,
  dispatchOpenSettings: openSettings,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(TeacherView);

const StyledComponent = withStyles(TeacherView.styles)(ConnectedComponent);

export default withTranslation()(StyledComponent);
