import {
  LOGIN_REQUEST,
  LOGOUT_REQUEST,
  REGISTER_REQUEST,
  GET_USER_INFO_REQUEST,
  RESTORE_TOKENS_REQUEST
} from '../constants/actionTypes';

export function userInfoRequest() {
  return { type: GET_USER_INFO_REQUEST };
}

export function loginRequest({ email, password }) {
  return { type: LOGIN_REQUEST, email, password };
}

export function logoutRequest() {
  return { type: LOGOUT_REQUEST };
}

export function restoreTokensRequest() {
  return { type: RESTORE_TOKENS_REQUEST };
}

export function registerRequest({ email, login, password }) {
  return { type: REGISTER_REQUEST, email, login, password };
}
