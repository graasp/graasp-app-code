import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { ReactComponent as Logo } from '../../resources/logo.svg';
import './Header.css';
import { addQueryParamsToUrl } from '../../utils/url';

class Header extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.shape({}).isRequired,
    appInstanceId: PropTypes.string,
    spaceId: PropTypes.string,
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

  static defaultProps = {
    appInstanceId: null,
    spaceId: null,
  };

  renderAppInstanceLink = () => {
    const { appInstanceId, t } = this.props;
    if (!appInstanceId) {
      return (
        <a
          href={addQueryParamsToUrl({
            appInstanceId: '6156e70ab253020033364411',
          })}
          className="HeaderLink"
        >
          {t('Use Sample App Instance')}
        </a>
      );
    }
    return <div />;
  };

  renderSpaceLink = () => {
    const { spaceId, t } = this.props;
    if (!spaceId) {
      return (
        <a
          href={addQueryParamsToUrl({ spaceId: '5b56e70ab253020033364411' })}
          className="HeaderLink"
        >
          {t('Use Sample Space')}
        </a>
      );
    }
    return <div />;
  };

  render() {
    const { t, classes } = this.props;
    return (
      <header>
        <AppBar position="static">
          <Toolbar>
            <Logo className={classes.logo} />
            <Typography variant="h6" color="inherit" className={classes.grow}>
              {t('Graasp App Starter')}
            </Typography>
            {this.renderSpaceLink()}
            {this.renderAppInstanceLink()}
          </Toolbar>
        </AppBar>
      </header>
    );
  }
}

const mapStateToProps = ({ context }) => ({
  appInstanceId: context.appInstanceId,
  spaceId: context.spaceId,
});

const ConnectedComponent = connect(mapStateToProps)(Header);
const TranslatedComponent = withTranslation()(ConnectedComponent);

export default withStyles(Header.styles)(TranslatedComponent);
