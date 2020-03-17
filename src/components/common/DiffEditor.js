import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { diff as AceDiffEditor } from 'react-ace';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { FEEDBACK, INPUT } from '../../config/appInstanceResourceTypes';
import {
  DEFAULT_PROGRAMMING_LANGUAGE,
  PYTHON,
} from '../../config/programmingLanguages';
import {
  DEFAULT_FONT_SIZE,
  FULL_SCREEN_FONT_SIZE,
} from '../../config/settings';

// eslint-disable-next-line react/prefer-stateless-function
class DiffEditor extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    code: PropTypes.string,
    feedback: PropTypes.string,
    programmingLanguage: PropTypes.string,
    appInstanceId: PropTypes.string,
    fullscreen: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    code: '',
    feedback: '',
    appInstanceId: null,
    programmingLanguage: DEFAULT_PROGRAMMING_LANGUAGE,
  };

  render() {
    const {
      t,
      code,
      programmingLanguage,
      appInstanceId,
      feedback,
      fullscreen,
    } = this.props;

    const commentPrefix = programmingLanguage === PYTHON ? '#' : '//';

    // todo: create proper headers
    const codeWithHeader = `${commentPrefix} ${t('your code')}\n\n${code}`;
    const feedbackWithHeader = `${commentPrefix} ${t(
      'feedback'
    )}\n\n${feedback}`;

    return (
      <AceDiffEditor
        mode={programmingLanguage}
        theme="xcode"
        name={appInstanceId || Math.random()}
        height="100vh"
        width="100vw"
        readOnly
        fontSize={fullscreen ? FULL_SCREEN_FONT_SIZE : DEFAULT_FONT_SIZE}
        showPrintMargin
        showGutter
        highlightActiveLine
        value={[codeWithHeader, feedbackWithHeader]}
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
        }}
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

const ConnectedComponent = connect(mapStateToProps)(DiffEditor);

export default withTranslation()(ConnectedComponent);
