import React from 'react';
import PropTypes from 'prop-types';
import { CSVLink as CsvLink } from 'react-csv';
import { connect } from 'react-redux';
import _ from 'lodash';
import { IconButton } from '@material-ui/core';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import { withTranslation } from 'react-i18next';
import { Parser } from 'json2csv';
import { INPUT, FEEDBACK } from '../../../config/appInstanceResourceTypes';

const DownloadCsvButton = ({ appInstanceResources, users, t }) => {
  // if there are no users or no app instance resources do not show button
  if (!appInstanceResources.length || !users.length) {
    return null;
  }

  const formattedData = Object.entries(
    _.groupBy(appInstanceResources, 'user')
  ).map(([user, elements]) => {
    try {
      const userData = users.find(({ id }) => id === user);
      const name = userData ? userData.name : t('Anonymous');

      // fall back to empty object in case there is no match
      const { data: input } = elements.find(({ type }) => type === INPUT) || {};

      // if there is no input, we ignore this entry
      if (!input) {
        return undefined;
      }

      const entry = { name, input };

      // export feedback if any
      const feedback = elements.find(({ type }) => type === FEEDBACK);
      if (feedback) {
        entry.feedback = feedback.data;
      }
      return entry;
    } catch {
      return undefined;
    }
  });

  // do not show download button if there is an issue parsing the data
  let csvData;
  try {
    const json2csvParser = new Parser();
    csvData = json2csvParser.parse(formattedData);
  } catch {
    return null;
  }

  return (
    <CsvLink data={csvData} filename="data.csv">
      <IconButton>
        <DownloadIcon color="secondary" />
      </IconButton>
    </CsvLink>
  );
};

DownloadCsvButton.propTypes = {
  t: PropTypes.func.isRequired,
  appInstanceResources: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
    })
  ),
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

DownloadCsvButton.defaultProps = {
  users: [],
  appInstanceResources: [],
};

const mapStateToProps = ({ appInstanceResources, users }) => ({
  appInstanceResources: appInstanceResources.content,
  users: users.content,
});

const ConnectedComponent = connect(
  mapStateToProps,
  null
)(DownloadCsvButton);

export default withTranslation()(ConnectedComponent);
