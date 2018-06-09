import {
  LOGIN_REQUEST,
  LOGOUT_REQUEST,
  REGISTER_REQUEST,
  GET_USER_INFO_REQUEST,
  RESTORE_TOKENS_REQUEST
} from '../constants/actionTypes';

/**
 * Sets the current user info
 * @param  {string} token user
 */
export function userInfoRequest() {
  return { type: GET_USER_INFO_REQUEST };
}

/**
 * Tells the app we want to log in a user
 * @param  {string} data.username The username of the user to log in
 * @param  {string} data.password The password of the user to log in
 */
export function loginRequest({ email, password }) {
  return { type: LOGIN_REQUEST, email, password };
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
export function registerRequest({ email, login, password }) {
  return { type: REGISTER_REQUEST, email, login, password };
}
