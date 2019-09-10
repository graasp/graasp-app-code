import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
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
  setHeaderCode,
  setFooterCode,
} from '../../../actions';
import Loader from '../../common/Loader';
import { JAVASCRIPT, PYTHON } from '../../../config/programmingLanguages';

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
    color: 'rgba(0, 0, 0, 0.54)',
    marginTop: '8px',
  },
});

class Settings extends Component {
  static propTypes = {
    classes: PropTypes.shape({}).isRequired,
    open: PropTypes.bool.isRequired,
    activity: PropTypes.bool.isRequired,
    settings: PropTypes.shape({
      programmingLanguage: PropTypes.string.isRequired,
      headerCode: PropTypes.string.isRequired,
      footerCode: PropTypes.string.isRequired,
    }).isRequired,
    appInstanceId: PropTypes.string.isRequired,
    currentHeaderCode: PropTypes.string.isRequired,
    currentFooterCode: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    dispatchCloseSettings: PropTypes.func.isRequired,
    dispatchPatchAppInstance: PropTypes.func.isRequired,
    dispatchSetHeaderCode: PropTypes.func.isRequired,
    dispatchSetFooterCode: PropTypes.func.isRequired,
    i18n: PropTypes.shape({
      defaultNS: PropTypes.string,
    }).isRequired,
  };

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
    const { value } = target;
    const settingsToChange = {
      programmingLanguage: value,
    };
    this.saveSettings(settingsToChange);
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

  handleSaveCode = () => {
    const { currentHeaderCode, currentFooterCode } = this.props;
    const settings = {
      headerCode: currentHeaderCode,
      footerCode: currentFooterCode,
    };

    this.saveSettings(settings);
  };

  handleClose = () => {
    const { dispatchCloseSettings } = this.props;
    dispatchCloseSettings();
  };

  renderModalContent() {
    const { t, settings, activity, classes } = this.props;
    const { programmingLanguage } = settings;

    if (activity) {
      return <Loader />;
    }

    const selectControl = (
      <Select
        className={classes.formControl}
        value={programmingLanguage}
        onChange={this.handleChangeProgrammingLanguage}
        inputProps={{
          name: 'programmingLanguage',
          id: 'programmingLanguageSelect',
        }}
      >
        <MenuItem value={JAVASCRIPT}>JavaScript (browser engine)</MenuItem>
        <MenuItem value={PYTHON}>Python (Python3 support via Pyodide)</MenuItem>
      </Select>
    );

    return (
      <div>
        <FormControl>
          <InputLabel htmlFor="programmingLanguageSelect">
            {t('Programming Language')}
          </InputLabel>
          {selectControl}
        </FormControl>
        {this.renderHeaderCodeEditor()}
        {this.renderFooterCodeEditor()}
      </div>
    );
  }

  renderHeaderCodeEditor() {
    const {
      t,
      classes,
      currentHeaderCode,
      appInstanceId,
      settings: { programmingLanguage },
    } = this.props;

    return (
      <div>
        <Typography variant="subtitle2" id="modal-headercode-caption">
          <div className={classes.helperText}>{t('header code')}</div>
        </Typography>
        <AceEditor
          placeholder={t(
            '// Write header code here (ex. import libraries, init console, etc.)'
          )}
          mode={programmingLanguage}
          theme="xcode"
          name={appInstanceId || Math.random()}
          width="100%"
          height="120px"
          fontSize={14}
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

  renderFooterCodeEditor() {
    const {
      t,
      classes,
      currentFooterCode,
      appInstanceId,
      settings: { programmingLanguage },
    } = this.props;

    return (
      <div>
        <Typography variant="subtitle2" id="modal-footercode-caption">
          <div className={classes.helperText}>{t('footer code')}</div>
        </Typography>
        <AceEditor
          placeholder={t(
            '// Write footer code here (ex. display execution time, etc.)'
          )}
          mode={programmingLanguage}
          theme="xcode"
          name={appInstanceId || Math.random()}
          width="100%"
          height="120px"
          fontSize={14}
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
    const { t, classes, currentHeaderCode, currentFooterCode } = this.props;
    const {
      settings: { headerCode, footerCode },
    } = this.props;

    const headerCodeChanged = !(headerCode === currentHeaderCode);
    const footerCodeChanged = !(footerCode === currentFooterCode);
    const saveDisabled = !headerCodeChanged && !footerCodeChanged;

    return (
      <Tooltip title={t('Save')} key="save" className={classes.right}>
        <IconButton
          size="small"
          onClick={this.handleSaveCode}
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
              <IconButton
                edge="start"
                color="inherit"
                onClick={this.handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography color="inherit" variant="h5" id="modal-title">
                {t('Settings')}
              </Typography>
              {this.renderButtons()}
            </Toolbar>
          </AppBar>
          <div style={getModalStyle()} className={classes.fullScreen}>
            {this.renderModalContent()}
          </div>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = ({ code, layout, appInstance }) => {
  return {
    open: layout.settings.open,
    settings: {
      // by default this is javascript
      programmingLanguage: appInstance.content.settings.programmingLanguage,
      headerCode: appInstance.content.settings.headerCode,
      footerCode: appInstance.content.settings.footerCode,
      orientation: appInstance.content.settings.orientation,
    },
    currentHeaderCode: code.header,
    currentFooterCode: code.footer,
    activity: Boolean(appInstance.activity.length),
  };
};

const mapDispatchToProps = {
  dispatchCloseSettings: closeSettings,
  dispatchPatchAppInstance: patchAppInstance,
  dispatchSetHeaderCode: setHeaderCode,
  dispatchSetFooterCode: setFooterCode,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(styles)(TranslatedComponent);
