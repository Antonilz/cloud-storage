import React, { PureComponent } from 'react';
import NavigationBreadcrumbs from './components/NavigationBreadcrumbs';
import SearchItems from './components/SearchItems';

export default class DirectoryBrowser extends PureComponent {
  render() {
    return (
      <React.Fragment>
        <SearchItems
          handleSearchChange={this.props.handleSearchChanget}
          onItemClick={this.props.onItemClick}
          searchResults={this.props.searchResults}
          isFetching={this.props.isFetching}
        />
        <NavigationBreadcrumbs
          path={this.props.path}
          pathSlug={this.props.pathSlug}
          onFolderClick={this.props.onFolderClick}
        />
      </React.Fragment>
    );
  }
}
