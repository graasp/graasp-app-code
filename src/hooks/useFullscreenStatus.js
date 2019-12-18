// adapted from http://bit.ly/34DHYZz
import React from 'react';

function getBrowserFullscreenElementProp() {
  if (typeof document.fullscreenElement !== 'undefined') {
    return 'fullscreenElement';
  }
  if (typeof document.mozFullScreenElement !== 'undefined') {
    return 'mozFullScreenElement';
  }
  if (typeof document.msFullscreenElement !== 'undefined') {
    return 'msFullscreenElement';
  }
  if (typeof document.webkitFullscreenElement !== 'undefined') {
    return 'webkitFullscreenElement';
  }
  throw new Error('fullscreenElement is not supported by this browser');
}

export default function useFullscreenStatus(elRef) {
  const [isFullscreen, setIsFullscreen] = React.useState(
    document[getBrowserFullscreenElementProp()] != null
  );

  const setFullscreen = () => {
    if (elRef.current == null) return;

    elRef.current
      .requestFullscreen()
      .then(() => {
        setIsFullscreen(document[getBrowserFullscreenElementProp()] != null);
      })
      .catch(() => {
        setIsFullscreen(false);
      });
  };

  React.useLayoutEffect(() => {
    document.onfullscreenchange = () =>
      setIsFullscreen(document[getBrowserFullscreenElementProp()] != null);

    return () => {
      document.onfullscreenchange = undefined;
    };
  });

  return [isFullscreen, setFullscreen];
}
