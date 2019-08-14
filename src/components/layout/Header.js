import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { withTranslation } from 'react-i18next';
import { ReactComponent as Logo } from '../../resources/logo.svg';
import { DEFAULT_MODE, STUDENT_MODES } from '../../config/settings';
import './Header.css';
import {
  patchAppInstanceResource,
  postAppInstanceResource,
  runCode,
} from '../../actions';
import { INPUT } from '../../config/appInstanceResourceTypes';

class Header extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    dispatchPostAppInstanceResource: PropTypes.func.isRequired,
    dispatchPatchAppInstanceResource: PropTypes.func.isRequired,
    dispatchRunCode: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      root: PropTypes.string,
      grow: PropTypes.string,
      logo: PropTypes.string,
    }).isRequired,
    mode: PropTypes.string,
    currentCode: PropTypes.string.isRequired,
    savedCode: PropTypes.string,
    inputResourceId: PropTypes.string,
    userId: PropTypes.string,
  };

  static defaultProps = {
    mode: DEFAULT_MODE,
    savedCode: '',
    userId: null,
    inputResourceId: null,
  };

  static styles = theme => ({
    root: {
      flexGrow: 1,
    },
    grow: {
      flexGrow: 1,
    },
    logo: {
      height: '48px',
      marginRight: theme.spacing.unit * 2,
    },
  });

  handleSave = () => {
    const {
      dispatchPatchAppInstanceResource,
      dispatchPostAppInstanceResource,
      inputResourceId,
      userId,
      currentCode,
    } = this.props;

    // if there is a resource id already, update, otherwise create
    if (inputResourceId) {
      dispatchPatchAppInstanceResource({
        data: currentCode,
        id: inputResourceId,
      });
    } else {
      dispatchPostAppInstanceResource({
        data: currentCode,
        type: INPUT,
        userId,
      });
    }
  };

  handleRun = () => {
    const { currentCode, dispatchRunCode } = this.props;
    dispatchRunCode(currentCode);
  };

  renderButtons() {
    const { mode, t, currentCode, savedCode } = this.props;

    if (STUDENT_MODES.includes(mode)) {
      const saveDisabled = currentCode === savedCode;
      const runDisabled = _.isEmpty(currentCode);
      return [
        <Tooltip title={t('Save')} key="save">
          <IconButton onClick={this.handleSave} disabled={saveDisabled}>
            <SaveIcon nativeColor="#fff" opacity={saveDisabled ? 0.5 : 1} />
          </IconButton>
        </Tooltip>,
        <Tooltip title={t('Run')} key="run">
          <IconButton onClick={this.handleRun} disabled={runDisabled}>
            <PlayArrowIcon nativeColor="#fff" opacity={runDisabled ? 0.5 : 1} />
          </IconButton>
        </Tooltip>,
      ];
    }
    return null;
  }

  render() {
    const { t, classes } = this.props;
    return (
      <header>
        <AppBar position="static">
          <Toolbar>
            <Logo className={classes.logo} />
            <Typography variant="h6" color="inherit" className={classes.grow}>
              {t('Code')}
            </Typography>
            {this.renderButtons()}
          </Toolbar>
        </AppBar>
      </header>
    );
  }
}

const mapStateToProps = ({ context, code, appInstanceResources }) => {
  const { userId } = context;
  // check to see if there is already an app instance
  // resource containing input from this user
  const inputResource = appInstanceResources.content.find(({ user, type }) => {
    return user === userId && type === INPUT;
  });
  return {
    userId,
    inputResourceId: inputResource && (inputResource.id || inputResource._id),
    appInstanceId: context.appInstanceId,
    spaceId: context.spaceId,
    mode: context.mode,
    view: context.view,
    currentCode: code.content,
    savedCode: inputResource && inputResource.data,
  };
};

const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchRunCode: runCode,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(Header.styles)(TranslatedComponent);
