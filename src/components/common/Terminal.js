import React from 'react';
import { ReactTerminal, ReactThemes } from 'react-terminal-component';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DEFAULT_FONT_SIZE,
  FULL_SCREEN_FONT_SIZE,
} from '../../config/settings';

const JavaScriptTerminal = require('javascript-terminal');

const Terminal = ({ output, fs, figuresDisplayed, fullscreen }) => {
  // prepare output for printing in the terminal
  const textOutput = JavaScriptTerminal.OutputFactory.makeTextOutput(output);
  const customOutputs = JavaScriptTerminal.Outputs.create([textOutput]);
  const emulatorState = JavaScriptTerminal.EmulatorState.create({
    outputs: customOutputs,
    fs: JavaScriptTerminal.FileSystem.create(fs),
  });

  return (
    <ReactTerminal
      autoFocus={false}
      clickToFocus
      theme={{
        ...ReactThemes.hacker,
        spacing: '0',
        height: figuresDisplayed ? '50vh' : '100vh',
        width: '50vw',
        fontSize: `${fullscreen ? FULL_SCREEN_FONT_SIZE : DEFAULT_FONT_SIZE}px`,
      }}
      emulatorState={emulatorState}
    />
  );
};

Terminal.propTypes = {
  output: PropTypes.string,
  figuresDisplayed: PropTypes.bool.isRequired,
  fullscreen: PropTypes.bool.isRequired,
  // fs is an object of unpredictable shape
  // eslint-disable-next-line react/forbid-prop-types
  fs: PropTypes.object.isRequired,
};

Terminal.defaultProps = {
  output: '',
};

const mapStateToProps = ({ code }) => ({
  output: code.output,
  fs: code.fs,
  figuresDisplayed: Boolean(code.figures.length),
});

const ConnectedComponent = connect(mapStateToProps)(Terminal);

export default ConnectedComponent;
