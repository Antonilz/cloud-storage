//import { hashSync } from 'bcryptjs';
//import genSalt from '../auth/salt';
import { take, call, put, fork, race } from 'redux-saga/effects';
import axios from 'axios';
import { push } from 'react-router-redux';
import { API_URL } from '../constants/api';
import { setToken, deleteToken } from '../utils/localStorage';
import {
  SENDING_REQUEST,
  LOGIN_REQUEST,
  LOGOUT_REQUEST,
  REGISTER_REQUEST,
  SET_AUTH_STATUS,
  LOGOUT,
  REQUEST_ERROR,
  CLEAR_ERROR,
  GET_USER_SUCCESS,
  GET_USER_REQUEST
} from '../constants/actionTypes';

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function* authorize({ email, password, isRegistering }) {
  // We send an action that tells Redux we're sending a request
  yield put({ type: CLEAR_ERROR });
  yield put({ type: SENDING_REQUEST, sending: true });

  // We then try to register or log in the user, depending on the request
  try {
    //const salt = genSalt(username);
    //const hash = hashSync(password, salt);
    let response;
    if (isRegistering) {
      response = yield call(
        axios.post,
        `${API_URL}/auth/register`,
        email,
        password
      );
    } else {
      response = yield call(axios.post, `${API_URL}/auth/login`, {
        email,
        password
      });
    }
    return response;
  } catch (error) {
    yield put({ type: REQUEST_ERROR, error: error.message });

    return false;
  } finally {
    yield put({ type: SENDING_REQUEST, sending: false });
  }
}

/**
 * Effect to handle logging out
 */
export function* logout() {
  yield put({ type: SENDING_REQUEST, sending: true });
  try {
    //const response = yield call(axios.get, `${API_URL}/auth/logout`);
    yield put({ type: SENDING_REQUEST, sending: false });
    //return response;
    return { success: true };
  } catch (error) {
    yield put({ type: REQUEST_ERROR, error: error.message });
  }
}

/**
 * Log in saga
 */
export function* loginFlow() {
  while (true) {
    const request = yield take(LOGIN_REQUEST);
    const { email, password } = request.data;
    const winner = yield race({
      auth: call(authorize, { email, password, isRegistering: false }),
      logout: take(LOGOUT)
    });

    if (winner.auth) {
      setToken('accessToken', winner.auth.data.token.accessToken);
      setToken('refreshToken', winner.auth.data.token.refreshToken);
      yield put({ type: SET_AUTH_STATUS, status: true });
      yield put({ type: GET_USER_SUCCESS, data: winner.auth.data });
      yield put(push('/storage'));
    }
  }
}

/**
 * Log out saga
 */
export function* logoutFlow() {
  while (true) {
    yield take(LOGOUT_REQUEST);
    deleteToken('refreshToken');
    deleteToken('accessToken');
    yield put({ type: SET_AUTH_STATUS, newAuthState: true });
    // yield call(logout);
    yield put({ type: LOGOUT });
    yield put(push('/login'));
  }
}

/**
 * Register saga
 */
export function* registerFlow() {
  while (true) {
    const request = yield take(REGISTER_REQUEST);
    const { email, password } = request.data;
    const wasSuccessful = yield call(authorize, {
      email,
      password,
      isRegistering: true
    });

    if (wasSuccessful) {
      yield put({ type: SET_AUTH_STATUS, newAuthState: true });
      yield put(push('/storage'));
    }
  }
}

/**
 * Get user info saga
 */
export function* userInfoFlow() {
  while (true) {
    const request = yield take(GET_USER_REQUEST);
    const { refreshToken } = request;
    const response = yield call(axios.post, `${API_URL}/auth/refresh-token`, {
      refreshToken
    });
    if (response) {
      setToken('accessToken', response.data.token.accessToken);
      setToken('refreshToken', response.data.token.refreshToken);
      yield put({ type: GET_USER_SUCCESS, data: response.data });
    }
  }
}

export default function* authSagas() {
  yield fork(loginFlow);
  yield fork(logoutFlow);
  yield fork(registerFlow);
  yield fork(userInfoFlow);
}
