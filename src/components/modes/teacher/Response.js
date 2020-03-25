import _ from 'lodash';
import React, { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import ConfirmDialog from '../../common/ConfirmDialog';
import {
  deleteAppInstanceResource,
  patchAppInstanceResource,
  postAppInstanceResource,
} from '../../../actions';
import { FEEDBACK } from '../../../config/appInstanceResourceTypes';
import DiffDialog from '../../common/DiffDialog';
import { showErrorToast } from '../../../utils/toasts';

class Response extends Component {
  state = {
    confirmDialogOpen: false,
    feedbackDialogOpen: false,
  };

  static propTypes = {
    t: PropTypes.func.isRequired,
    activity: PropTypes.bool.isRequired,
    dispatchDeleteAppInstanceResource: PropTypes.func.isRequired,
    dispatchPostAppInstanceResource: PropTypes.func.isRequired,
    dispatchPatchAppInstanceResource: PropTypes.func.isRequired,
    _id: PropTypes.string.isRequired,
    programmingLanguage: PropTypes.string.isRequired,
    data: PropTypes.string,
    student: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    feedbackResource: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      data: PropTypes.string,
    }),
  };

  static defaultProps = {
    data: '',
    feedbackResource: {},
  };

  handleToggleConfirmDialog = open => () => {
    this.setState({
      confirmDialogOpen: open,
    });
  };

  handleToggleFeedbackDialog = open => () => {
    this.setState({
      feedbackDialogOpen: open,
    });
  };

  handleConfirmDelete = () => {
    const {
      _id,
      dispatchDeleteAppInstanceResource,
      feedbackResource,
    } = this.props;
    dispatchDeleteAppInstanceResource({ id: _id });
    if (!_.isEmpty(feedbackResource)) {
      dispatchDeleteAppInstanceResource({ id: feedbackResource._id });
    }
    this.handleToggleConfirmDialog(false)();
  };

  handleSubmitFeedback = feedback => {
    const {
      student,
      feedbackResource,
      dispatchPostAppInstanceResource,
      dispatchPatchAppInstanceResource,
      dispatchDeleteAppInstanceResource,
    } = this.props;

    const { id } = student;

    if (!id) {
      showErrorToast(
        'Currently we do not support giving feedback to anonymous users.'
      );
    }

    // if the feedback the feedback submitted is an empty string and
    // feedback existed previously, then delete the resource instead
    // of saving an empty string
    if (feedback === '') {
      if (!_.isEmpty(feedbackResource)) {
        dispatchDeleteAppInstanceResource({ id: feedbackResource._id });
      }
      return this.handleToggleFeedbackDialog(false)();
    }

    // if no feedback resource yet, create it, otherwise, update it
    if (_.isEmpty(feedbackResource)) {
      dispatchPostAppInstanceResource({
        data: feedback,
        userId: id,
        type: FEEDBACK,
      });
    } else {
      dispatchPatchAppInstanceResource({
        id: feedbackResource._id,
        data: feedback,
      });
    }
    return this.handleToggleFeedbackDialog(false)();
  };

  renderFeedbackCell() {
    const {
      _id,
      feedbackResource: { data = '' },
      t,
      data: response,
      programmingLanguage,
    } = this.props;
    const { feedbackDialogOpen } = this.state;

    const iconComponent = (
      <IconButton
        color="primary"
        onClick={this.handleToggleFeedbackDialog(true)}
      >
        <EditIcon />
      </IconButton>
    );

    const tableCells = [
      <TableCell>
        <SyntaxHighlighter language={programmingLanguage}>
          {_.truncate(data)}
        </SyntaxHighlighter>
      </TableCell>,
      <TableCell>{iconComponent}</TableCell>,
    ];
    return (
      <>
        {data ? tableCells : iconComponent}
        <DiffDialog
          id={_id}
          handleClose={this.handleToggleFeedbackDialog(false)}
          title={t('Feedback')}
          text={t('Submit feedback that will be visible to the student.')}
          open={feedbackDialogOpen}
          response={response}
          initialInput={data}
          handleSubmit={this.handleSubmitFeedback}
          programmingLanguage={programmingLanguage}
        />
      </>
    );
  }

  render() {
    const { t, _id, data, student, activity, programmingLanguage } = this.props;

    const { confirmDialogOpen } = this.state;

    return (
      <TableRow key={_id}>
        <TableCell>{activity ? <CircularProgress /> : student.name}</TableCell>
        <TableCell>
          <SyntaxHighlighter language={programmingLanguage}>
            {_.truncate(data)}
          </SyntaxHighlighter>
        </TableCell>
        <TableCell>{this.renderFeedbackCell()}</TableCell>
        <TableCell>
          <IconButton
            color="primary"
            onClick={this.handleToggleConfirmDialog(true)}
          >
            <DeleteIcon />
          </IconButton>
          <ConfirmDialog
            open={confirmDialogOpen}
            title={t('Delete Student Response')}
            text={t(
              "By clicking 'Delete', you will be deleting the student's response. This action cannot be undone."
            )}
            handleClose={this.handleToggleConfirmDialog(false)}
            handleConfirm={this.handleConfirmDelete}
            confirmText={t('Delete')}
            cancelText={t('Cancel')}
          />
        </TableCell>
      </TableRow>
    );
  }
}

const mapStateToProps = ({ appInstanceResources, users }, ownProps) => {
  const {
    student: { id },
  } = ownProps;
  const feedbackResource = appInstanceResources.content.find(
    ({ user, type }) => {
      return user === id && type === FEEDBACK;
    }
  );
  return {
    feedbackResource,
    activity: users.activity.length,
  };
};

// allow this component to dispatch a post
// request to create an app instance resource
const mapDispatchToProps = {
  dispatchPostAppInstanceResource: postAppInstanceResource,
  dispatchPatchAppInstanceResource: patchAppInstanceResource,
  dispatchDeleteAppInstanceResource: deleteAppInstanceResource,
};

const ConnectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(Response);

const TranslatedComponent = withTranslation()(ConnectedComponent);

export default TranslatedComponent;
