import { createSelector } from 'reselect';
import { compareItemsValues } from '../utils/compareItemsValues';

const selectStorage = state => state.storage;
const selectSortOptions = state => state.storage.sortOptions;

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
    const children = storage.children.sort(compareItemsValues(sortOptions));
    return { ...storage, children: [...sortedFolders, ...sortedFiles] };
  }
);

const selectImages = createSelector([selectFiles], files => {
  return files
    .filter(file => file.data.type.includes('image'))
    .map(filteredFile => filteredFile.data);
});

const selectSearchResults = createSelector([selectStorage], storage => {
  const searchResultsWithKeys = storage.search.results.map(result => {
    result.key = result.data.id;
    return result;
  });
  return searchResultsWithKeys;
});

export { selectSortedStorage, selectImages, selectSearchResults };
