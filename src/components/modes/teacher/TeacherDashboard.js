import React, { Component } from 'react';
import _ from 'lodash';
import Stopword from 'stopword';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import WordCloud from 'react-wordcloud';
import { withStyles } from '@material-ui/core/styles';
import { INPUT } from '../../../config/appInstanceResourceTypes';

class TeacherDashboard extends Component {
  static propTypes = {
    words: PropTypes.arrayOf(PropTypes.string),
    classes: PropTypes.shape({
      container: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    words: [],
  };

  static styles = {
    container: {
      // 64px is the height of the header
      height: 'calc(100% - 64px)',
      width: '100%',
    },
  };

  render() {
    const { words, classes } = this.props;
    return (
      <div className={classes.container}>
        <WordCloud words={words} />
      </div>
    );
  }
}

const mapStateToProps = ({ appInstanceResources }) => {
  const wordArray = _.flatten(
    appInstanceResources.content
      .filter(resource => resource.type === INPUT)
      .map(resource => _.words(_.toLower(resource.data)))
  );

  // strip stopwords
  const strippedWordArray = Stopword.removeStopwords(wordArray);

  // create a map with the counts of each word
  const wordMap = {};
  strippedWordArray.forEach(word => {
    if (wordMap[word]) {
      wordMap[word] += 1;
    } else {
      wordMap[word] = 1;
    }
  });

  // prepare map in format required by word cloud
  const words = Object.keys(wordMap).map(word => ({
    text: word,
    value: wordMap[word],
  }));
  return {
    words,
  };
};

const StyledComponent = withStyles(TeacherDashboard.styles)(TeacherDashboard);

export default connect(mapStateToProps)(StyledComponent);
