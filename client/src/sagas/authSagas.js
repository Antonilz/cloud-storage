//import { hashSync } from 'bcryptjs';
//import genSalt from '../auth/salt';
import {
  take,
  call,
  put,
  fork,
  race,
  select,
  takeLatest
} from 'redux-saga/effects';
import { delay } from 'redux-saga';
import axios from 'axios';
import moment from 'moment';
import { push } from 'react-router-redux';
import { API_URL } from '../constants/api';
import { setToken, deleteToken, getToken } from '../utils/localStorage';
import { selectTokensData } from '../selectors/authSelectors';
import {
  SENDING_REQUEST,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  REGISTER_REQUEST,
  SET_AUTH_STATUS,
  REQUEST_ERROR,
  CLEAR_ERROR,
  GET_USER_INFO_SUCCESS,
  GET_USER_INFO_REQUEST,
  GET_USER_INFO_FAILURE,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
  RESTORE_TOKENS_REQUEST,
  RESTORE_TOKENS_SUCCESS
} from '../constants/actionTypes';

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function* authorize({ email, password, isRegistering }) {
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
      logout: take(LOGOUT_REQUEST)
    });

    if (winner.auth) {
      setToken('accessToken', winner.auth.data.token.accessToken);
      setToken('refreshToken', winner.auth.data.token.refreshToken);
      setToken('expiresIn', winner.auth.data.token.expiresIn);
      yield put({ type: SET_AUTH_STATUS, status: true });
      yield put({ type: LOGIN_SUCCESS, data: winner.auth.data });
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
    deleteToken('expiresIn');
    yield put({ type: SET_AUTH_STATUS, newAuthState: true });
    // yield call(logout);
    yield put({ type: LOGOUT_SUCCESS });
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

export function* refreshTokens() {
  try {
    const { refreshToken } = yield select(selectTokensData);
    yield put({ type: REFRESH_TOKEN_REQUEST });
    const response = yield call(axios.post, `${API_URL}/auth/refresh-token`, {
      refreshToken
    });
    if (response) {
      yield put({ type: REFRESH_TOKEN_SUCCESS, data: response.data });
      return response;
    }
  } catch (error) {
    yield put({ type: REFRESH_TOKEN_FAILURE, error: error.message });
    yield put({ type: LOGOUT_REQUEST });
    return false;
  } finally {
    //yield put({ type: SENDING_REQUEST, sending: false });
  }
}

export function* needRefresh() {
  const { expiresIn } = yield select(selectTokensData);
  return moment(expiresIn).isBefore();
}

export function authedSaga(saga) {
  return function*(...args) {
    const { isRefreshing } = yield select(selectTokensData);
    if (isRefreshing) {
      while (true) {
        const gotToken = yield take(REFRESH_TOKEN_SUCCESS);
        if (gotToken) {
          break;
        }
      }
      //delay(500);
    }
    const shouldRefresh = yield call(needRefresh);
    if (shouldRefresh) {
      const refreshResponse = yield call(refreshTokens);
      if (refreshResponse) {
        setToken('accessToken', refreshResponse.data.token.accessToken);
        setToken('refreshToken', refreshResponse.data.token.refreshToken);
        setToken('expiresIn', refreshResponse.data.token.expiresIn);
      }
    }
    const { accessToken } = yield select(selectTokensData);
    const response = yield call(saga, { accessToken, ...args[0] });
  };
}

export function* restoreTokens() {
  try {
    const tokensData = {
      accessToken: getToken('accessToken'),
      refreshToken: getToken('refreshToken'),
      expiresIn: getToken('expiresIn')
    };
    yield put({ type: RESTORE_TOKENS_SUCCESS, data: { ...tokensData } });
  } catch (error) {
    //yield put({ type: REFRESH_TOKEN_FAILURE, error: error.message });
    yield put({ type: LOGOUT_REQUEST });
    return false;
  } finally {
    //yield put({ type: SENDING_REQUEST, sending: false });
  }
}

export function* restoreTokensFlow() {
  yield takeLatest(RESTORE_TOKENS_REQUEST, restoreTokens);
}

export function* getUserInfo() {
  const { accessToken } = yield select(selectTokensData);
  try {
    const response = yield call(axios.get, `${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (response) {
      yield put({ type: GET_USER_INFO_SUCCESS, data: response.data });
    }
  } catch (error) {
    yield put({ type: GET_USER_INFO_FAILURE, error: error.message });
    return false;
  } finally {
    //yield put({ type: SENDING_REQUEST, sending: false });
  }
}

/**
 * Get user info saga
 */
export function* getUserInfoFlow() {
  yield takeLatest(GET_USER_INFO_REQUEST, authedSaga(getUserInfo));
}

export default function* authSagas() {
  yield fork(loginFlow);
  yield fork(logoutFlow);
  yield fork(registerFlow);
  yield fork(getUserInfoFlow);
  yield fork(restoreTokensFlow);
}
