import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';

class FormDialog extends Component {
  state = {
    input: '',
  };

  static propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
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

  handleChangeTextField = event => {
    this.setState({
      input: event.target.value,
    });
  };

  render() {
    const {
      open,
      handleClose,
      handleSubmit,
      title,
      text,
      submitText,
      cancelText,
    } = this.props;

    const { input } = this.state;

    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{text}</DialogContentText>
            <TextField
              key="inputTextField"
              id="inputTextField"
              multiline
              value={input}
              rowsMax="5"
              onChange={this.handleChangeTextField}
              margin="dense"
              fullWidth
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

export default FormDialog;
