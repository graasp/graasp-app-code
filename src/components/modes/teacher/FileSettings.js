import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Switch from '@material-ui/core/Switch';
import { Tooltip } from '@material-ui/core';
import { connect } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withTranslation } from 'react-i18next';
import { closeFileSettings, patchAppInstance } from '../../../actions';
import Loader from '../../common/Loader';

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
});

class Settings extends Component {
  static propTypes = {
    classes: PropTypes.shape({
      paper: PropTypes.string,
    }).isRequired,
    open: PropTypes.bool.isRequired,
    activity: PropTypes.bool.isRequired,
    settings: PropTypes.shape({
      publicStudentUploads: PropTypes.bool.isRequired,
    }).isRequired,
    t: PropTypes.func.isRequired,
    dispatchCloseFileSettings: PropTypes.func.isRequired,
    dispatchPatchAppInstance: PropTypes.func.isRequired,
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

  handleChangeStudentUploadVisibility = () => {
    const {
      settings: { publicStudentUploads },
    } = this.props;
    const settingsToChange = {
      publicStudentUploads: !publicStudentUploads,
    };
    this.saveSettings(settingsToChange);
  };

  handleClose = () => {
    const { dispatchCloseFileSettings } = this.props;
    dispatchCloseFileSettings();
  };

  renderModalContent() {
    const { t, settings, activity } = this.props;
    const { publicStudentUploads } = settings;

    if (activity) {
      return <Loader />;
    }

    const studentUploadVisibilitySwitch = (
      <Switch
        color="primary"
        checked={publicStudentUploads}
        onChange={this.handleChangeStudentUploadVisibility}
        value="headerVisibility"
      />
    );

    return (
      <Tooltip
        title={t(
          'When enabled, student uploads will be visible to other students. Teacher uploads are always visible to all students.'
        )}
      >
        <FormControlLabel
          control={studentUploadVisibilitySwitch}
          label={t('Student Uploads are Public')}
        />
      </Tooltip>
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
    open: layout.fileSettings.open,
    settings: {
      // by default this is false
      publicStudentUploads: appInstance.content.settings.publicStudentUploads,
    },
    activity: Boolean(appInstance.activity.length),
  };
};

const mapDispatchToProps = {
  dispatchCloseFileSettings: closeFileSettings,
  dispatchPatchAppInstance: patchAppInstance,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(styles)(TranslatedComponent);
