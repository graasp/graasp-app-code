import React, { Component } from 'react';
import AceEditor from 'react-ace';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core';
import { INPUT } from '../../../config/appInstanceResourceTypes';
import { setCode, runCode, countChange, saveCode } from '../../../actions';
import {
  DEFAULT_PROGRAMMING_LANGUAGE,
  PYTHON,
} from '../../../config/programmingLanguages';
import './Editor.css';
import {
  DEFAULT_FONT_SIZE,
  FULL_SCREEN_FONT_SIZE,
} from '../../../config/settings';

const styles = () => ({});

class Editor extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    dispatchSetCode: PropTypes.func.isRequired,
    dispatchRunCode: PropTypes.func.isRequired,
    dispatchCountChange: PropTypes.func.isRequired,
    dispatchSaveCode: PropTypes.func.isRequired,
    fullscreen: PropTypes.bool.isRequired,
    code: PropTypes.string,
    programmingLanguage: PropTypes.string,
    appInstanceId: PropTypes.string,
  };

  static defaultProps = {
    code: '',
    appInstanceId: null,
    programmingLanguage: DEFAULT_PROGRAMMING_LANGUAGE,
  };

  componentDidUpdate(prevProps) {
    const { code: prevCode } = prevProps;
    const { code, dispatchSetCode } = this.props;
    if (prevCode !== code) {
      dispatchSetCode(code);
    }
  }

  onChange = (code) => {
    const { dispatchSetCode, dispatchCountChange } = this.props;
    dispatchSetCode(code);
    // used to track how many unsaved and unexecuted changes there are
    dispatchCountChange();
  };

  onLoad = () => {
    const { dispatchSetCode, code } = this.props;
    dispatchSetCode(code);
  };

  handleCommandEnter = (editor) => {
    const code = editor.getValue();
    const { dispatchRunCode } = this.props;
    const job = { data: code };
    dispatchRunCode(job);
  };

  handleCommandSave = (editor) => {
    const code = editor.getValue();
    const { dispatchSaveCode } = this.props;
    dispatchSaveCode({ currentCode: code });
  };

  render() {
    const {
      t,
      code,
      appInstanceId,
      programmingLanguage,
      fullscreen,
    } = this.props;

    const commentPrefix = programmingLanguage === PYTHON ? '#' : '//';
    return (
      <AceEditor
        placeholder={`${commentPrefix} ${t('your code goes here')}`}
        mode={programmingLanguage}
        theme="xcode"
        name={appInstanceId || Math.random()}
        height="100vh"
        width="50vw"
        onLoad={this.onLoad}
        onChange={this.onChange}
        fontSize={fullscreen ? FULL_SCREEN_FONT_SIZE : DEFAULT_FONT_SIZE}
        showPrintMargin
        showGutter
        highlightActiveLine
        commands={[
          {
            name: 'run',
            bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
            exec: this.handleCommandEnter,
          },
          {
            name: 'save',
            bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
            exec: this.handleCommandSave,
          },
        ]}
        value={code || ''}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 4,
        }}
        editorProps={{ $blockScrolling: true }}
      />
    );
  }
}

const mapStateToProps = ({ context, appInstanceResources, appInstance }) => {
  const { userId, appInstanceId } = context;
  const {
    content: {
      settings: { programmingLanguage, defaultCode },
    },
  } = appInstance;
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });

  // initialize code to the default
  let codeData = defaultCode;

  // if there already has been input, then override
  if (inputResource && inputResource.data) {
    codeData = inputResource.data;
  }

  return {
    appInstanceId,
    programmingLanguage,
    code: codeData,
  };
};

const mapDispatchToProps = {
  dispatchSetCode: setCode,
  dispatchRunCode: runCode,
  dispatchCountChange: countChange,
  dispatchSaveCode: saveCode,
};

const StyledComponent = withStyles(styles)(Editor);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

export default withTranslation()(ConnectedComponent);
