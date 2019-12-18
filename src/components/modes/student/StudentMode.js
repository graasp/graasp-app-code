import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import StudentView from './StudentView';
import FeedbackView from './FeedbackView';
import { DEFAULT_VIEW, FEEDBACK_VIEW } from '../../../config/views';
import { getAppInstanceResources, registerWorker } from '../../../actions';
import Loader from '../../common/Loader';
import StudentButtons from './StudentButtons';

class StudentMode extends Component {
  static propTypes = {
    appInstanceId: PropTypes.string,
    view: PropTypes.string,
    activity: PropTypes.bool,
    dispatchGetAppInstanceResources: PropTypes.func.isRequired,
    dispatchRegisterWorker: PropTypes.func.isRequired,
    userId: PropTypes.string,
    fullscreen: PropTypes.bool.isRequired,
    programmingLanguage: PropTypes.string.isRequired,
  };

  static defaultProps = {
    view: 'normal',
    appInstanceId: null,
    activity: false,
    userId: null,
  };

  componentDidMount() {
    const {
      userId,
      programmingLanguage,
      dispatchRegisterWorker,
      dispatchGetAppInstanceResources,
    } = this.props;

    // get the resources for this user
    dispatchGetAppInstanceResources({ userId });

    // register the worker
    dispatchRegisterWorker(programmingLanguage);
  }

  componentDidUpdate(prevProps) {
    const {
      appInstanceId: prevAppInstanceId,
      programmingLanguage: prevProgrammingLanguage,
    } = prevProps;
    const {
      appInstanceId,
      dispatchGetAppInstanceResources,
      programmingLanguage,
      dispatchRegisterWorker,
      userId,
    } = this.props;

    // handle receiving the app instance id
    if (appInstanceId !== prevAppInstanceId) {
      dispatchGetAppInstanceResources({ userId });
    }

    // handle changing programming language
    if (programmingLanguage !== prevProgrammingLanguage) {
      dispatchRegisterWorker(programmingLanguage);
    }
  }

  render() {
    const { view, activity, fullscreen } = this.props;
    if (activity) {
      return <Loader />;
    }
    switch (view) {
      case FEEDBACK_VIEW:
        return (
          <>
            <StudentButtons />
            <FeedbackView fullscreen={fullscreen} />
          </>
        );
      case DEFAULT_VIEW:
      default:
        return (
          <>
            <StudentButtons />
            <StudentView fullscreen={fullscreen} />
          </>
        );
    }
  }
}
const mapStateToProps = ({ context, appInstanceResources, appInstance }) => {
  const { programmingLanguage } = appInstance.content.settings;
  const { userId, appInstanceId } = context;
  return {
    userId,
    appInstanceId,
    programmingLanguage,
    activity: Boolean(appInstanceResources.activity.length),
  };
};

const mapDispatchToProps = {
  dispatchGetAppInstanceResources: getAppInstanceResources,
  dispatchRegisterWorker: registerWorker,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StudentMode);

export default ConnectedComponent;
