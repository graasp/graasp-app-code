import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import Select from 'react-select';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './TeacherView.css';
import {
  patchAppInstanceResource,
  postAppInstanceResource,
  deleteAppInstanceResource,
} from '../../../actions';
import { getUsers } from '../../../actions/users';
import { addQueryParamsToUrl } from '../../../utils/url';

/**
 * helper method to render the rows of the app instance resource table
 * @param appInstanceResources
 * @param dispatchPatchAppInstanceResource
 * @param dispatchDeleteAppInstanceResource
 * @returns {*}
 */
const renderAppInstanceResources = (
  appInstanceResources,
  { dispatchPatchAppInstanceResource, dispatchDeleteAppInstanceResource }
) => {
  // if there are no resources, show an empty table
  if (!appInstanceResources.length) {
    return (
      <TableRow>
        <TableCell colSpan={4}>No App Instance Resources</TableCell>
      </TableRow>
    );
  }
  // map each app instance resource to a row in the table
  return appInstanceResources.map(({ _id, appInstance, data }) => (
    <TableRow key={_id}>
      <TableCell scope="row">{_id}</TableCell>
      <TableCell>{appInstance}</TableCell>
      <TableCell>{data.value}</TableCell>
      <TableCell>
        <IconButton
          color="primary"
          onClick={() =>
            dispatchPatchAppInstanceResource({
              id: _id,
              data: { value: Math.random() },
            })
          }
        >
          <RefreshIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={() => dispatchDeleteAppInstanceResource(_id)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ));
};

const generateRandomAppInstanceResource = ({
  dispatchPostAppInstanceResource,
}) => {
  dispatchPostAppInstanceResource({
    data: { value: Math.random() },
  });
};

export class TeacherView extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      root: PropTypes.object,
      table: PropTypes.object,
      main: PropTypes.object,
      button: PropTypes.object,
      message: PropTypes.object,
    }).isRequired,
    dispatchGetUsers: PropTypes.func.isRequired,
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
    studentOptions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      })
    ).isRequired,
  };

  static styles = theme => ({
    root: {
      width: '100%',
      marginTop: theme.spacing.unit * 3,
      overflowX: 'auto',
    },
    main: {
      textAlign: 'center',
      margin: theme.spacing.unit,
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
  });

  state = {
    selectedStudent: null,
  };

  constructor(props) {
    super(props);
    const { dispatchGetUsers } = this.props;
    dispatchGetUsers();
  }

  handleChangeStudent = value => {
    this.setState({
      selectedStudent: value,
    });
  };

  render() {
    // extract properties from the props object
    const {
      // this property allows us to do styling and is injected by withStyles
      classes,
      // this property allows us to do translations and is injected by i18next
      t,
      // these properties are injected by the redux mapStateToProps method
      appInstanceResources,
      studentOptions,
    } = this.props;
    const { selectedStudent } = this.state;
    return (
      <Grid container spacing={24}>
        <Grid item xs={12} className={classes.main}>
          <Paper className={classes.message}>
            {t(
              'This is the teacher view. Switch to the student view by clicking on the URL below.'
            )}
            <a href={addQueryParamsToUrl({ mode: 'student' })}>
              <pre>
                {`${window.location.host}/${addQueryParamsToUrl({
                  mode: 'student',
                })}`}
              </pre>
            </a>
          </Paper>
          <Typography variant="h5" color="inherit">
            {t('View the Students in the Sample Space')}
          </Typography>
          <Select
            className="StudentSelect"
            value={selectedStudent}
            options={studentOptions}
            onChange={this.handleChangeStudent}
            isClearable
          />
          <hr />
          <Typography variant="h6" color="inherit">
            {t(
              'This table illustrates how an app can save resources on the server.'
            )}
          </Typography>
          <Paper className={classes.root}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>App Instance</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderAppInstanceResources(appInstanceResources, this.props)}
              </TableBody>
            </Table>
          </Paper>
          <Button
            color="primary"
            className={classes.button}
            variant="contained"
            onClick={() => generateRandomAppInstanceResource(this.props)}
          >
            {t('Save a Random App Instance Resource via the API')}
          </Button>
        </Grid>
      </Grid>
    );
  }
}

TeacherView.defaultProps = {
  appInstanceResources: [],
};

// get the app instance resources that are saved in the redux store
const mapStateToProps = ({ users, appInstanceResources }) => ({
  // we transform the list of students in the database
  // to the shape needed by the select component
  studentOptions: users.content.map(({ id, name }) => ({
    value: id,
    label: name,
  })),
  appInstanceResources: appInstanceResources.content,
});

// allow this component to dispatch a post
// request to create an app instance resource
const mapDispatchToProps = {
  dispatchGetUsers: getUsers,
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchDeleteAppInstanceResource: deleteAppInstanceResource,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(TeacherView);

const StyledComponent = withStyles(TeacherView.styles)(ConnectedComponent);

export default withTranslation()(StyledComponent);
