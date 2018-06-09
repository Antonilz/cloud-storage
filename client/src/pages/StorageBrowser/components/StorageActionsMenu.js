import React, { PureComponent } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import styled from 'styled-components';
import MoreActionsButton from './MoreActionsButton';
import FolderCreatePopup from './FolderCreatePopup';
import ItemsSortOptions from './ItemsSortOptions';

const StyledViewTypeSelector = styled(Menu.Item)`
  color: ${props => (props.active ? 'rgba(40, 40, 40, 0.3)' : 'black')};
`;

class StorageActionsMenu extends PureComponent {
  handleChangeViewClick = (e, data) => {
    e.preventDefault;
    this.props.onChangeViewClick(data.value);
  };

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
              onTagsEditClick={this.props.onTagsEditClick}
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
          <StyledViewTypeSelector
            //active={this.props.currentView === 'list'}
            disabled={this.props.currentView === 'list'}
            icon="list layout"
            value="list"
            onClick={this.handleChangeViewClick}
          />
          <StyledViewTypeSelector
            //active={this.props.currentView === 'grid'}
            disabled={this.props.currentView === 'grid'}
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
