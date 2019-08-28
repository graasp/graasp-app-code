import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import TableIcon from '@material-ui/icons/TableChart';
import RefreshIcon from '@material-ui/icons/Refresh';
import CloudIcon from '@material-ui/icons/Cloud';
import { withTranslation } from 'react-i18next';
import { addQueryParamsToUrl } from '../../utils/url';
import { ReactComponent as Logo } from '../../resources/logo.svg';
import {
  DEFAULT_MODE,
  STUDENT_MODES,
  TEACHER_MODES,
} from '../../config/settings';
import { DEFAULT_VIEW, DASHBOARD_VIEW } from '../../config/views';
import './Header.css';

class Header extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      root: PropTypes.string,
      grow: PropTypes.string,
      logo: PropTypes.string,
    }).isRequired,
    programmingLanguage: PropTypes.string.isRequired,
    mode: PropTypes.string,
    view: PropTypes.string,
  };

  static defaultProps = {
    mode: DEFAULT_MODE,
    view: DEFAULT_VIEW,
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
    fab: {
      margin: theme.spacing.unit,
      position: 'fixed',
      top: theme.spacing.unit * 1,
      right: theme.spacing.unit * 1,
    },
    fab1: {
      top: theme.spacing.unit * 2 + 40,
    },
    fab2: {
      top: theme.spacing.unit * 3 + 2 * 40,
    },
    fab3: {
      top: theme.spacing.unit * 4 + 3 * 40,
    },
  });

  renderTeacherButtons() {
    const { view } = this.props;
    const buttons = [
      <IconButton onClick={this.handleRefresh} key="refresh">
        <RefreshIcon nativeColor="#fff" />
      </IconButton>,
    ];

    if (view === DEFAULT_VIEW) {
      buttons.push(
        <IconButton
          key="dashboard"
          href={`index.html${addQueryParamsToUrl({ view: DASHBOARD_VIEW })}`}
        >
          <CloudIcon nativeColor="#fff" />
        </IconButton>
      );
    } else {
      buttons.push(
        <IconButton
          key="table"
          href={`index.html${addQueryParamsToUrl({ view: DEFAULT_VIEW })}`}
        >
          <TableIcon nativeColor="#fff" />
        </IconButton>
      );
    }
    return buttons;
  }

  renderLanguage() {
    const { t, programmingLanguage } = this.props;

    return `: ${t(programmingLanguage)}`;
  }

  render() {
    const { mode, t, classes } = this.props;

    if (STUDENT_MODES.includes(mode)) {
      return null;
    }
    if (TEACHER_MODES.includes(mode)) {
      // return this.renderTeacherButtons();
      return (
        <header>
          <AppBar position="static">
            <Toolbar>
              <Logo className={classes.logo} />
              <Typography variant="h6" color="inherit" className={classes.grow}>
                {t('Code') + this.renderLanguage()}
              </Typography>
            </Toolbar>
          </AppBar>
        </header>
      );
    }
    return null;
  }
}

const mapStateToProps = ({ context, appInstance }) => {
  return {
    mode: context.mode,
    view: context.view,
    programmingLanguage: appInstance.content.settings.programmingLanguage,
  };
};

const ConnectedComponent = connect(mapStateToProps)(Header);
const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(Header.styles)(TranslatedComponent);
