import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  image: {
    width: '100%',
  },
}));

const Figures = ({ figures }) => {
  const classes = useStyles();
  return figures.map((figure, i) => {
    // todo: do not use index as key
    const key = i + 0;
    return (
      <Grid item xs={12} key={key}>
        <img src={figure} alt="figure" className={classes.image} />
      </Grid>
    );
  });
};

const mapStateToProps = ({ code }) => ({
  figures: code.figures,
});

const ConnectedComponent = connect(mapStateToProps)(Figures);

export default ConnectedComponent;
