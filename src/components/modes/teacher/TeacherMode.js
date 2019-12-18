import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TeacherView from './TeacherView';
import TeacherDashboard from './TeacherDashboard';
import {
  DEFAULT_VIEW,
  DASHBOARD_VIEW,
  FILES_VIEW,
} from '../../../config/views';
import { getAppInstanceResources } from '../../../actions';
import Loader from '../../common/Loader';
import TeacherFiles from './TeacherFiles';

class TeacherMode extends Component {
  static propTypes = {
    appInstanceId: PropTypes.string,
    view: PropTypes.string,
    activity: PropTypes.bool,
    dispatchGetAppInstanceResources: PropTypes.func.isRequired,
  };

  static defaultProps = {
    view: 'normal',
    appInstanceId: null,
    activity: false,
  };

  // here we synchronise between the language stored in the app
  // instance's settings and the one set for the code environment
  // noting that the calls to fetch the app instance have been
  // done within the app component
  componentDidMount() {
    const { dispatchGetAppInstanceResources } = this.props;

    // get all of the resources
    dispatchGetAppInstanceResources();
  }

  componentDidUpdate({ appInstanceId: prevAppInstanceId }) {
    const { appInstanceId, dispatchGetAppInstanceResources } = this.props;
    // handle receiving the app instance id
    if (appInstanceId !== prevAppInstanceId) {
      dispatchGetAppInstanceResources();
    }
  }

  render() {
    const { view, activity } = this.props;
    if (activity) {
      return <Loader />;
    }
    switch (view) {
      case DASHBOARD_VIEW:
        return <TeacherDashboard />;
      case FILES_VIEW:
        return <TeacherFiles />;
      case DEFAULT_VIEW:
      default:
        return <TeacherView />;
    }
  }
}
const mapStateToProps = ({ context, appInstanceResources }) => ({
  appInstanceId: context.appInstanceId,
  activity: appInstanceResources.activity.length,
});

const mapDispatchToProps = {
  dispatchGetAppInstanceResources: getAppInstanceResources,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(TeacherMode);

export default ConnectedComponent;
