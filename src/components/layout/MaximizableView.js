// adapted from http://bit.ly/2S8Aifs
import React from 'react';
import PropTypes from 'prop-types';
import ReactGa from 'react-ga';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@material-ui/icons';
import Fab from '@material-ui/core/Fab';
import useFullscreenStatus from '../../hooks/useFullscreenStatus';
import { postAction } from '../../actions/action';
import { MAXIMIZED, MINIMIZED } from '../../config/verbs';

const useStyles = makeStyles(theme => ({
  fab: {
    margin: theme.spacing.unit,
    position: 'fixed',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
}));

function MaximizableView({ children }) {
  const maximizableElement = React.useRef(null);
  let isFullscreen;
  let setIsFullscreen;

  const classes = useStyles();
  const dispatch = useDispatch();

  try {
    [isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement);
  } catch (e) {
    console.error(e);
    isFullscreen = false;
    setIsFullscreen = undefined;
  }

  const handleExitFullscreen = () => document.exitFullscreen();

  const handleClick = () => {
    if (isFullscreen) {
      handleExitFullscreen().then();
    } else {
      setIsFullscreen();
    }

    // fire action and forget
    dispatch(
      postAction({
        verb: isFullscreen ? MINIMIZED : MAXIMIZED,
      })
    );

    ReactGa.event({
      category: 'code',
      action: isFullscreen ? MINIMIZED : MAXIMIZED,
    });
  };

  return (
    <div
      ref={maximizableElement}
      className={isFullscreen ? 'fullscreen' : 'default'}
    >
      {children}
      <Fab
        color="primary"
        className={classes.fab}
        onClick={handleClick}
        size="small"
      >
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </Fab>
    </div>
  );
}

MaximizableView.propTypes = {
  children: PropTypes.element.isRequired,
};

export default MaximizableView;
