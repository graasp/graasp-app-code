import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import AceEditor from 'react-ace';
import {
  getAppInstanceResources,
  patchAppInstanceResource,
  postAppInstanceResource,
  setCode,
} from '../../../actions';
import { FEEDBACK, INPUT } from '../../../config/appInstanceResourceTypes';
import Loader from '../../common/Loader';
// import {
//   DEFAULT_MAX_INPUT_LENGTH,
//   DEFAULT_MAX_ROWS,
// } from '../../../config/settings';

const styles = theme => ({
  main: {
    textAlign: 'center',
    flex: 1,
    // 64px is the height of the header
    height: 'calc(100% - 64px)',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    overflowX: 'hidden',
  },
  message: {
    padding: theme.spacing.unit,
    backgroundColor: theme.status.danger.background[500],
    color: theme.status.danger.color,
    marginBottom: theme.spacing.unit * 2,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  button: {
    marginRight: theme.spacing.unit,
  },
});

class StudentView extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    dispatchGetAppInstanceResources: PropTypes.func.isRequired,
    dispatchSetCode: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      main: PropTypes.string,
      container: PropTypes.string,
      message: PropTypes.string,
      button: PropTypes.string,
      textField: PropTypes.string,
    }).isRequired,
    feedback: PropTypes.string,
    userId: PropTypes.string,
    ready: PropTypes.bool,
    activity: PropTypes.bool,
    code: PropTypes.string,
    appInstanceId: PropTypes.string,
  };

  static defaultProps = {
    feedback: '',
    userId: null,
    activity: false,
    ready: false,
    code: '',
    appInstanceId: null,
  };

  constructor(props) {
    super(props);
    const { userId } = props;
    // get the resources for this user
    props.dispatchGetAppInstanceResources({ userId });
  }

  onChange = code => {
    const { dispatchSetCode } = this.props;
    dispatchSetCode(code);
  };

  onLoad = () => {
    const { dispatchSetCode, code } = this.props;
    dispatchSetCode(code);
  };

  render() {
    const { t, classes, ready, code, activity, appInstanceId } = this.props;

    // todo: implement feedback
    let { feedback } = this.props;
    if (feedback && feedback !== '') {
      feedback = `${t('Feedback')}: ${feedback}`;
    }

    if (!ready || activity) {
      return <Loader />;
    }

    return (
      <div className={classes.main}>
        <AceEditor
          placeholder="function () { console.log('Placeholder Text'); }"
          mode="javascript"
          theme="xcode"
          name={appInstanceId || Math.random()}
          height="100%"
          width="100%"
          onLoad={this.onLoad}
          onChange={this.onChange}
          fontSize={14}
          showPrintMargin
          showGutter
          highlightActiveLine
          value={code || ''}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ context, appInstanceResources }) => {
  const { userId, offline, appInstanceId } = context;
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  const feedbackResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === userId && type === FEEDBACK;
    }
  );

  return {
    userId,
    offline,
    appInstanceId,
    inputResourceId: inputResource && (inputResource.id || inputResource._id),
    activity: Boolean(appInstanceResources.activity.length),
    ready: appInstanceResources.ready,
    code: inputResource && inputResource.data,
    feedback: feedbackResource && feedbackResource.data,
  };
};

const mapDispatchToProps = {
  dispatchGetAppInstanceResources: getAppInstanceResources,
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchSetCode: setCode,
};

const StyledComponent = withStyles(styles)(StudentView);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

export default withTranslation()(ConnectedComponent);
