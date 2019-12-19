import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import StudentView from './StudentView';
import FeedbackView from './FeedbackView';
import { DEFAULT_VIEW, FEEDBACK_VIEW } from '../../../config/views';
import {
  getAppInstanceResources,
  getFiles,
  registerWorker,
} from '../../../actions';
import Loader from '../../common/Loader';
import StudentButtons from './StudentButtons';
import MaximizableView from '../../layout/MaximizableView';
import { FILE } from '../../../config/appInstanceResourceTypes';

class StudentMode extends Component {
  static propTypes = {
    appInstanceId: PropTypes.string,
    view: PropTypes.string,
    activity: PropTypes.bool,
    dispatchGetAppInstanceResources: PropTypes.func.isRequired,
    dispatchRegisterWorker: PropTypes.func.isRequired,
    dispatchGetFiles: PropTypes.func.isRequired,
    userId: PropTypes.string,
    fullscreen: PropTypes.bool.isRequired,
    programmingLanguage: PropTypes.string.isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        uri: PropTypes.string,
      })
    ).isRequired,
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
      dispatchGetFiles,
      files,
    } = this.props;

    // get the resources for this user
    if (userId) {
      dispatchGetAppInstanceResources({ userId });
    }

    // register the worker
    dispatchRegisterWorker(programmingLanguage);

    // fetch the file system
    dispatchGetFiles(files);
  }

  componentDidUpdate(prevProps) {
    const {
      files: prevFiles,
      appInstanceId: prevAppInstanceId,
      programmingLanguage: prevProgrammingLanguage,
    } = prevProps;
    const {
      appInstanceId,
      dispatchGetAppInstanceResources,
      programmingLanguage,
      dispatchRegisterWorker,
      dispatchGetFiles,
      userId,
      files,
    } = this.props;

    // handle receiving the app instance id
    if (appInstanceId !== prevAppInstanceId) {
      if (userId) {
        dispatchGetAppInstanceResources({ userId });
      }
    }

    // handle changing programming language
    if (programmingLanguage !== prevProgrammingLanguage) {
      dispatchRegisterWorker(programmingLanguage);
    }

    if (!_.isEqual(files, prevFiles)) {
      // fetch missing files
      const missingFiles = _.differenceWith(files, prevFiles, _.isEqual);
      dispatchGetFiles(missingFiles);
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
          <MaximizableView>
            <StudentButtons />
            <StudentView fullscreen={fullscreen} />
          </MaximizableView>
        );
    }
  }
}
const mapStateToProps = ({ context, appInstanceResources, appInstance }) => {
  const { programmingLanguage } = appInstance.content.settings;
  const { userId, appInstanceId } = context;
  const files = appInstanceResources.content
    .filter(({ type }) => type === FILE)
    .map(({ data }) => data);

  return {
    userId,
    appInstanceId,
    programmingLanguage,
    files,
    activity: Boolean(appInstanceResources.activity.length),
  };
};

const mapDispatchToProps = {
  dispatchGetAppInstanceResources: getAppInstanceResources,
  dispatchRegisterWorker: registerWorker,
  dispatchGetFiles: getFiles,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StudentMode);

export default ConnectedComponent;
