import { routerReducer } from 'react-router-redux';
import { reducer as reduxForm } from 'redux-form';
import { combineReducers } from 'redux';
import authReducer from './authReducer';
import storageReducer from './storageReducer';

export default combineReducers({
  router: routerReducer,
  form: reduxForm,
  auth: authReducer,
  storage: storageReducer
});
