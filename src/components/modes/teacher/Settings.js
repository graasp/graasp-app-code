import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import FormControl from '@material-ui/core/FormControl';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withTranslation } from 'react-i18next';
import AceEditor from 'react-ace';
import {
  closeSettings,
  patchAppInstance,
  setProgrammingLanguage,
  setHeaderCode,
  setFooterCode,
  setDefaultCode,
} from '../../../actions';
import Loader from '../../common/Loader';
import {
  JAVASCRIPT,
  PYTHON,
  DEFAULT_PROGRAMMING_LANGUAGE,
} from '../../../config/programmingLanguages';
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_ORIENTATION,
  HELPER_TEXT_COLOR,
} from '../../../config/settings';

function getModalStyle() {
  const top = 50;
  const left = 50;
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    outline: 'none',
  },
  fullScreen: {
    position: 'absolute',
    // 64px is the height of the header
    marginTop: '64px',
    height: 'calc(100% - 64px)',
    width: 'calc(100% - 32px)',
    backgroundColor: theme.palette.background.paper,
    outline: 'none',
  },
  button: {
    margin: theme.spacing.unit,
  },
  right: {
    position: 'absolute',
    right: theme.spacing.unit,
  },
  formControl: {
    minWidth: 180,
  },
  helperText: {
    color: HELPER_TEXT_COLOR,
    marginTop: '8px',
  },
  fab: {
    margin: theme.spacing.unit,
    position: 'fixed',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
});

class Settings extends Component {
  static propTypes = {
    classes: PropTypes.shape({}).isRequired,
    open: PropTypes.bool.isRequired,
    activity: PropTypes.bool.isRequired,
    settings: PropTypes.shape({
      programmingLanguage: PropTypes.string,
      headerCode: PropTypes.string,
      defaultCode: PropTypes.string,
      footerCode: PropTypes.string,
    }).isRequired,
    currentProgrammingLanguage: PropTypes.string.isRequired,
    currentHeaderCode: PropTypes.string.isRequired,
    currentFooterCode: PropTypes.string.isRequired,
    currentDefaultCode: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    dispatchCloseSettings: PropTypes.func.isRequired,
    dispatchPatchAppInstance: PropTypes.func.isRequired,
    dispatchSetProgrammingLanguage: PropTypes.func.isRequired,
    dispatchSetHeaderCode: PropTypes.func.isRequired,
    dispatchSetDefaultCode: PropTypes.func.isRequired,
    dispatchSetFooterCode: PropTypes.func.isRequired,
    i18n: PropTypes.shape({
      defaultNS: PropTypes.string,
    }).isRequired,
  };

  componentDidMount() {
    const {
      settings: { programmingLanguage },
      currentProgrammingLanguage,
      dispatchSetProgrammingLanguage,
    } = this.props;

    // ensure that programming language is set on mount
    if (currentProgrammingLanguage !== programmingLanguage) {
      dispatchSetProgrammingLanguage(programmingLanguage);
    }
  }

  saveSettings = settingsToChange => {
    const { settings, dispatchPatchAppInstance } = this.props;
    const newSettings = {
      ...settings,
      ...settingsToChange,
    };
    dispatchPatchAppInstance({
      data: newSettings,
    });
  };

  handleChangeProgrammingLanguage = ({ target }) => {
    const { dispatchSetProgrammingLanguage } = this.props;
    const { value } = target;

    dispatchSetProgrammingLanguage(value);
  };

  onHeaderCodeLoad = () => {
    const {
      dispatchSetHeaderCode,
      currentHeaderCode,
      settings: { headerCode },
    } = this.props;
    const code = currentHeaderCode || headerCode;
    dispatchSetHeaderCode(code);
  };

  onHeaderCodeChange = value => {
    const { dispatchSetHeaderCode } = this.props;
    dispatchSetHeaderCode(value);
  };

  onDefaultCodeLoad = () => {
    const {
      dispatchSetDefaultCode,
      currentDefaultCode,
      settings: { defaultCode },
    } = this.props;
    const code = currentDefaultCode || defaultCode;
    dispatchSetDefaultCode(code);
  };

  onDefaultCodeChange = value => {
    const { dispatchSetDefaultCode } = this.props;
    dispatchSetDefaultCode(value);
  };

  onFooterCodeLoad = () => {
    const {
      dispatchSetFooterCode,
      currentFooterCode,
      settings: { footerCode },
    } = this.props;
    const code = currentFooterCode || footerCode;
    dispatchSetFooterCode(code);
  };

  onFooterCodeChange = value => {
    const { dispatchSetFooterCode } = this.props;
    dispatchSetFooterCode(value);
  };

  saveProgrammingLanguage = () => {
    const { currentProgrammingLanguage } = this.props;
    const settingsToChange = {
      programmingLanguage: currentProgrammingLanguage,
    };
    this.saveSettings(settingsToChange);
  };

  saveCode = () => {
    const {
      currentHeaderCode,
      currentDefaultCode,
      currentFooterCode,
    } = this.props;
    const settings = {
      headerCode: currentHeaderCode,
      defaultCode: currentDefaultCode,
      footerCode: currentFooterCode,
    };

    this.saveSettings(settings);
  };

  handleSave = () => {
    const {
      currentProgrammingLanguage: cpl,
      settings: { programmingLanguage: pl },
    } = this.props;
    const programmingLanguageChanged = pl !== cpl;
    this.saveCode();
    if (programmingLanguageChanged) {
      this.saveProgrammingLanguage();
    }
  };

  handleClose = () => {
    const {
      dispatchCloseSettings,
      dispatchSetProgrammingLanguage,
      dispatchSetHeaderCode,
      dispatchSetDefaultCode,
      dispatchSetFooterCode,
      settings: { programmingLanguage, headerCode, footerCode, defaultCode },
    } = this.props;
    // discard changes before closing
    dispatchSetProgrammingLanguage(programmingLanguage);
    dispatchSetHeaderCode(headerCode);
    dispatchSetDefaultCode(defaultCode);
    dispatchSetFooterCode(footerCode);
    dispatchCloseSettings();
  };

  isSaveDisabled = () => {
    const {
      currentProgrammingLanguage,
      currentHeaderCode,
      currentFooterCode,
      currentDefaultCode,
    } = this.props;
    const {
      settings: { programmingLanguage, headerCode, footerCode, defaultCode },
    } = this.props;

    const programmingLanguageChanged =
      programmingLanguage !== currentProgrammingLanguage;
    const headerCodeChanged = headerCode !== currentHeaderCode;
    const footerCodeChanged = footerCode !== currentFooterCode;
    const defaultCodeChanged = !(defaultCode === currentDefaultCode);
    return (
      !programmingLanguageChanged &&
      !headerCodeChanged &&
      !footerCodeChanged &&
      !defaultCodeChanged
    );
  };

  renderModalContent() {
    const { t, activity, classes, currentProgrammingLanguage } = this.props;

    if (activity) {
      return <Loader />;
    }

    const selectControl = (
      <Select
        className={classes.formControl}
        value={currentProgrammingLanguage || DEFAULT_PROGRAMMING_LANGUAGE}
        onChange={this.handleChangeProgrammingLanguage}
        inputProps={{
          name: 'programmingLanguage',
          id: 'programmingLanguageSelect',
        }}
      >
        <MenuItem value={JAVASCRIPT}>JavaScript (Browser Engine)</MenuItem>
        <MenuItem value={PYTHON}>Python (Python3 support via Pyodide)</MenuItem>
      </Select>
    );

    return (
      <>
        <FormControl>
          <InputLabel htmlFor="programmingLanguageSelect">
            {t('Programming Language')}
          </InputLabel>
          {selectControl}
        </FormControl>
        {this.renderHeaderCodeEditor()}
        {this.renderDefaultCodeEditor()}
        {this.renderFooterCodeEditor()}
      </>
    );
  }

  renderHeaderCodeEditor() {
    const {
      t,
      classes,
      currentHeaderCode,
      currentProgrammingLanguage,
    } = this.props;

    const commentPrefix = currentProgrammingLanguage === PYTHON ? '#' : '//';

    return (
      <div>
        <Typography variant="subtitle2" id="modal-headercode-caption">
          <div className={classes.helperText}>{t('header code')}</div>
        </Typography>
        <AceEditor
          placeholder={`${commentPrefix} ${t(
            'Write header code here (ex. import libraries, init console, etc.)'
          )}`}
          mode={currentProgrammingLanguage}
          theme="xcode"
          name={Math.random()}
          width="100%"
          height="120px"
          fontSize={DEFAULT_FONT_SIZE}
          showPrintMargin
          showGutter
          highlightActiveLine
          value={currentHeaderCode || ''}
          onLoad={this.onHeaderCodeLoad}
          onChange={this.onHeaderCodeChange}
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

  renderDefaultCodeEditor() {
    const {
      t,
      classes,
      currentDefaultCode,
      currentProgrammingLanguage,
    } = this.props;

    const commentPrefix = currentProgrammingLanguage === PYTHON ? '#' : '//';

    return (
      <div>
        <Typography variant="subtitle2" id="modal-defaultcode-caption">
          <div className={classes.helperText}>{t('default code')}</div>
        </Typography>
        <AceEditor
          placeholder={`${commentPrefix} ${t(
            'Write code to show to the student by default'
          )}`}
          mode={currentProgrammingLanguage}
          theme="xcode"
          name={Math.random()}
          width="100%"
          height="120px"
          fontSize={DEFAULT_FONT_SIZE}
          showPrintMargin
          showGutter
          highlightActiveLine
          value={currentDefaultCode || ''}
          onLoad={this.onDefaultCodeLoad}
          onChange={this.onDefaultCodeChange}
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

  renderFooterCodeEditor() {
    const {
      t,
      classes,
      currentFooterCode,
      currentProgrammingLanguage,
    } = this.props;

    const commentPrefix = currentProgrammingLanguage === PYTHON ? '#' : '//';

    return (
      <div>
        <Typography variant="subtitle2" id="modal-footercode-caption">
          <div className={classes.helperText}>{t('footer code')}</div>
        </Typography>
        <AceEditor
          placeholder={`${commentPrefix} ${t(
            'Write footer code here (ex. display execution time, etc.)'
          )}`}
          mode={currentProgrammingLanguage}
          theme="xcode"
          name={Math.random()}
          width="100%"
          height="120px"
          fontSize={DEFAULT_FONT_SIZE}
          showPrintMargin
          showGutter
          highlightActiveLine
          value={currentFooterCode || ''}
          onLoad={this.onFooterCodeLoad}
          onChange={this.onFooterCodeChange}
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

  renderButtons() {
    const { t, classes } = this.props;

    const saveDisabled = this.isSaveDisabled();

    return (
      <Tooltip title={t('Save')} key="save" className={classes.right}>
        <IconButton
          size="small"
          onClick={this.handleSave}
          disabled={saveDisabled}
        >
          <SaveIcon nativeColor="#fff" opacity={saveDisabled ? 0.5 : 1} />
        </IconButton>
      </Tooltip>
    );
  }

  render() {
    const { open, classes, t } = this.props;

    return (
      <div>
        <Dialog
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={open}
          onClose={this.handleClose}
          fullScreen
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <Typography color="inherit" variant="h5" id="modal-title">
                {t('Settings')}
              </Typography>
              {this.renderButtons()}
            </Toolbar>
          </AppBar>
          <div style={getModalStyle()} className={classes.fullScreen}>
            {this.renderModalContent()}
          </div>
          <Fab
            color="primary"
            aria-label={t('Close')}
            className={classes.fab}
            onClick={this.handleClose}
          >
            <CloseIcon />
          </Fab>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = ({ code, layout, appInstance }) => {
  const {
    programmingLanguage = DEFAULT_PROGRAMMING_LANGUAGE,
    headerCode = '',
    defaultCode = '',
    footerCode = '',
    orientation = DEFAULT_ORIENTATION,
  } = appInstance.content.settings;
  return {
    open: layout.settings.open,
    settings: {
      // by default this is javascript
      programmingLanguage,
      headerCode,
      defaultCode,
      footerCode,
      orientation,
    },
    currentProgrammingLanguage: code.language,
    currentHeaderCode: code.header,
    currentFooterCode: code.footer,
    currentDefaultCode: code.default,
    activity: Boolean(appInstance.activity.length),
  };
};

const mapDispatchToProps = {
  dispatchCloseSettings: closeSettings,
  dispatchPatchAppInstance: patchAppInstance,
  dispatchSetProgrammingLanguage: setProgrammingLanguage,
  dispatchSetHeaderCode: setHeaderCode,
  dispatchSetDefaultCode: setDefaultCode,
  dispatchSetFooterCode: setFooterCode,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(styles)(TranslatedComponent);
