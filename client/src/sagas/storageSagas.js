import {
  take,
  call,
  put,
  fork,
  takeEvery,
  takeLatest
} from 'redux-saga/effects';
import axios from 'axios';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';
import { API_URL } from '../constants/api';
import { NotificationManager } from 'react-notifications';
import { authedSaga } from './authSagas';
import {
  GET_FOLDER_REQUEST,
  GET_FOLDER_SUCCESS,
  GET_FOLDER_FAILURE,
  CREATE_FOLDER_REQUEST,
  CREATE_FOLDER_SUCCESS,
  CREATE_FOLDER_FAILURE,
  CREATE_FILE_SUCCESS,
  CREATE_FILE_REQUEST,
  CREATE_FILE_FAILURE,
  DELETE_SELECTED_ITEMS_SUCCESS,
  DELETE_SELECTED_ITEMS_REQUEST,
  DELETE_SELECTED_ITEMS_FAILURE,
  SEARCH_ITEMS_REQUEST,
  SEARCH_ITEMS_SUCCESS,
  SEARCH_ITEMS_FAILURE
} from '../constants/actionTypes';
/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function* getFolderInfo({ accessToken, pathSlug, notInitial }) {
  try {
    const response = yield call(
      axios.get,
      `${API_URL}/storage/folders/${pathSlug}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      /*if (notInitial) {
        yield put(push(`/storage/${pathSlug}`));
    }*/
      yield put({ type: GET_FOLDER_SUCCESS, data: response.data });
    }
  } catch (error) {
    yield put({ type: GET_FOLDER_FAILURE, error: error.message });
    return false;
  }
}

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function* searchItems({ accessToken, queryInput }) {
  try {
    const response = yield call(
      axios.get,
      `${API_URL}/storage/items/search/${queryInput}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      yield put({ type: SEARCH_ITEMS_SUCCESS, data: response.data });
    }
  } catch (error) {
    yield put({ type: SEARCH_ITEMS_FAILURE, error: error.message });
    return false;
  } finally {
    //yield put({ type: SENDING_REQUEST, sending: false });
  }
}

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function* createFolder({ accessToken, name, path, promise }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/folders/${path}`,
      { name: name },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      yield put({ type: CREATE_FOLDER_SUCCESS, folder: response.data });
      yield put(reset('createFolderForm'));
    }
    return response;
  } catch (error) {
    yield put({ type: CREATE_FOLDER_FAILURE, error: error.message });
    return false;
  } finally {
    //yield put({ type: SENDING_REQUEST, sending: false });
  }
}

export function* deleteSelectedItems({ accessToken, selectedItems }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/items/delete`,
      { items: selectedItems },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      const idsToDelete = selectedItems.map(item => item.data.id);

      yield put({ type: DELETE_SELECTED_ITEMS_SUCCESS, idsToDelete });
    }
  } catch (error) {
    yield put({ type: DELETE_SELECTED_ITEMS_FAILURE, error: error.message });
    return false;
  } finally {
    //yield put({ type: SENDING_REQUEST, sending: false });
  }
}

export function* createFile({ accessToken, path, file, samePath }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/files/${path}`,
      { ...file },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      NotificationManager.success(file.name, 'File uploaded', 3000);
      if (samePath) {
        yield put({ type: CREATE_FILE_SUCCESS, file: response.data });
      }
    }
  } catch (error) {
    yield put({ type: CREATE_FILE_FAILURE, error: error.message });
    NotificationManager.error(file.name, 'Failed uploading', 3000);
    return false;
  } finally {
    //yield put({ type: SENDING_REQUEST, sending: false });
  }
}

export function* deleteSelectedItemsFlow() {
  yield takeEvery(
    DELETE_SELECTED_ITEMS_REQUEST,
    authedSaga(deleteSelectedItems)
  );
}

export function* getFolderInfoFlow() {
  yield takeLatest(GET_FOLDER_REQUEST, authedSaga(getFolderInfo));
}

export function* searchItemsFlow() {
  yield takeLatest(SEARCH_ITEMS_REQUEST, authedSaga(searchItems));
}

export function* createFolderFlow() {
  yield takeEvery(CREATE_FOLDER_REQUEST, authedSaga(createFolder));
}

export function* createFileFlow() {
  yield takeEvery(CREATE_FILE_REQUEST, authedSaga(createFile));
}

export default function* storageSagas() {
  yield fork(getFolderInfoFlow);
  yield fork(createFolderFlow);
  yield fork(createFileFlow);
  yield fork(deleteSelectedItemsFlow);
  yield fork(searchItemsFlow);
}
