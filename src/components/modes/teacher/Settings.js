import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SaveIcon from '@material-ui/icons/Save';
import Modal from '@material-ui/core/Modal';
import FormControl from '@material-ui/core/FormControl';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withTranslation } from 'react-i18next';
import { closeSettings, patchAppInstance } from '../../../actions';
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
  button: {
    margin: theme.spacing.unit,
  },
  formControl: {
    minWidth: 180,
  },
});

class Settings extends Component {
  static propTypes = {
    classes: PropTypes.shape({}).isRequired,
    open: PropTypes.bool.isRequired,
    activity: PropTypes.bool.isRequired,
    settings: PropTypes.shape({
      headerVisible: PropTypes.bool.isRequired,
      lang: PropTypes.string.isRequired,
      headerCode: PropTypes.string.isRequired,
      footerCode: PropTypes.string.isRequired,
    }).isRequired,
    t: PropTypes.func.isRequired,
    dispatchCloseSettings: PropTypes.func.isRequired,
    dispatchPatchAppInstance: PropTypes.func.isRequired,
    i18n: PropTypes.shape({
      defaultNS: PropTypes.string,
    }).isRequired,
  };

  state = {
    headerCodeChanged: false,
    footerCodeChanged: false,
    headerCodeToSave: null,
    footerCodeToSave: null,
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

  handleChangeHeaderCode = ({ target }) => {
    const {
      settings: { headerCode },
    } = this.props;
    const { value } = target;
    const headerCodeToSave = value;

    const headerCodeChanged = !(headerCodeToSave === headerCode);
    this.setState({ headerCodeToSave, headerCodeChanged });
  };

  handleChangeFooterCode = ({ target }) => {
    const {
      settings: { footerCode },
    } = this.props;
    const { value } = target;
    const footerCodeToSave = value;

    const footerCodeChanged = !(footerCodeToSave === footerCode);
    this.setState({ footerCodeToSave, footerCodeChanged });
  };

  handleSaveCode = () => {
    const {
      headerCodeChanged,
      footerCodeChanged,
      headerCodeToSave,
      footerCodeToSave,
    } = this.state;
    const {
      settings: { headerCode, footerCode },
    } = this.props;

    const headerCodeValue = headerCodeChanged ? headerCodeToSave : headerCode;
    const footerCodeValue = footerCodeChanged ? footerCodeToSave : footerCode;

    const settings = {
      headerCode: headerCodeValue,
      footerCode: footerCodeValue,
    };

    this.saveSettings(settings);

    this.setState({
      headerCodeChanged: false,
      footerCodeChanged: false,
    });
  };

  handleClose = () => {
    const { dispatchCloseSettings } = this.props;
    dispatchCloseSettings();
  };

  renderModalContent() {
    const { t, settings, activity, classes } = this.props;
    const { programmingLanguage, headerCode, footerCode } = settings;

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
        <MenuItem value={JAVASCRIPT}>JavaScript</MenuItem>
        <MenuItem value={PYTHON}>Python</MenuItem>
      </Select>
    );

    const headerCodeEditor = (
      <TextField
        className={classes.textField}
        defaultValue={headerCode}
        onChange={this.handleChangeHeaderCode}
        inputProps={{
          name: 'headerCode',
          id: 'headerCodeEditor',
        }}
        multiline
        margin="normal"
        variant="outlined"
        helperText="Write header code here (ex. import libraries, init console, etc.)"
        label="header code"
      />
    );

    const footerCodeEditor = (
      <TextField
        className={classes.textField}
        defaultValue={footerCode}
        onChange={this.handleChangeFooterCode}
        inputProps={{
          name: 'footerCode',
          id: 'footerCodeEditor',
        }}
        multiline
        margin="normal"
        variant="outlined"
        helperText="Write footer code here (ex. display execution time, etc.)"
        label="footer code"
      />
    );

    return (
      <FormControl>
        <InputLabel htmlFor="programmingLanguageSelect">
          {t('Programming Language')}
        </InputLabel>
        {selectControl}

        {headerCodeEditor}
        {footerCodeEditor}
        {this.renderButtons()}
      </FormControl>
    );
  }

  renderButtons() {
    const { t, classes } = this.props;
    const { headerCodeChanged, footerCodeChanged } = this.state;
    const saveDisabled = !headerCodeChanged && !footerCodeChanged;

    return (
      <Button
        variant="contained"
        size="small"
        className={classes.button}
        onClick={this.handleSaveCode}
        disabled={saveDisabled}
        opacity={saveDisabled ? 0.5 : 1}
      >
        <SaveIcon />
        {t('Save')}
      </Button>
    );
  }

  render() {
    const { open, classes, t } = this.props;

    return (
      <div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={open}
          onClose={this.handleClose}
        >
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="h5" id="modal-title">
              {t('Settings')}
            </Typography>
            {this.renderModalContent()}
          </div>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = ({ layout, appInstance }) => {
  return {
    open: layout.settings.open,
    settings: {
      // by default this is javascript
      programmingLanguage: appInstance.content.settings.programmingLanguage,
      headerCode: appInstance.content.settings.headerCode,
      footerCode: appInstance.content.settings.footerCode,
    },
    activity: appInstance.activity.length,
  };
};

const mapDispatchToProps = {
  dispatchCloseSettings: closeSettings,
  dispatchPatchAppInstance: patchAppInstance,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(styles)(TranslatedComponent);
