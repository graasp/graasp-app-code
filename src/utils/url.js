import Qs from 'qs';

// todo: remove when more items are exported
// eslint-disable-next-line import/prefer-default-export
export const addQueryParamsToUrl = obj => {
  const params = {
    ...Qs.parse(window.location.search, { ignoreQueryPrefix: true }),
    ...obj,
  };
  return `?${Qs.stringify(params)}`;
};
