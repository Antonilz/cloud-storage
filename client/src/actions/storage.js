import {
  GET_FOLDER_REQUEST,
  CREATE_FOLDER_REQUEST,
  DELETE_SELECTED_ITEMS_REQUEST,
  SENDING_REQUEST,
  REQUEST_ERROR,
  CLEAR_ERROR,
  TOGGLE_ITEM,
  TOGGLE_ALL_ITEMS,
  SORT_ITEMS,
  CHANGE_VIEW,
  CREATE_FILE_REQUEST,
  SEARCH_ITEMS_REQUEST
} from '../constants/actionTypes';

/**
 * Sets the current user info
 * @param  {string} token user
 */
export function folderInfoRequest({ pathSlug, notInitial }) {
  return { type: GET_FOLDER_REQUEST, pathSlug, notInitial };
}

export function searchItemsRequest({ queryInput }) {
  return { type: SEARCH_ITEMS_REQUEST, queryInput };
}
/**
 * Sets the current user info
 * @param  {string} token user
 */
export function createFolderRequest({ path, name }) {
  return { type: CREATE_FOLDER_REQUEST, path, name };
}

/**
 * Sets the current user info
 * @param  {string} token user
 */
export function createFileRequest({ path, file, samePath }) {
  return { type: CREATE_FILE_REQUEST, path, file, samePath };
}

/**
 * Sets the current user info
 * @param  {string} token user
 */
export function deleteSelectedItemsRequest({ selectedItems }) {
  return { type: DELETE_SELECTED_ITEMS_REQUEST, selectedItems };
}

/**
 * Sets the `currentlySending` state, which displays a loading indicator during requests
 * @param  {boolean} sending True means we're sending a request, false means we're not
 */
export function sendingRequest(sending) {
  return { type: SENDING_REQUEST, sending };
}

/**
 * Sets the `currentlySending` state, which displays a loading indicator during requests
 * @param  {boolean} sending True means we're sending a request, false means we're not
 */
export function toggleItem(id, status) {
  return { type: TOGGLE_ITEM, id, status };
}

/**
 * Sets the `currentlySending` state, which displays a loading indicator during requests
 * @param  {boolean} sending True means we're sending a request, false means we're not
 */
export function toggleAllItems(status) {
  return { type: TOGGLE_ALL_ITEMS, status };
}

/**
 * Sets the `currentlySending` state, which displays a loading indicator during requests
 * @param  {boolean} sending True means we're sending a request, false means we're not
 */
export function sortItems(sortOptions) {
  return { type: SORT_ITEMS, sortOptions };
}

/**
 * Sets the `currentlySending` state, which displays a loading indicator during requests
 * @param  {boolean} sending True means we're sending a request, false means we're not
 */
export function changeView(viewName) {
  return { type: CHANGE_VIEW, viewName };
}

/**
 * Sets the `error` state to the error received
 * @param  {object} error The error we got when trying to make the request
 */
export function requestError(error) {
  return { type: REQUEST_ERROR, error };
}

/**
 * Sets the `error` state as empty
 */
export function clearError() {
  return { type: CLEAR_ERROR };
}
