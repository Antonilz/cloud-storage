import {
  SET_AUTH_STATUS,
  SENDING_REQUEST,
  REQUEST_ERROR,
  CLEAR_ERROR,
  GET_USER_SUCCESS,
  LOGOUT
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
    refreshToken: getToken('refreshToken')
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_AUTH_STATUS:
      return { ...state, loggedIn: action.newAuthState };
    case LOGOUT:
      return {
        ...state,
        authenticated: false,
        user: { name: '', email: '' }
      };
    case SENDING_REQUEST:
      return { ...state, currentlySending: action.sending };
    case REQUEST_ERROR:
      return { ...state, error: action.error };
    case GET_USER_SUCCESS:
      return {
        ...state,
        user: { name: action.data.user.name, email: action.data.user.email },
        token: {
          accessToken: action.data.token.accessToken,
          refreshToken: action.data.token.refreshToken
        }
      };
    case CLEAR_ERROR:
      return { ...state, error: '' };
    default:
      return state;
  }
}
