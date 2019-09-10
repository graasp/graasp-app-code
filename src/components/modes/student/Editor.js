import React, { Component } from 'react';
import AceEditor from 'react-ace';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core';
import { INPUT } from '../../../config/appInstanceResourceTypes';
import { setCode, runCode } from '../../../actions';
import { DEFAULT_PROGRAMMING_LANGUAGE } from '../../../config/programmingLanguages';
import './Editor.css';
import {
  DEFAULT_ORIENTATION,
  HORIZONTAL_ORIENTATION,
  VERTICAL_ORIENTATION,
} from '../../../config/settings';

const styles = () => ({});

class Editor extends Component {
  static propTypes = {
    dispatchSetCode: PropTypes.func.isRequired,
    dispatchRunCode: PropTypes.func.isRequired,
    code: PropTypes.string,
    programmingLanguage: PropTypes.string,
    appInstanceId: PropTypes.string,
    orientation: PropTypes.oneOf([
      VERTICAL_ORIENTATION,
      HORIZONTAL_ORIENTATION,
    ]),
  };

  static defaultProps = {
    code: '',
    appInstanceId: null,
    programmingLanguage: DEFAULT_PROGRAMMING_LANGUAGE,
    orientation: DEFAULT_ORIENTATION,
  };

  onChange = code => {
    const { dispatchSetCode } = this.props;
    dispatchSetCode(code);
  };

  onLoad = () => {
    const { dispatchSetCode, code } = this.props;
    dispatchSetCode(code);
  };

  handleCommandEnter = editor => {
    const code = editor.getValue();
    const { dispatchRunCode } = this.props;
    dispatchRunCode(code);
  };

  render() {
    // eslint-disable-next-line react/prop-types
    const {
      code,
      appInstanceId,
      programmingLanguage,
      orientation,
    } = this.props;
    const horizontalOrientation = orientation === HORIZONTAL_ORIENTATION;

    return (
      <AceEditor
        placeholder="function () { console.log('Placeholder Text'); }"
        mode={programmingLanguage}
        theme="xcode"
        name={appInstanceId || Math.random()}
        height={horizontalOrientation ? '50vh' : '100vh'}
        width={horizontalOrientation ? '100vw' : '50vw'}
        onLoad={this.onLoad}
        onChange={this.onChange}
        fontSize={14}
        showPrintMargin
        showGutter
        highlightActiveLine
        commands={[
          {
            name: 'run',
            bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
            exec: this.handleCommandEnter,
          },
        ]}
        value={code || ''}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    );
  }
}

const mapStateToProps = ({ context, appInstanceResources, appInstance }) => {
  const { userId, appInstanceId } = context;
  const {
    content: {
      settings: { programmingLanguage, orientation },
    },
  } = appInstance;
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  return {
    appInstanceId,
    programmingLanguage,
    orientation,
    code: inputResource && inputResource.data,
  };
};

const mapDispatchToProps = {
  dispatchSetCode: setCode,
  dispatchRunCode: runCode,
};

const StyledComponent = withStyles(styles)(Editor);

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(StyledComponent);

export default withTranslation()(ConnectedComponent);
