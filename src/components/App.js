import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import StudentMode from './modes/student/StudentMode';
import { getContext } from '../actions';
import { DEFAULT_LANG, DEFAULT_MODE } from '../config/settings';
import { getAppInstance } from '../actions/appInstance';
import { DEFAULT_VIEW } from '../config/views';
import TeacherMode from './modes/teacher/TeacherMode';
import Loader from './common/Loader';
import Header from './layout/Header';
import MaximizableView from './layout/MaximizableView';

export class App extends Component {
  static propTypes = {
    i18n: PropTypes.shape({
      defaultNS: PropTypes.string,
      changeLanguage: PropTypes.func,
    }).isRequired,
    dispatchGetContext: PropTypes.func.isRequired,
    dispatchGetAppInstance: PropTypes.func.isRequired,
    lang: PropTypes.string,
    mode: PropTypes.string,
    view: PropTypes.string,
  };

  static defaultProps = {
    lang: DEFAULT_LANG,
    mode: DEFAULT_MODE,
    view: DEFAULT_VIEW,
  };

  state = {
    fullscreen: false,
  };

  componentDidMount() {
    const { lang, dispatchGetContext, dispatchGetAppInstance } = this.props;

    // first thing to do is get the context
    dispatchGetContext();
    // then get the app instance
    dispatchGetAppInstance();

    if (window.frameElement) {
      this.setState({
        fullscreen: Boolean(window.parent.document.fullscreenElement),
      });
    }

    // set the language on first load
    this.handleChangeLang(lang);
    if (window.frameElement) {
      window.parent.document.addEventListener(
        'fullscreenchange',
        this.handleFullscreen
      );
    }
  }

  componentDidUpdate(prevProps) {
    const { lang: prevLang } = prevProps;
    const { lang } = this.props;
    // handle a change of language
    if (lang !== prevLang) {
      this.handleChangeLang(lang);
    }
  }

  componentWillUnmount() {
    if (window.frameElement) {
      window.parent.document.removeEventListener(
        'fullscreenchange',
        this.handleFullscreen
      );
    }
  }

  handleFullscreen = () => {
    if (window.frameElement) {
      const fullscreen = Boolean(window.parent.document.fullscreenElement);
      this.setState({
        fullscreen,
      });
    }
  };

  handleChangeLang = lang => {
    const { i18n } = this.props;
    i18n.changeLanguage(lang);
  };

  render() {
    const { mode, view } = this.props;
    const { fullscreen } = this.state;

    switch (mode) {
      // show teacher view when in producer (educator) mode
      case 'teacher':
      case 'producer':
      case 'educator':
      case 'admin':
        return (
          <>
            <Header />
            <TeacherMode view={view} />
          </>
        );

      // by default go with the consumer (learner) mode
      case 'student':
      case 'consumer':
      case 'learner':
        return (
          <MaximizableView>
            <StudentMode view={view} fullscreen={fullscreen} />
          </MaximizableView>
        );

      default:
        return <Loader />;
    }
  }
}

const mapStateToProps = ({ context, appInstance }) => {
  const { programmingLanguage } = appInstance.content.settings;

  return {
    lang: context.lang,
    mode: context.mode,
    view: context.view,
    appInstanceId: context.appInstanceId,
    programmingLanguage,
  };
};

const mapDispatchToProps = {
  dispatchGetContext: getContext,
  dispatchGetAppInstance: getAppInstance,
};

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default withTranslation()(ConnectedApp);
