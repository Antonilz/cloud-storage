import {
  SET_AUTH_STATUS,
  SENDING_REQUEST,
  REQUEST_ERROR,
  CLEAR_ERROR,
  GET_USER_INFO_SUCCESS,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  RESTORE_TOKENS_SUCCESS,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS
} from '../constants/actionTypes';
import { getToken } from '../utils/localStorage';

const initialState = {
  currentlySending: false,
  error: '',
  authenticated: false,
  user: {
    name: '',
    email: ''
  },
  token: {
    accessToken: getToken('accessToken'),
    refreshToken: getToken('refreshToken'),
    expiresIn: getToken('expiresIn'),
    isRefreshing: false
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_AUTH_STATUS:
      return { ...state, loggedIn: action.newAuthState };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        authenticated: false,
        user: { name: '', email: '' }
      };
    case SENDING_REQUEST:
      return { ...state, currentlySending: action.sending };
    case REQUEST_ERROR:
      return { ...state, error: action.error };
    case LOGIN_SUCCESS:
      return {
        ...state,
        ...action.data
      };
    case GET_USER_INFO_SUCCESS:
      return {
        ...state,
        user: { ...action.data }
      };
    case RESTORE_TOKENS_SUCCESS:
      return { ...state, token: { ...action.data } };
    case REFRESH_TOKEN_REQUEST:
      return { ...state, token: { ...state.token, isRefreshing: true } };
    case REFRESH_TOKEN_SUCCESS:
      return { ...state, token: { ...action.data.token, isRefreshing: false } };
    case CLEAR_ERROR:
      return { ...state, error: '' };
    default:
      return state;
  }
}
