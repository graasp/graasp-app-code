import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { diff as AceDiffEditor } from 'react-ace';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { FEEDBACK, INPUT } from '../../config/appInstanceResourceTypes';
import { DEFAULT_PROGRAMMING_LANGUAGE } from '../../config/programmingLanguages';
import {
  DEFAULT_FONT_SIZE,
  FULL_SCREEN_FONT_SIZE,
} from '../../config/settings';

// eslint-disable-next-line react/prefer-stateless-function
class DiffEditor extends Component {
  static propTypes = {
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
      code,
      programmingLanguage,
      appInstanceId,
      feedback,
      fullscreen,
    } = this.props;

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
        value={[code, feedback]}
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
        }}
        editorProps={{ $blockScrolling: true }}
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
