import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  KeyboardReturn as KeyboardReturnIcon,
  Close as CloseIcon,
} from '@material-ui/icons';
import PropTypes from 'prop-types';
import { Tooltip, IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  closeButton: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  root: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(3),
  },
});

class FormDialog extends Component {
  state = {
    input: '',
  };

  static propTypes = {
    classes: PropTypes.shape({
      root: PropTypes.string,
      closeButton: PropTypes.string,
    }).isRequired,
    open: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    title: PropTypes.string,
    text: PropTypes.string,
    label: PropTypes.string,
    submitText: PropTypes.string,
    initialInput: PropTypes.string,
  };

  static defaultProps = {
    title: '',
    text: '',
    submitText: '',
    initialInput: '',
    label: '',
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

  handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleSubmit();
    }
  };

  handleCancel = () => {
    const { handleCancel } = this.props;
    handleCancel();
    this.setState({ input: '' });
  };

  handleSubmit = () => {
    const { handleSubmit } = this.props;
    const { input } = this.state;
    handleSubmit(input);
    this.setState({ input: '' });
  };

  render() {
    const { classes, open, title, label, text, submitText } = this.props;

    const { input } = this.state;

    return (
      <div>
        <Dialog
          open={open}
          onClose={this.handleCancel}
          aria-labelledby="form-dialog-title"
          PaperProps={{
            className: classes.root,
          }}
        >
          <IconButton
            className={classes.closeButton}
            aria-label="cancel"
            size="small"
            onClick={this.handleCancel}
          >
            <CloseIcon />
          </IconButton>
          {title && <DialogTitle id="form-dialog-title">{title}</DialogTitle>}
          <DialogContent>
            {text && <DialogContentText>{text}</DialogContentText>}
            <TextField
              autoFocus
              key="inputTextField"
              id="inputTextField"
              label={label}
              value={input}
              variant="outlined"
              onChange={this.handleChangeTextField}
              margin="dense"
              fullWidth
              onKeyPress={this.handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            {submitText ? (
              <Button
                onClick={this.handleSubmit}
                color="primary"
                variant="contained"
              >
                {submitText}
              </Button>
            ) : (
              <Tooltip title="Submit">
                <IconButton
                  aria-label="submit"
                  color="primary"
                  onClick={this.handleSubmit}
                >
                  <KeyboardReturnIcon />
                </IconButton>
              </Tooltip>
            )}
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const StyledComponent = withStyles(styles)(FormDialog);

export default StyledComponent;
