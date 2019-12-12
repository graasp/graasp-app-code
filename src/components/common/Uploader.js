import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { DragDrop } from '@uppy/react';
import {
  DEFAULT_VISIBILITY,
  MAX_FILE_SIZE,
  MAX_NUM_FILES,
} from '../../config/settings';
import { FILE_UPLOAD_ENDPOINT } from '../../config/api';
import '@uppy/core/dist/style.css';
import '@uppy/drag-drop/dist/style.css';
import { postAppInstanceResource } from '../../actions';
import { FILE } from '../../config/appInstanceResourceTypes';
import { showErrorToast } from '../../utils/toasts';

class Uploader extends Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    dispatchPostAppInstanceResource: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    visibility: PropTypes.string,
  };

  static defaultProps = {
    visibility: DEFAULT_VISIBILITY,
  };

  constructor(props) {
    super(props);

    const { dispatchPostAppInstanceResource, userId, visibility } = props;

    this.uppy = Uppy({
      restrictions: {
        maxNumberOfFiles: MAX_NUM_FILES,
        maxFileSize: MAX_FILE_SIZE,
      },
      autoProceed: true,
    });

    // endpoint
    this.uppy.use(XHRUpload, { endpoint: FILE_UPLOAD_ENDPOINT });

    this.uppy.on('complete', ({ successful }) => {
      successful.forEach(({ response: { body: uri }, name }) => {
        dispatchPostAppInstanceResource({
          data: {
            name,
            uri,
          },
          userId,
          type: FILE,
          visibility,
        });
      });
    });

    this.uppy.on('error', (file, error) => {
      showErrorToast(error);
    });

    this.uppy.on('upload-error', (file, error, response) => {
      showErrorToast(response);
    });

    this.uppy.on('restriction-failed', (file, error) => {
      showErrorToast(error);
    });
  }

  render() {
    const { t } = this.props;
    return (
      <DragDrop
        uppy={this.uppy}
        locale={{
          strings: {
            dropHereOr: t('Drop Here or Click to Browse'),
          },
        }}
      />
    );
  }
}

const mapStateToProps = state => {
  const {
    context: { userId },
  } = state;
  return {
    userId,
  };
};

const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
};

const TranslatedComponent = withTranslation()(Uploader);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TranslatedComponent);
