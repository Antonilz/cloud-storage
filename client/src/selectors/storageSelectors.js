import { createSelector } from 'reselect';
import { compareItemsValues } from '../utils/compareItemsValues';
import memoize from 'lodash.memoize';

const selectItemsById = state => state.storage.childrenById;

const selectStorageIsFetching = state => state.storage.isFetching;

const selectSortOptions = state => state.storage.sortOptions;

const selectViewType = state => state.storage.view;

const selectCurrentFolder = state => state.storage.currentFolder;

const selectSortedItemsIds = createSelector(
  [selectItemsById, selectSortOptions],
  (itemsById, sortOptions) => {
    const items = Object.keys(itemsById).map(id => itemsById[id]);
    const sortedFolders = items
      .filter(item => item.type === 'folder')
      .sort(compareItemsValues(sortOptions))
      .map(item => item.data.id);
    const sortedFiles = items
      .filter(item => item.type === 'file')
      .sort(compareItemsValues(sortOptions))
      .map(item => item.data.id);
    return [...sortedFolders, ...sortedFiles];
  }
);

const selectCheckedItems = createSelector([selectItemsById], itemsById =>
  Object.keys(itemsById)
    .map(id => itemsById[id])
    .filter(item => item.checked)
);

const selectCheckedItemsIds = createSelector(
  [selectCheckedItems],
  checkedItems => checkedItems.map(item => item.data.id)
);

const selectItemById = createSelector([selectItemsById], items =>
  memoize(id => items[id])
);

export {
  selectItemsById,
  selectStorageIsFetching,
  selectSortedItemsIds,
  selectItemById,
  selectCheckedItems,
  selectCheckedItemsIds,
  selectSortOptions,
  selectCurrentFolder,
  selectViewType
};
