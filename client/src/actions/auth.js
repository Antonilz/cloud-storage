import {
  SET_AUTH_STATUS,
  SENDING_REQUEST,
  LOGIN_REQUEST,
  LOGOUT_REQUEST,
  REGISTER_REQUEST,
  REQUEST_ERROR,
  CLEAR_ERROR,
  GET_USER_INFO_REQUEST,
  RESTORE_TOKENS_REQUEST
} from '../constants/actionTypes';

/**
 * Sets the authentication state of the application
 * @param  {boolean} newAuthState True means a user is logged in, false means no user is logged in
 */
export function setAuthState(newAuthState) {
  return { type: SET_AUTH_STATUS, newAuthState };
}

/**
 * Sets the current user info
 * @param  {string} token user
 */
export function userInfoRequest() {
  return { type: GET_USER_INFO_REQUEST };
}

/**
 * Sets the `currentlySending` state, which displays a loading indicator during requests
 * @param  {boolean} sending True means we're sending a request, false means we're not
 */
export function sendingRequest(sending) {
  return { type: SENDING_REQUEST, sending };
}

/**
 * Tells the app we want to log in a user
 * @param  {object} data          The data we're sending for log in
 * @param  {string} data.username The username of the user to log in
 * @param  {string} data.password The password of the user to log in
 */
export function loginRequest(data) {
  return { type: LOGIN_REQUEST, data };
}

export function logoutRequest() {
  return { type: LOGOUT_REQUEST };
}

export function restoreTokensRequest() {
  return { type: RESTORE_TOKENS_REQUEST };
}

/**
 * Tells the app we want to register a user
 * @param  {object} data          The data we're sending for registration
 * @param  {string} data.username The username of the user to register
 * @param  {string} data.password The password of the user to register
 */
export function registerRequest(data) {
  return { type: REGISTER_REQUEST, data };
}

/**
 * Sets the `error` state to the error received
 * @param  {object} error The error we got when trying to make the request
 */
export function requestError(error) {
  return { type: REQUEST_ERROR, error };
}

/**
 * Sets the `error` state as empty
 */
export function clearError() {
  return { type: CLEAR_ERROR };
}
