import {
  REQUEST_ERROR,
  CLEAR_ERROR,
  GET_FOLDER_REQUEST,
  GET_FOLDER_SUCCESS,
  SEARCH_ITEMS_REQUEST,
  SEARCH_ITEMS_SUCCESS,
  CREATE_FOLDER_SUCCESS,
  CREATE_FILE_SUCCESS,
  DELETE_SELECTED_ITEMS_SUCCESS,
  TOGGLE_ITEM,
  TOGGLE_ALL_ITEMS,
  SORT_ITEMS,
  CHANGE_VIEW
} from '../constants/actionTypes';

const initialState = {
  error: '',
  currentFolder: {
    name: '',
    path: '',
    pathSlug: ''
  },
  children: [],
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
  view: 'table',
  isFetching: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case REQUEST_ERROR:
      return { ...state, error: action.error };
    case GET_FOLDER_REQUEST:
      return { ...state, isFetching: true };
    case GET_FOLDER_SUCCESS:
      return {
        ...state,
        currentFolder: action.data.currentFolder,
        children: [
          ...action.data.children.map(elem => {
            return { ...elem, checked: false };
          })
        ],
        selected: 0,
        isFetching: false
      };
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
    case TOGGLE_ITEM:
      return {
        ...state,
        children: [
          ...state.children.map(elem => {
            if (elem.data.id === action.id) {
              return { ...elem, checked: action.status };
            } else {
              return { ...elem };
            }
          })
        ],
        selected: action.status ? (state.selected += 1) : (state.selected -= 1)
      };
    case TOGGLE_ALL_ITEMS:
      return {
        ...state,
        children: [
          ...state.children.map(elem => {
            return { ...elem, checked: action.status };
          })
        ],
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
      return {
        ...state,
        children: [...state.children, action.folder],
        isFetching: false
      };
    case CREATE_FILE_SUCCESS:
      return {
        ...state,
        children: [...state.children, action.file],
        isFetching: false
      };
    case DELETE_SELECTED_ITEMS_SUCCESS:
      return {
        ...state,
        children: [
          ...state.children.filter(
            elem => !action.idsToDelete.includes(elem.data.id)
          )
        ],
        selected: 0,
        isFetching: false
      };
    case CLEAR_ERROR:
      return { ...state, error: '' };
    default:
      return state;
  }
}
