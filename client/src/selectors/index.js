import { createSelector } from 'reselect';
import { compareItemsValues } from '../utils/compareItemsValues';
import memoize from 'lodash.memoize';

const selectStorage = state => state.storage;

const selectSortOptions = state => state.storage.sortOptions;

const selectStorageChildren = state => state.storage.childrenById;

const selectSearchTags = state => state.storage.searchTags;

const selectTagsFilter = state => state.storage.tagsFilter;

const selectSearch = state => state.storage.search;

const makeSelectItems = () =>
  createSelector(selectStorage, storageState => storageState.children);

const selectFiles = createSelector([selectStorage], storage => {
  return [...storage.children.filter(item => item.type === 'file')];
});

const selectFolders = createSelector([selectStorage], storage => {
  return [...storage.children.filter(item => item.type === 'folder')];
});

const selectSortedStorage = createSelector(
  [selectStorage, selectSortOptions],
  (storage, sortOptions) => {
    const sortedFolders = storage.children
      .filter(item => item.type === 'folder')
      .sort(compareItemsValues(sortOptions));
    const sortedFiles = storage.children
      .filter(item => item.type === 'file')
      .sort(compareItemsValues(sortOptions));
    return { ...storage, children: [...sortedFolders, ...sortedFiles] };
  }
);

const selectSortedStorageIDs = createSelector(
  [selectStorage, selectSortOptions],
  (storage, sortOptions) => {
    const sortedFolders = storage.children
      .filter(item => item.type === 'folder')
      .sort(compareItemsValues(sortOptions))
      .map(item => item.data.id);
    const sortedFiles = storage.children
      .filter(item => item.type === 'file')
      .sort(compareItemsValues(sortOptions))
      .map(item => item.data.id);
    return [...sortedFolders, ...sortedFiles];
  }
);

const selectItemByID = createSelector([selectStorageChildren], items =>
  memoize(id => items.find(item => item.data.id === id))
);

const selectItemsByIDs = createSelector([selectStorageChildren], items =>
  memoize(ids => items.filter(item => ids.includes(item.data.id)))
);

const selectItemsCount = createSelector(
  [selectStorage],
  storage => storage.children.length
);

const selectCheckedItems = createSelector([selectStorageChildren], items =>
  items.filter(item => item.checked)
);

const selectCheckedItemsIds = createSelector(
  [selectCheckedItems],
  checkedItems => checkedItems.map(item => item.data.id)
);

const selectSelectedItemsCount = createSelector(
  [selectStorage],
  storage => storage.selected
);

const selectCurrentViewType = createSelector(
  [selectStorage],
  storage => storage.view
);

const selectStorageIsFetching = createSelector(
  [selectStorage],
  storage => storage.isFetching
);

const selectImages = createSelector([selectFiles], files => {
  return files
    .filter(file => file.data.type.includes('image'))
    .map(filteredFile => filteredFile.data);
});

export {
  selectSortedStorage,
  selectImages,
  selectSortedStorageIDs,
  selectItemByID,
  selectItemsByIDs,
  selectItemsCount,
  selectSelectedItemsCount,
  selectCurrentViewType,
  selectStorageIsFetching,
  selectCheckedItemsIds,
  selectCheckedItems
};
