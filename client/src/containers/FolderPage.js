import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Container, Input, Grid, Menu } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { NotificationContainer } from 'react-notifications';
import StorageHeader from '../components/StorageHeader';
import NavigationBreadcrumbs from '../components/NavigationBreadcrumbs';
import StorageActionsMenu from '../components/StorageActionsMenu';
import FilesView from '../components/FilesView';
import SearchItemsInput from '../components/SearchItemsInput';
import UploadToMinio from './UploadToMinio';
import Gallery from './Gallery';

import { selectSortedStorage, selectSearchResults } from '../selectors';
import {
  folderInfoRequest,
  createFolderRequest,
  createFileRequest,
  deleteSelectedItemsRequest,
  searchItemsRequest,
  toggleItem,
  toggleAllItems,
  sortItems,
  changeView
} from '../actions/storage';
import { logoutRequest, userInfoRequest } from '../actions/auth';

class FolderPage extends Component {
  componentDidMount() {
    const pathSlug = this.props.location.pathname.replace(
      /\/storage.|\/storage/,
      ''
    );
    this.props.userInfoRequest();
    this.props.folderInfoRequest({ pathSlug, notInitial: false });
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0); // scroll to top on folder change
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      const pathSlug = nextProps.location.pathname.replace(
        /\/storage.|\/storage/,
        ''
      );
      this.props.folderInfoRequest({ pathSlug, notInitial: false });
    }
  }

  createFolder = ({ name }) => {
    const path = this.props.items.currentFolder.path;
    this.props.createFolderRequest({ path, name });
  };

  updateItemDetails = ({ details }) => {
    const path = this.props.items.currentFolder.path;
    this.props.createFolderRequest({ path, details });
  };

  changeFolder = ({ pathSlug }) => {
    const cleanPath = pathSlug.replace(/\/storage.|\/storage/, '');
    this.props.history.push(`/storage/${cleanPath}`);
  };

  deleteSelectedItems = () => {
    this.props.deleteSelectedItemsRequest({
      selectedItems: this.props.items.children.filter(item => item.checked)
    });
  };

  render() {
    return (
      <div style={{ backgroundColor: '#edeef0', minHeight: '100vh' }}>
        <Helmet>
          <title>File Storage</title>
        </Helmet>
        <NotificationContainer />
        <div
          style={{
            top: '0',
            position: 'sticky',
            zIndex: '300',
            backgroundColor: '#edeef0'
          }}
        >
          <StorageHeader
            handleLogoutClick={this.props.logoutRequest}
            username={this.props.auth.user.name}
          />
          <Container>
            <SearchItemsInput
              handleSearchChange={this.props.searchItemsRequest}
              onFolderClick={this.props.folderInfoRequest}
              searchResults={this.props.searchResults}
              isFetching={this.props.searchIsFetching}
            />
            <NavigationBreadcrumbs
              path={this.props.items.currentFolder.path}
              pathSlug={this.props.items.currentFolder.pathSlug}
              onFolderClick={this.changeFolder}
            />
            <StorageActionsMenu
              onDeleteSelectedItemsClick={this.deleteSelectedItems}
              onChangeViewClick={this.props.changeView}
              onUploadButtonClick={() => this.dropZone.open()}
              numOfSelectedItems={this.props.items.selected}
              handleCreateFolder={this.createFolder}
              handleChangeSortOptions={this.props.sortItems}
              sortOptions={this.props.items.sortOptions}
              currentView={this.props.items.view}
              path={this.props.location.pathname}
            />
          </Container>
        </div>
        <Container style={{ marginTop: '25px', userSelect: 'none' }}>
          <UploadToMinio
            token={this.props.auth.token.accessToken}
            path={this.props.items.currentFolder.path}
            createFile={this.props.createFileRequest}
            dropZoneRef={el => (this.dropZone = el)}
          >
            <FilesView
              items={this.props.items}
              history={this.props.history}
              onFolderClick={this.changeFolder}
              onItemCheck={this.props.toggleItem}
              onItemsCheck={this.props.toggleAllItems}
              deleteSelectedItems={this.props.deleteSelectedItemsRequest}
            />
          </UploadToMinio>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  searchResults: selectSearchResults(state),
  searchIsFetching: state.storage.search.isFetching,
  items: selectSortedStorage(state)
});

export default withRouter(
  connect(mapStateToProps, {
    logoutRequest,
    folderInfoRequest,
    createFolderRequest,
    createFileRequest,
    deleteSelectedItemsRequest,
    searchItemsRequest,
    toggleItem,
    toggleAllItems,
    sortItems,
    changeView,
    userInfoRequest
  })(FolderPage)
);
