import { createSelector } from 'reselect';

const selectSearch = state => state.storage.search;

const selectSearchResults = createSelector([selectSearch], search => {
  const searchResultsWithKeys = search.results.map(result => {
    result.key = result.data.id;
    result.title = result.data.name;
    return result;
  });
  return searchResultsWithKeys;
});

const selectSearchLoadingStatus = createSelector([selectSearch], search => {
  return search.isFetching;
});

export { selectSearchResults, selectSearchLoadingStatus };
