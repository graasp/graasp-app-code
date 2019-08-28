import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import { MonacoDiffEditor } from 'react-monaco-editor';

class DiffDialog extends Component {
  state = {
    input: '',
  };

  static propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    response: PropTypes.string.isRequired,
    programmingLanguage: PropTypes.string.isRequired,
    text: PropTypes.string,
    submitText: PropTypes.string,
    cancelText: PropTypes.string,
    initialInput: PropTypes.string,
  };

  static defaultProps = {
    text: '',
    submitText: 'Submit',
    cancelText: 'Cancel',
    initialInput: '',
  };

  componentDidMount() {
    const { initialInput } = this.props;
    if (initialInput !== '') {
      this.setState({
        input: initialInput,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialInput } = this.props;
    const { initialInput: prevInitialInput } = prevProps;
    const { input: prevInput } = prevState;

    // only update state if it is sure to not trigger a infinite render loop
    if (prevInitialInput !== initialInput && prevInput !== initialInput) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ input: initialInput });
    }
  }

  handleChangeFeedback = value => {
    this.setState({
      input: value,
    });
  };

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    const {
      id,
      open,
      handleClose,
      handleSubmit,
      title,
      text,
      response,
      submitText,
      cancelText,
      programmingLanguage,
    } = this.props;

    const { input } = this.state;

    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
          fullScreen
        >
          <DialogTitle id="form-dialog-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{text}</DialogContentText>
            <MonacoDiffEditor
              name={id}
              onChange={this.handleChangeFeedback}
              original={response}
              value={input}
              height="600px"
              width="100%"
              language={programmingLanguage}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              {cancelText}
            </Button>
            <Button onClick={() => handleSubmit(input)} color="primary">
              {submitText}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default DiffDialog;
