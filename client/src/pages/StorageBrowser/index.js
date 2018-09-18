import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Container, Responsive } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { Route } from 'react-router';
import { NotificationContainer } from 'react-notifications';
import StorageHeader from './components/StorageHeader';
import NavigationBreadcrumbs from './components/NavigationBreadcrumbs';
import StorageActionsMenu from './components/StorageActionsMenu';
import FilesView from './components/FilesView';
import UploadToMinio from './containers/UploadToMinio';
import TagsEditor from './containers/TagsEditor';
import TagsSearch from './containers/TagsSearch';
import Sidebar from './components/Sidebar';
import CheckedItemsTagsEditor from './containers/CheckedItemsTagsEditor';
//import Gallery from './Gallery';

import {
  selectStorageIsFetching,
  selectSortedItemsIds,
  selectCheckedItemsIds,
  selectCheckedItems,
  selectSortOptions,
  selectCurrentFolder,
  selectViewType
} from 'selectors/storageSelectors';

import {
  folderInfoRequest,
  createFolderRequest,
  createFileRequest,
  deleteSelectedItemsRequest,
  toggleItem,
  toggleItemRename,
  toggleAllItems,
  sortItems,
  changeView,
  searchTagsRequest,
  toggleTagsEdit,
  downloadFile
} from 'actions/storage';
import { logoutRequest, userInfoRequest } from 'actions/auth';
import styled, { injectGlobal } from 'styled-components';
import { APP_NAME } from 'constants/app';

const StyledStoragePage = styled.div`
  min-height: 100vh;
`;

const StyledStorageContentWrapper = styled(Container)`
  padding-bottom: 25px;
  user-select: none;
`;

const FixedContainer = styled(Container)`
  position: sticky;
  top: 70px;
  margin-top: 0;
  padding-top: 25px;
  padding-bottom: 25px;
  z-index: 200;
  display: flex;
  background-color: #edeef0;
`;

const MainContent = styled.div`
  @media (max-width: 768px) {
    padding-left: 3vw;
  }
  padding-left: 160px;
  padding-right: 3vw;
`;

injectGlobal`
  body {
    background-color: #edeef0 !important;
    overflow-y: scroll;
  }
`;

class StorageBrowser extends Component {
  componentDidMount() {
    window.scrollTo(0, 0);
    this.props.userInfoRequest();
    if (this.props.location.pathname !== '/storage/tags') {
      const pathSlug = this.props.location.pathname.replace(
        /\/storage\/home.|\/storage\/home/,
        ''
      );
      this.props.folderInfoRequest({ pathSlug, notInitial: false });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.location !== prevProps.location &&
      this.props.location.pathname !== '/storage/tags'
    ) {
      console.log('folder changed');
      const pathSlug = this.props.location.pathname.replace(
        /\/storage\/home.|\/storage\/home/,
        ''
      );
      this.props.folderInfoRequest({ pathSlug, notInitial: false });
      window.scrollTo(0, 0); // scroll to top on folder change
    }
  }

  createFolder = ({ name }) => {
    const path = this.props.items.currentFolder.pathSlug.replace(
      /\/storage\/home.|\/storage\/home|^\//,
      ''
    );
    this.props.createFolderRequest({ path, name });
  };

  changeFolder = ({ pathSlug }) => {
    const cleanPath = pathSlug.replace(
      /\/storage\/home.|\/storage\/home|^\//,
      ''
    );
    this.props.history.push(`/storage/home/${cleanPath}`);
  };

  deleteSelectedItems = ({ item }) => {
    this.props.deleteSelectedItemsRequest({
      selectedItems: item ? [item] : this.props.checkedItems
    });
  };

  openFile = ({ file, mode }) => {
    if (mode === 'open') {
      this.props.downloadFile({
        id: file.id,
        url: file.inlineURL,
        disposition: 'inline'
      });
    } else if (mode === 'download') {
      this.props.downloadFile({
        id: file.id,
        url: file.attachmentURL,
        disposition: 'attachment'
      });
    }
  };

  editSelectedItemsTags = () => {
    this.props.toggleTagsEdit({
      ids: this.props.checkedItemsIds,
      status: true
    });
  };

  onUploadButtonClick = () => {
    this.dropZone.open();
  };

  render() {
    return (
      <StyledStoragePage>
        <Helmet>
          <title>Cloud Storage | {APP_NAME}</title>
        </Helmet>
        <NotificationContainer />
        <TagsEditor />
        <CheckedItemsTagsEditor />
        <StorageHeader
          appName={APP_NAME}
          handleLogoutClick={this.props.logoutRequest}
          username={this.props.auth.user.name}
        />
        <Sidebar />
        <MainContent>
          <FixedContainer fluid>
            <Route
              path="/storage/home"
              component={() => (
                <NavigationBreadcrumbs
                  path={this.props.currentFolder.path}
                  pathSlug={this.props.currentFolder.pathSlug}
                  onFolderClick={this.changeFolder}
                />
              )}
            />
            <Route exact path="/storage/tags" component={TagsSearch} />
            <StorageActionsMenu
              onDeleteSelectedItemsClick={this.deleteSelectedItems}
              onChangeViewClick={this.props.changeView}
              onUploadButtonClick={this.onUploadButtonClick}
              onTagsEditClick={this.editSelectedItemsTags}
              numOfSelectedItems={this.props.checkedItemsIds.length}
              handleCreateFolder={this.createFolder}
              handleChangeSortOptions={this.props.sortItems}
              sortOptions={this.props.sortOptions}
              currentView={this.props.viewType}
              path={this.props.location.pathname}
            />
          </FixedContainer>
          <StyledStorageContentWrapper fluid>
            <UploadToMinio
              token={this.props.auth.token.accessToken}
              pathSlug={this.props.currentFolder.pathSlug}
              createFile={this.props.createFileRequest}
              dropZoneRef={el => (this.dropZone = el)}
            >
              <FilesView
                storageIsFetching={this.props.storageIsFetching}
                itemsCount={this.props.itemsIDs.length}
                selectedItemsCount={this.props.checkedItems.length}
                currentViewType={this.props.viewType}
                itemsIDs={this.props.itemsIDs}
                history={this.props.history}
                onFolderClick={this.changeFolder}
                onFileClick={this.openFile}
                onItemCheck={this.props.toggleItem}
                onItemsCheck={this.props.toggleAllItems}
                onItemRenameToggle={this.props.toggleItemRename}
                onItemsTagsEditToggle={this.props.toggleTagsEdit}
                deleteSelectedItems={this.deleteSelectedItems}
              />
            </UploadToMinio>
          </StyledStorageContentWrapper>
        </MainContent>
      </StyledStoragePage>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  searchTagsIsFetching: state.storage.searchTags.isFetching,
  storageIsFetching: selectStorageIsFetching(state),
  currentFolder: selectCurrentFolder(state),
  viewType: selectViewType(state),
  sortOptions: selectSortOptions(state),
  itemsIDs: selectSortedItemsIds(state),
  checkedItems: selectCheckedItems(state),
  checkedItemsIds: selectCheckedItemsIds(state)
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      logoutRequest,
      folderInfoRequest,
      createFolderRequest,
      createFileRequest,
      deleteSelectedItemsRequest,
      toggleItem,
      toggleAllItems,
      toggleItemRename,
      sortItems,
      changeView,
      userInfoRequest,
      searchTagsRequest,
      toggleTagsEdit,
      downloadFile
    }
  )(StorageBrowser)
);
