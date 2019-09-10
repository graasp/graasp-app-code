import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MonacoDiffEditor } from 'react-monaco-editor';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { FEEDBACK, INPUT } from '../../config/appInstanceResourceTypes';
import { setCode } from '../../actions';
import { DEFAULT_PROGRAMMING_LANGUAGE } from '../../config/programmingLanguages';

class DiffEditor extends Component {
  static propTypes = {
    dispatchSetCode: PropTypes.func.isRequired,
    code: PropTypes.string,
    feedback: PropTypes.string,
    programmingLanguage: PropTypes.string,
    appInstanceId: PropTypes.string,
  };

  static defaultProps = {
    code: '',
    feedback: '',
    appInstanceId: null,
    programmingLanguage: DEFAULT_PROGRAMMING_LANGUAGE,
  };

  constructor(props) {
    super(props);
    const { dispatchSetCode, code } = props;
    dispatchSetCode(code);
  }

  onChange = code => {
    const { dispatchSetCode } = this.props;
    dispatchSetCode(code);
  };

  render() {
    const { code, programmingLanguage, appInstanceId, feedback } = this.props;
    const options = {
      renderSideBySide: true,
      originalEditable: false,
    };
    return (
      <MonacoDiffEditor
        name={appInstanceId || Math.random()}
        onChange={this.onChange}
        original={feedback}
        options={options}
        value={code}
        height="50%"
        width="100%"
        language={programmingLanguage}
      />
    );
  }
}

const mapStateToProps = ({ appInstance, context, appInstanceResources }) => {
  const { userId, appInstanceId } = context;
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  const feedbackResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === userId && type === FEEDBACK;
    }
  );
  const {
    content: {
      settings: { programmingLanguage, defaultCode },
    },
  } = appInstance;

  // initialize code to the default
  let code = defaultCode;

  // if there already has been input, then override
  if (inputResource && inputResource.data) {
    code = inputResource.data;
  }

  return {
    appInstanceId,
    programmingLanguage,
    code,
    feedback: feedbackResource && feedbackResource.data,
  };
};

const mapDispatchToProps = {
  dispatchSetCode: setCode,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(DiffEditor);

export default withTranslation()(ConnectedComponent);
