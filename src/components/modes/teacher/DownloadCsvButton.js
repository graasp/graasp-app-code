import React from 'react';
import PropTypes from 'prop-types';
import { CSVLink as CsvLink } from 'react-csv';
import { connect } from 'react-redux';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import { withTranslation } from 'react-i18next';

const DownloadCsvButton = ({ appInstanceResources, users, t }) => {
  if (!appInstanceResources.length || !users.length) {
    return null;
  }

  const csvData = appInstanceResources.map(({ data, user }) => {
    const userData = users.find(({ id }) => id === user);
    const name = userData ? userData.name : t('Anonymous');
    return { name, data };
  });

  return (
    <CsvLink data={csvData} filename="data.csv">
      <DownloadIcon color="secondary" />
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
