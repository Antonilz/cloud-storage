import { createSelector } from 'reselect';
import { selectItemsById } from './storageSelectors';

const selectSearchTags = state => state.storage.searchTags;

const selectTagsFilter = state => state.storage.tagsFilter;

const selectFilteringTags = state => state.storage.tagsFilter.tags;

const selectTagsManager = state => state.storage.searchTags;

const selectFilteringTagsNames = createSelector([selectFilteringTags], tags =>
  tags.map(tag => tag.name)
);

const selectItemsForTagsEdit = createSelector(
  [selectItemsById, selectSearchTags],
  (itemsById, searchTags) =>
    Object.keys(itemsById)
      .filter(id => searchTags.itemsIds.includes(id))
      .map(id => itemsById[id])
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
      result.title = result.name;
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
  selectOptions,
  selectTagsFilterOptions,
  selectFilteringTagsNames,
  selectTagsValuesByItemId,
  selectTagsManager,
  selectFilteringTags
};
