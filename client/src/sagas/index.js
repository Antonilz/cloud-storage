import authSagas from './authSagas';
import storageSagas from './storageSagas';
import { all } from 'redux-saga/effects';

export default function* indexSaga() {
  yield all([storageSagas(), authSagas()]);
}
