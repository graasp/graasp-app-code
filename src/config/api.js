// local api
export const LOCAL_API_HOST = 'localhost:3636';

// endpoints
export const APP_INSTANCES_ENDPOINT = '/app-instances';
export const APP_INSTANCE_RESOURCES_ENDPOINT = '/app-instance-resources';
export const SPACES_ENDPOINT = '/spaces';
// users endpoint is currently used in conjunction with spaces endpoint
// e.g. `${SPACES_ENDPOINT}/${spaceId}/${USERS_ENDPOINT}`
export const USERS_ENDPOINT = 'light-users';

// request defaults
const DEFAULT_REQUEST = {
  headers: { 'content-type': 'application/json' },
  credentials: 'include',
};
export const DEFAULT_GET_REQUEST = {
  ...DEFAULT_REQUEST,
  method: 'GET',
};
export const DEFAULT_POST_REQUEST = {
  ...DEFAULT_REQUEST,
  method: 'POST',
};
export const DEFAULT_PATCH_REQUEST = {
  ...DEFAULT_REQUEST,
  method: 'PATCH',
};
export const DEFAULT_DELETE_REQUEST = {
  ...DEFAULT_REQUEST,
  method: 'DELETE',
};
