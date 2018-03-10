import React, { PureComponent } from 'react';
import { separateLink } from '../utils/separateLink';
import { Menu, Icon } from 'semantic-ui-react';
import MoreActionsButton from './MoreActionsButton';
import FolderCreatePopup from './FolderCreatePopup';
import ItemsSortOptions from './ItemsSortOptions';

class StorageActionsMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChangeViewClick = this.handleChangeViewClick.bind(this);
  }

  handleChangeViewClick(e, data) {
    e.preventDefault;
    this.props.onChangeViewClick(data.value);
  }

  render() {
    return (
      <Menu>
        <Menu.Menu>
          <Menu.Item onClick={this.props.onUploadButtonClick}>
            <Icon name="upload" color="blue" />Upload
          </Menu.Item>
          <Menu.Item
            as={FolderCreatePopup}
            path={this.props.path}
            onSubmitAction={this.props.handleCreateFolder}
          />
          {this.props.numOfSelectedItems > 0 && (
            <Menu.Item
              onDeleteSelectedItemsClick={this.props.onDeleteSelectedItemsClick}
              numOfSelectedItems={this.props.numOfSelectedItems}
              hasBufferedItems={false}
              as={MoreActionsButton}
            />
          )}
        </Menu.Menu>
        <Menu.Menu position="right">
          <Menu.Item
            as={ItemsSortOptions}
            sortOptions={this.props.sortOptions}
            changeSortOptions={this.props.handleChangeSortOptions}
          />
          <Menu.Item
            active={this.props.currentView === 'table'}
            icon="list layout"
            value="table"
            onClick={this.handleChangeViewClick}
          />
          <Menu.Item
            active={this.props.currentView === 'grid'}
            icon="grid layout"
            value="grid"
            onClick={this.handleChangeViewClick}
          />
        </Menu.Menu>
      </Menu>
    );
  }
}

export default StorageActionsMenu;
