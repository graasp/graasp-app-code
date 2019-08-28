import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import StudentView from './StudentView';
import FeedbackView from './FeedbackView';
import { DEFAULT_VIEW, FEEDBACK_VIEW } from '../../../config/views';
import { getAppInstanceResources } from '../../../actions';
import Loader from '../../common/Loader';

class StudentMode extends Component {
  static propTypes = {
    appInstanceId: PropTypes.string,
    view: PropTypes.string,
    activity: PropTypes.number,
    userId: PropTypes.string,
    dispatchGetAppInstanceResources: PropTypes.func.isRequired,
  };

  static defaultProps = {
    view: 'normal',
    appInstanceId: null,
    activity: 0,
    userId: null,
  };

  constructor(props) {
    super(props);
    const { userId } = props;
    // get the resources for this user
    props.dispatchGetAppInstanceResources({ userId });
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
      case FEEDBACK_VIEW:
        return <FeedbackView />;
      case DEFAULT_VIEW:
      default:
        return <StudentView />;
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
)(StudentMode);

export default ConnectedComponent;
