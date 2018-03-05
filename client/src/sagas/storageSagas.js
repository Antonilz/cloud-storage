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
import {
  SENDING_REQUEST,
  REQUEST_ERROR,
  CLEAR_ERROR,
  GET_FOLDER_REQUEST,
  GET_FOLDER_SUCCESS,
  CREATE_FOLDER_REQUEST,
  CREATE_FOLDER_SUCCESS,
  CREATE_FILE_SUCCESS,
  CREATE_FILE_REQUEST,
  DELETE_SELECTED_ITEMS_SUCCESS,
  DELETE_SELECTED_ITEMS_REQUEST,
  SEARCH_ITEMS_REQUEST,
  SEARCH_ITEMS_SUCCESS
} from '../constants/actionTypes';

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function* getFolderInfo({ path, token, notInitial }) {
  yield put({ type: CLEAR_ERROR });

  try {
    const response = yield call(
      axios.get,
      `${API_URL}/storage/folders/${path}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (response) {
      if (notInitial) {
        yield put(push(`/storage/${path}`));
      }
      yield put({ type: GET_FOLDER_SUCCESS, data: response.data });
    }
  } catch (error) {
    yield put({ type: REQUEST_ERROR, error: error.message });
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
export function* searchItems({ token, queryInput }) {
  yield put({ type: CLEAR_ERROR });
  yield put({ type: SENDING_REQUEST, sending: true });

  try {
    const response = yield call(
      axios.get,
      `${API_URL}/storage/items/search/${queryInput}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (response) {
      yield put({ type: SEARCH_ITEMS_SUCCESS, data: response.data });
    }
  } catch (error) {
    yield put({ type: REQUEST_ERROR, error: error.message });

    return false;
  } finally {
    yield put({ type: SENDING_REQUEST, sending: false });
  }
}

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function* createFolder({ path, token, name }) {
  yield put({ type: CLEAR_ERROR });
  yield put({ type: SENDING_REQUEST, sending: true });

  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/folders/${path}`,
      { name: name },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response;
  } catch (error) {
    yield put({ type: REQUEST_ERROR, error: error.message });

    return false;
  } finally {
    yield put({ type: SENDING_REQUEST, sending: false });
  }
}

export function* deleteSelectedItems({ token, selectedItems }) {
  yield put({ type: CLEAR_ERROR });
  yield put({ type: SENDING_REQUEST, sending: true });

  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/items/delete`,
      { items: selectedItems },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response;
  } catch (error) {
    yield put({ type: REQUEST_ERROR, error: error.message });

    return false;
  } finally {
    yield put({ type: SENDING_REQUEST, sending: false });
  }
}

/**
 * Get folder info saga
 */
export function* folderInfoFlow() {
  yield takeLatest(GET_FOLDER_REQUEST, getFolderInfo);
}

export function* searchItemsFlow() {
  yield takeLatest(SEARCH_ITEMS_REQUEST, searchItems);
}

/**
 * Create folder saga
 */
export function* createFolderFlow() {
  while (true) {
    const request = yield take(CREATE_FOLDER_REQUEST);
    const { token, path, name } = request;
    const response = yield call(createFolder, {
      token,
      path,
      name
    });
    if (response) {
      yield put({ type: CREATE_FOLDER_SUCCESS, folder: response.data });
      yield put(reset('createFolderForm'));
    }
  }
}

/**
 * Create file saga
 *
 */
export function* createFileFlow() {
  yield takeEvery(CREATE_FILE_REQUEST, createFile);
}

export function* createFile({ path, token, file, samePath }) {
  yield put({ type: CLEAR_ERROR });
  yield put({ type: SENDING_REQUEST, sending: true });
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/files/${path}`,
      { ...file },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (response) {
      NotificationManager.success(file.name, 'File uploaded', 3000);
      if (samePath) {
        yield put({ type: CREATE_FILE_SUCCESS, file: response.data });
      }
    }
  } catch (error) {
    yield put({ type: REQUEST_ERROR, error: error.message });
    NotificationManager.error(file.name, 'Failed uploading', 3000);
    return false;
  } finally {
    yield put({ type: SENDING_REQUEST, sending: false });
  }
}
/**
 * Delete folder saga
 */
export function* deleteSelectedItemsFlow() {
  while (true) {
    const request = yield take(DELETE_SELECTED_ITEMS_REQUEST);
    const { token, selectedItems } = request;
    const response = yield call(deleteSelectedItems, {
      token,
      selectedItems
    });
    if (response) {
      const idsToDelete = selectedItems.map(item => item.data.id);

      yield put({ type: DELETE_SELECTED_ITEMS_SUCCESS, idsToDelete });
    }
  }
}

export default function* storageSagas() {
  yield fork(folderInfoFlow);
  yield fork(createFolderFlow);
  yield fork(createFileFlow);
  yield fork(deleteSelectedItemsFlow);
  yield fork(searchItemsFlow);
}
