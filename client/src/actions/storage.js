import {
  GET_FOLDER_REQUEST,
  CREATE_FOLDER_REQUEST,
  DELETE_SELECTED_ITEMS_REQUEST,
  SENDING_REQUEST,
  REQUEST_ERROR,
  CLEAR_ERROR,
  TOGGLE_ITEM,
  TOGGLE_ITEM_RENAME,
  TOGGLE_TAGS_EDIT,
  RENAME_ITEM_REQUEST,
  TOGGLE_ALL_ITEMS,
  SORT_ITEMS,
  CHANGE_VIEW,
  CREATE_FILE_REQUEST,
  SEARCH_ITEMS_REQUEST,
  SEARCH_TAGS_REQUEST,
  ADD_TAG_REQUEST,
  ADD_FILTER_TAG,
  DELETE_FILTER_TAG,
  DELETE_TAG_REQUEST,
  DOWNLOAD_FILE,
  FILTER_ITEMS_BY_TAGS_REQUEST
} from '../constants/actionTypes';

export function folderInfoRequest({ pathSlug, notInitial }) {
  return { type: GET_FOLDER_REQUEST, pathSlug, notInitial };
}

export function searchItemsRequest({ query }) {
  return { type: SEARCH_ITEMS_REQUEST, query };
}

export function createFolderRequest({ path, name }) {
  return { type: CREATE_FOLDER_REQUEST, path, name };
}

export function toggleItemRename({ id, status }) {
  return { type: TOGGLE_ITEM_RENAME, id, status };
}

export function toggleTagsEdit({ ids, status }) {
  return { type: TOGGLE_TAGS_EDIT, ids, status };
}

export function addTagToItems({ itemsIds, tagName }) {
  return { type: ADD_TAG_REQUEST, itemsIds, tagName };
}

export function deleteTagFromItems({ itemsIds, tagId }) {
  return { type: DELETE_TAG_REQUEST, itemsIds, tagId };
}

export function addFilterTag({ id }) {
  return { type: ADD_FILTER_TAG, id };
}

export function deleteFilterTag({ id }) {
  return { type: DELETE_FILTER_TAG, id };
}

export function createFileRequest({ pathSlug, file, samePath }) {
  return { type: CREATE_FILE_REQUEST, pathSlug, file, samePath };
}

export function deleteSelectedItemsRequest({ selectedItems }) {
  return { type: DELETE_SELECTED_ITEMS_REQUEST, selectedItems };
}

export function renameItemRequest({ item, name }) {
  return { type: RENAME_ITEM_REQUEST, item, name };
}

export function toggleItem(id, status) {
  return { type: TOGGLE_ITEM, id, status };
}

export function getItemsByTagsFilter(ids) {
  return { type: FILTER_ITEMS_BY_TAGS_REQUEST, ids };
}

export function toggleAllItems(status) {
  return { type: TOGGLE_ALL_ITEMS, status };
}

export function sortItems(sortOptions) {
  return { type: SORT_ITEMS, sortOptions };
}

export function changeView(viewName) {
  return { type: CHANGE_VIEW, viewName };
}

export function searchTagsRequest({ query }) {
  return { type: SEARCH_TAGS_REQUEST, query };
}

export function downloadFile({ id, url, disposition }) {
  return { type: DOWNLOAD_FILE, id, url, disposition };
}
