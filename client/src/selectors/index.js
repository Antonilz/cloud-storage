import { createSelector } from 'reselect';
import { compareItemsValues } from '../utils/compareItemsValues';
import memoize from 'lodash.memoize';

const selectStorage = state => state.storage;

const selectSortOptions = state => state.storage.sortOptions;

const selectStorageChildren = state => state.storage.children;

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

// Search Items

const selectSearchResults = createSelector([selectSearch], search => {
  const searchResultsWithKeys = search.results.map(result => {
    result.key = result.data.id;
    return result;
  });
  return searchResultsWithKeys;
});

const selectSearchLoadingStatus = createSelector([selectSearch], search => {
  return search.isFetching;
});

// Tags
const selectTagsManager = createSelector([selectSearchTags], searchTags => {
  return searchTags;
});

const selectItemsForTagsEdit = createSelector(
  [selectStorageChildren, selectSearchTags],
  (items, searchTags) =>
    items.filter(item => searchTags.itemsIds.includes(item.data.id))
);

const selectTagsValuesByItemId = createSelector(
  [selectItemsForTagsEdit],
  itemsForTagEdit =>
    [].concat(
      ...itemsForTagEdit.map(item => item.data.tags.map(tag => tag.name))
    )
);

const selectOptions = createSelector(
  [selectSearchTags, selectItemsForTagsEdit],
  (searchTags, selectedItems) => {
    const searchResultsWithKeys = searchTags.results.map(result => {
      result.key = result.id;
      result.text = result.name;
      result.value = result.name;
      return result;
    });
    const tags = selectedItems
      .map(item =>
        item.data.tags.map(tag => {
          return {
            key: tag.id,
            text: tag.name,
            value: tag.name
          };
        })
      )
      .filter((tag, index, tags) => {
        return !index || tag.key != tags[index - 1].key;
      });
    return [
      ...searchResultsWithKeys.reduce((acc, val) => acc.concat(val), []),
      ...tags.reduce((acc, val) => acc.concat(val), [])
    ];
  }
);

const selectFilteringTags = createSelector(
  [selectTagsFilter],
  tagsFilter => tagsFilter.tags
);

const selectFilteringTagsNames = createSelector(
  [selectTagsFilter],
  tagsFilter => tagsFilter.tags.map(tag => tag.name)
);

const selectTagsFilterOptions = createSelector(
  [selectSearchTags, selectFilteringTags],
  (searchTags, selectedItems) => {
    const searchResultsWithKeys = searchTags.results.map(result => {
      result.key = result.id;
      result.text = result.name;
      result.value = result.name;
      return result;
    });
    const tags = selectedItems.map(tag => {
      return {
        key: tag.id,
        text: tag.name,
        value: tag.name
      };
    });
    return [...searchResultsWithKeys, ...tags];
  }
);

export {
  selectSortedStorage,
  selectImages,
  selectSearchResults,
  selectSearchLoadingStatus,
  selectSortedStorageIDs,
  selectItemByID,
  selectItemsByIDs,
  selectItemsCount,
  selectSelectedItemsCount,
  selectCurrentViewType,
  selectStorageIsFetching,
  selectOptions,
  selectTagsValuesByItemId,
  selectTagsManager,
  selectCheckedItemsIds,
  selectCheckedItems,
  selectTagsFilterOptions,
  selectFilteringTagsNames,
  selectFilteringTags
};
