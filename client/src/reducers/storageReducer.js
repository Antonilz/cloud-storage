import {
  GET_FOLDER_REQUEST,
  GET_FOLDER_SUCCESS,
  SEARCH_ITEMS_REQUEST,
  SEARCH_ITEMS_SUCCESS,
  CREATE_FOLDER_SUCCESS,
  CREATE_FILE_SUCCESS,
  DELETE_SELECTED_ITEMS_SUCCESS,
  TOGGLE_ITEM,
  TOGGLE_ALL_ITEMS,
  TOGGLE_ITEM_RENAME,
  TOGGLE_TAGS_EDIT,
  RENAME_ITEM_SUCCESS,
  SORT_ITEMS,
  CHANGE_VIEW,
  SEARCH_TAGS_REQUEST,
  SEARCH_TAGS_SUCCESS,
  ADD_TAG_REQUEST,
  ADD_TAG_SUCCESS,
  DELETE_TAG_REQUEST,
  DELETE_TAG_SUCCESS,
  GET_FILES_URLS_SUCCESS,
  ADD_FILTER_TAG,
  DELETE_FILTER_TAG,
  GET_FOLDER_FAILURE
} from '../constants/actionTypes';

const initialState = {
  error: '',
  currentFolder: {
    name: '',
    path: '',
    pathSlug: ''
  },
  children: [],
  childrenById: {},
  uploads: [],
  selected: 0,
  sortOptions: {
    order: 'asc',
    fieldName: 'name',
    formattedName: 'Name'
  },
  search: {
    results: [],
    active: false,
    isFetching: false
  },
  searchTags: {
    itemsIds: [],
    results: [],
    active: false,
    isFetching: false
  },
  tagsFilter: {
    tags: [],
    active: false,
    isFetching: false
  },
  view: 'grid',
  isFetching: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_FOLDER_REQUEST:
      return { ...state, isFetching: true };
    case GET_FOLDER_SUCCESS:
      return {
        ...state,
        currentFolder: {
          ...state.currentFolder,
          ...action.data.currentFolder
        },
        childrenById: action.data.children.reduce((obj, item) => {
          obj[item.data.id] = item;
          return obj;
        }, {}),
        selected: 0,
        isFetching: false
      };
    case GET_FOLDER_FAILURE:
      return { ...state, isFetching: false };
    case SEARCH_ITEMS_REQUEST:
      return {
        ...state,
        search: {
          ...state.search,
          isFetching: true
        }
      };
    case SEARCH_ITEMS_SUCCESS:
      return {
        ...state,
        search: {
          ...state.search,
          results: action.data.results,
          isFetching: false
        }
      };
    case SEARCH_TAGS_REQUEST:
      return {
        ...state,
        searchTags: {
          ...state.searchTags,
          isFetching: true
        }
      };
    case SEARCH_TAGS_SUCCESS:
      console.log(action.data);
      return {
        ...state,
        searchTags: {
          ...state.searchTags,
          results: action.data.tags,
          isFetching: false
        }
      };
    case TOGGLE_ITEM:
      const itemToToggle = state.childrenById[action.id];
      return {
        ...state,
        childrenById: {
          ...state.childrenById,
          [action.id]: { ...itemToToggle, checked: action.status }
        },
        selected: action.status ? state.selected + 1 : state.selected - 1
      };
    case TOGGLE_ITEM_RENAME:
      return {
        ...state,
        childrenById: {
          ...state.childrenById,
          [action.id]: {
            ...state.childrenById[action.id],
            renameIsActive: action.status
          }
        }
      };
    case TOGGLE_TAGS_EDIT:
      return {
        ...state,
        searchTags: {
          ...state.searchTags,
          active: action.status,
          itemsIds: action.ids
        }
      };
    case ADD_TAG_REQUEST:
      return {
        ...state,
        searchTags: {
          ...state.searchTags,
          isFetching: true
        }
      };
    case ADD_FILTER_TAG:
      return {
        ...state,
        tagsFilter: {
          ...state.tagsFilter,
          tags: [
            ...state.tagsFilter.tags,
            state.searchTags.results.find(tag => tag.id === action.id)
          ]
        }
      };
    case DELETE_FILTER_TAG:
      return {
        ...state,
        tagsFilter: {
          ...state.tagsFilter,
          tags: state.tagsFilter.tags.filter(tag => tag.id !== action.id)
        }
      };
    case ADD_TAG_SUCCESS:
      return {
        ...state,
        childrenById: {
          ...state.childrenById,
          ...action.items.reduce((obj, item) => {
            return {
              ...obj,
              [item.id]: {
                ...state.childrenById[item.id],
                data: { ...state.childrenById[item.id].data, ...item }
              }
            };
          }, {})
        },
        searchTags: {
          ...state.searchTags,
          isFetching: false
        }
      };
    case DELETE_TAG_REQUEST:
      return {
        ...state,
        searchTags: {
          ...state.searchTags,
          isFetching: true
        }
      };
    case GET_FILES_URLS_SUCCESS:
      return {
        ...state,
        childrenById: {
          ...state.childrenById,
          ...action.data.reduce((obj, item) => {
            obj[item.id] = {
              ...state.childrenById[item.id],
              data: { ...state.childrenById[item.id].data, ...item }
            };
            return obj;
          }, {})
        }
      };
    case DELETE_TAG_SUCCESS:
      return {
        ...state,
        childrenById: {
          ...state.childrenById,
          ...action.items.reduce((obj, item) => {
            return {
              obj,
              [item.id]: {
                ...state.childrenById[item.id],
                data: item
              }
            };
          }, {})
        },
        searchTags: {
          ...state.searchTags,
          isFetching: false
        }
      };
    case TOGGLE_ALL_ITEMS:
      return {
        ...state,
        childrenById: {
          ...Object.keys(state.childrenById).reduce((obj, id) => {
            return {
              ...obj,
              [id]: { ...state.childrenById[id], checked: action.status }
            };
          }, {})
        },
        selected: action.status ? state.children.length : 0
      };
    case SORT_ITEMS:
      return {
        ...state,
        sortOptions: {
          ...state.sortOptions,
          ...action.sortOptions
        }
      };
    case CHANGE_VIEW:
      return {
        ...state,
        view: action.viewName
      };
    case CREATE_FOLDER_SUCCESS:
    case CREATE_FILE_SUCCESS:
      return {
        ...state,
        childrenById: {
          ...state.childrenById,
          [action.item.data.id]: action.item
        },
        isFetching: false
      };
    case DELETE_SELECTED_ITEMS_SUCCESS:
      return {
        ...state,
        childrenById: {
          ...Object.keys(state.childrenById)
            .filter(id => !action.idsToDelete.includes(id))
            .reduce((obj, id) => {
              return {
                ...obj,
                [id]: state.childrenById[id]
              };
            }, {})
        },
        selected: 0,
        isFetching: false
      };
    case RENAME_ITEM_SUCCESS:
      return {
        ...state,
        childrenById: {
          ...state.childrenById,
          [action.item.data.id]: {
            ...state.childrenById[action.item.data.id],
            data: {
              ...action.item.data
            }
          }
        }
      };
    default:
      return state;
  }
}
