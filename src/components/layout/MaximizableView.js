// adapted from http://bit.ly/2S8Aifs
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@material-ui/icons';
import Fab from '@material-ui/core/Fab';
import useFullscreenStatus from '../../hooks/useFullscreenStatus';

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

  try {
    [isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement);
  } catch (e) {
    console.error(e);
    isFullscreen = false;
    setIsFullscreen = undefined;
  }

  const handleExitFullscreen = () => document.exitFullscreen();

  return (
    <div
      ref={maximizableElement}
      className={isFullscreen ? 'fullscreen' : 'default'}
    >
      {children}
      <Fab
        color="primary"
        className={classes.fab}
        onClick={isFullscreen ? handleExitFullscreen : setIsFullscreen}
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
