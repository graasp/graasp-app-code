import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TeacherView from './modes/teacher/TeacherView';
import StudentMode from './modes/student/StudentMode';
import { getContext } from '../actions';
import { DEFAULT_LANG, DEFAULT_MODE } from '../config/settings';
import { getAppInstance } from '../actions/appInstance';
import { DEFAULT_VIEW } from '../config/views';

export class App extends Component {
  static propTypes = {
    i18n: PropTypes.shape({
      defaultNS: PropTypes.string,
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

  constructor(props) {
    super(props);
    // first thing to do is get the context
    props.dispatchGetContext();
    // then get the app instance
    props.dispatchGetAppInstance();
  }

  componentDidMount() {
    const { lang } = this.props;
    // set the language on first load
    this.handleChangeLang(lang);
  }

  componentDidUpdate({ lang: prevLang }) {
    const { lang } = this.props;
    // handle a change of language
    if (lang !== prevLang) {
      this.handleChangeLang(lang);
    }
  }

  handleChangeLang = lang => {
    const { i18n } = this.props;
    i18n.changeLanguage(lang);
  };

  render() {
    const { mode, view } = this.props;

    switch (mode) {
      // show teacher view when in producer (educator) mode
      case 'teacher':
      case 'producer':
      case 'educator':
      case 'admin':
        return <TeacherView />;

      // by default go with the consumer (learner) mode
      case 'student':
      case 'consumer':
      case 'learner':
      default:
        return <StudentMode view={view} />;
    }
  }
}

const mapStateToProps = ({ context }) => ({
  lang: context.lang,
  mode: context.mode,
  view: context.view,
  appInstanceId: context.appInstanceId,
});

const mapDispatchToProps = {
  dispatchGetContext: getContext,
  dispatchGetAppInstance: getAppInstance,
};

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default withTranslation()(ConnectedApp);
