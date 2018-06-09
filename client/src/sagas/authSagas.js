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
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  REQUEST_ERROR,
  GET_USER_INFO_SUCCESS,
  GET_USER_INFO_REQUEST,
  GET_USER_INFO_FAILURE,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
  RESTORE_TOKENS_REQUEST,
  RESTORE_TOKENS_SUCCESS
} from '../constants/actionTypes';

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

export function* register({ email, login, password }) {
  try {
    const response = yield call(axios.post, `${API_URL}/auth/register`, {
      email,
      name: login,
      password
    });
    if (response) {
      setToken('accessToken', response.data.token.accessToken);
      setToken('refreshToken', response.data.token.refreshToken);
      setToken('expiresIn', response.data.token.expiresIn);
      yield put({ type: REGISTER_SUCCESS, data: response.data });
      yield put(push('/storage/home'));
    }
  } catch (error) {
    yield put({ type: REGISTER_FAILURE, error: error.message });
    return false;
  }
}

export function* login({ email, password }) {
  try {
    console.log(email, password);
    const response = yield call(axios.post, `${API_URL}/auth/login`, {
      email,
      password
    });
    if (response) {
      console.log(response);
      setToken('accessToken', response.data.token.accessToken);
      setToken('refreshToken', response.data.token.refreshToken);
      setToken('expiresIn', response.data.token.expiresIn);
      yield put({ type: LOGIN_SUCCESS, data: response.data });
      yield put(push('/storage/home'));
    }
  } catch (error) {
    yield put({ type: LOGIN_FAILURE, error: error.message });
    return false;
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

export function* logoutFlow() {
  while (true) {
    yield take(LOGOUT_REQUEST);
    deleteToken('refreshToken');
    deleteToken('accessToken');
    deleteToken('expiresIn');
    // yield call(logout);
    yield put({ type: LOGOUT_SUCCESS });
    yield put(push('/auth/login'));
  }
}

export function* getUserInfoFlow() {
  yield takeLatest(GET_USER_INFO_REQUEST, authedSaga(getUserInfo));
}

export function* registerFlow() {
  yield takeLatest(REGISTER_REQUEST, register);
}

export function* loginFlow() {
  yield takeLatest(LOGIN_REQUEST, login);
}

export function* restoreTokensFlow() {
  yield takeLatest(RESTORE_TOKENS_REQUEST, restoreTokens);
}

export default function* authSagas() {
  yield fork(loginFlow);
  yield fork(logoutFlow);
  yield fork(registerFlow);
  yield fork(getUserInfoFlow);
  yield fork(restoreTokensFlow);
}
