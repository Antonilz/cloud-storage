import { call, put, fork, takeEvery, takeLatest } from 'redux-saga/effects';
import { delay } from 'redux-saga';
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
  SEARCH_ITEMS_FAILURE,
  RENAME_ITEM_REQUEST,
  RENAME_ITEM_SUCCESS,
  RENAME_ITEM_FAILURE,
  TOGGLE_ITEM_RENAME,
  ADD_TAG_REQUEST,
  ADD_TAG_SUCCESS,
  ADD_TAG_FAILURE,
  DELETE_TAG_REQUEST,
  DELETE_TAG_SUCCESS,
  DELETE_TAG_FAILURE,
  SEARCH_TAGS_REQUEST,
  SEARCH_TAGS_SUCCESS,
  SEARCH_TAGS_FAILURE,
  GET_FILES_URLS_SUCCESS,
  DOWNLOAD_FILE,
  FILTER_ITEMS_BY_TAGS_REQUEST
} from '../constants/actionTypes';

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function* getFolderInfo({ accessToken, pathSlug }) {
  try {
    const response = yield call(
      axios.get,
      `${API_URL}/storage/folders/${pathSlug}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      yield put({ type: GET_FOLDER_SUCCESS, data: response.data });
    }
  } catch (error) {
    yield put({ type: GET_FOLDER_FAILURE, error: error.message });
  }
}

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 * @param  {object} options                Options
 * @param  {boolean} options.isRegistering Is this a register request?
 */
export function* searchItems({ accessToken, query }) {
  try {
    //yield call(delay, 300);
    const response = yield call(
      axios.post,
      `${API_URL}/storage/items/search`,
      { query },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      yield put({ type: SEARCH_ITEMS_SUCCESS, data: response.data });
    }
  } catch (error) {
    yield put({ type: SEARCH_ITEMS_FAILURE, error: error.message });
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
    const parentPath = path.replace(/home.|home|^\//, '');
    const response = yield call(
      axios.post,
      `${API_URL}/storage/folders/${parentPath}`,
      { name: name },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      yield put({ type: CREATE_FOLDER_SUCCESS, item: response.data });
      yield put(reset('createFolderForm'));
    }
    return response;
  } catch (error) {
    yield put({ type: CREATE_FOLDER_FAILURE, error: error.message });
  }
}

export function* renameItem({ accessToken, item, name, promise }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/items/update`,
      { items: [{ ...item, data: { ...item.data, name } }] },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      yield put({
        type: RENAME_ITEM_SUCCESS,
        item: { ...response.data.items[0] }
      });
      yield put({
        type: TOGGLE_ITEM_RENAME,
        id: response.data.items[0].data.id,
        status: false
      });
    }
    return response;
  } catch (error) {
    yield put({ type: RENAME_ITEM_FAILURE, error: error.message });
    yield put({
      type: TOGGLE_ITEM_RENAME,
      id: item.data.id,
      status: false
    });
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
      NotificationManager.success(
        ``,
        `Deleted ${idsToDelete.length} item(s)`,
        3000
      );
      yield put({ type: DELETE_SELECTED_ITEMS_SUCCESS, idsToDelete });
    }
  } catch (error) {
    yield put({ type: DELETE_SELECTED_ITEMS_FAILURE, error: error.message });
  }
}

export function* createFile({ accessToken, pathSlug, file, samePath }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/files/create`,
      { pathSlug, fileData: { ...file } },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      //NotificationManager.success(file.name, 'File uploaded', 3000);
      if (samePath) {
        yield put({ type: CREATE_FILE_SUCCESS, item: response.data });
      }
    }
  } catch (error) {
    yield put({ type: CREATE_FILE_FAILURE, error: error.message });
    NotificationManager.error(file.name, 'Failed uploading file', 3000);
  }
}

export function* getFilesURLs({ accessToken, ids }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/files/get-urls`,
      { ids },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      console.log(response.data);
      yield put({ type: GET_FILES_URLS_SUCCESS, data: response.data });
      return response;
    }
  } catch (error) {
    return false;
  }
}

export function* downloadFile({ accessToken, id, url, disposition }) {
  if (url) {
    window.location = url;
  } else {
    try {
      const response = yield call(getFilesURLs, { accessToken, ids: [id] });
      if (response) {
        if (disposition === 'inline') {
          window.open(response.data[0].inlineURL);
        } else {
          window.location = response.data[0].attachmentURL;
        }
      }
    } catch (error) {
      return false;
    }
  }
}

export function* addTag({ accessToken, itemsIds, tagName }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/items/addTag`,
      { itemsIds, tagName },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      yield put({ type: ADD_TAG_SUCCESS, items: response.data.items });
    }
  } catch (error) {
    yield put({ type: ADD_TAG_FAILURE, error: error.message });
    return false;
  }
}

export function* deleteTag({ accessToken, itemsIds, tagId }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/items/deleteTag`,
      { itemsIds, tagId },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      yield put({ type: DELETE_TAG_SUCCESS, items: response.data.items });
    }
  } catch (error) {
    yield put({ type: DELETE_TAG_FAILURE, error: error.message });
  }
}

export function* filterItemsByTags({ accessToken, ids }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/items/filterByTags`,
      { ids },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      yield put({ type: GET_FOLDER_SUCCESS, data: response.data });
    }
  } catch (error) {
    yield put({ type: GET_FOLDER_FAILURE, error: error.message });
  }
}

export function* searchTags({ accessToken, query }) {
  try {
    const response = yield call(
      axios.post,
      `${API_URL}/storage/items/searchTags`,
      { query },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response) {
      console.log(response.data);
      yield put({ type: SEARCH_TAGS_SUCCESS, data: response.data });
    }
  } catch (error) {
    yield put({ type: SEARCH_TAGS_FAILURE, error: error.message });
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

export function* renameItemFlow() {
  yield takeEvery(RENAME_ITEM_REQUEST, authedSaga(renameItem));
}

export function* createFileFlow() {
  yield takeEvery(CREATE_FILE_REQUEST, authedSaga(createFile));
}

export function* addTagFlow() {
  yield takeEvery(ADD_TAG_REQUEST, authedSaga(addTag));
}

export function* deleteTagFlow() {
  yield takeEvery(DELETE_TAG_REQUEST, authedSaga(deleteTag));
}

export function* searchTagsFlow() {
  yield takeLatest(SEARCH_TAGS_REQUEST, authedSaga(searchTags));
}

export function* downloadFileFlow() {
  yield takeEvery(DOWNLOAD_FILE, authedSaga(downloadFile));
}

export function* filterItemsByTagsFlow() {
  yield takeLatest(FILTER_ITEMS_BY_TAGS_REQUEST, authedSaga(filterItemsByTags));
}

export default function* storageSagas() {
  yield fork(getFolderInfoFlow);
  yield fork(createFolderFlow);
  yield fork(createFileFlow);
  yield fork(deleteSelectedItemsFlow);
  yield fork(searchItemsFlow);
  yield fork(renameItemFlow);
  yield fork(addTagFlow);
  yield fork(deleteTagFlow);
  yield fork(searchTagsFlow);
  yield fork(downloadFileFlow);
  yield fork(filterItemsByTagsFlow);
}
