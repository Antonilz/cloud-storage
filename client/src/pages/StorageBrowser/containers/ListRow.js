import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  Icon,
  Checkbox,
  Dropdown,
  Menu,
  Header,
  Button,
  Table,
  Portal,
  Popup
} from 'semantic-ui-react';
import styled from 'styled-components';
import ItemRenameForm from '../forms/ItemRenameForm';
import { getIconFromType } from 'utils/mimeCheck';
import { selectItemById } from 'selectors/storageSelectors';

const StyledRow = styled.div`
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns:
      minmax(20px, 50px) minmax(200px, 5fr) 3fr
      2fr 2fr;
    grid-gap: 20px;
    //border: 1px 1px 0 1px solid rgba(34, 36, 38, 0.15);
    border-bottom 1px solid #e6e8eb;
    background-color: ${props =>
      props.checked ? 'rgba(0, 0, 0, 0.05)' : 'white'};

  
  
  &:hover {
    cursor: pointer;
    ${StyledItemLabel} {
      color: #5995ed;
    }
  }

  .ui.dropdown > .menu {
    left: auto !important;
    right: 0 !important;
  }
`;

const StyledCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding-right: 20px;

  &.selectBox {
    padding: 0;
    justify-content: center;
  }

  &.last {
    justify-content: flex-end;
  }
`;

const StyledItemLabel = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;

  i {
    color: #5995ed;
  }

  &:hover {
    .itemName {
      overflow: visible;
      white-space: normal;
    }
  }

  .itemName {
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 10px;
    width: 100%;
  }
`;

class ListRow extends PureComponent {
  handleCheckItem = (e, data) => {
    this.props.onItemCheck(this.props.item.data.id, !this.props.item.checked);
  };

  handleItemRenameClick = (e, data) => {
    this.props.onItemRenameToggle({
      id: this.props.item.data.id,
      status: true
    });
  };

  handleDeleteItemClick = (e, data) => {
    this.props.deleteSelectedItems({ item: this.props.item });
  };

  handleItemEditTagsClick = (e, data) => {
    this.props.onItemsTagsEditToggle({
      ids: [this.props.item.data.id],
      status: true
    });
  };

  handleItemLabelClick = (e, data) => {
    // if not rename form click
    const { item } = this.props;
    if (e.target.name != 'name') {
      item.type === 'folder'
        ? this.props.onFolderClick({ pathSlug: item.data.pathSlug })
        : this.props.onFileClick({ file: item.data, mode: 'open' }); //window.open(item.data.inlineURL);
    }
  };

  handleDownloadFileClick = (e, data) => {
    this.props.onFileClick({ file: this.props.item.data, mode: 'download' });
  };

  render() {
    const { item } = this.props;
    return (
      <StyledRow checked={item.checked} style={this.props.style}>
        <StyledCell className="selectBox" onClick={this.handleCheckItem}>
          <Checkbox checked={item.checked} />
        </StyledCell>
        <StyledCell onClick={this.handleItemLabelClick}>
          <StyledItemLabel>
            <Icon
              name={
                item.type === 'folder'
                  ? 'folder'
                  : getIconFromType(item.data.name, item.data.type)
              }
              size="big"
            />
            {item.renameIsActive ? (
              <ItemRenameForm
                item={item}
                initialValues={{ name: item.data.name }}
                onItemRenameToggle={this.props.onItemRenameToggle}
              />
            ) : (
              <div className="itemName">
                <span>{item.data.name}</span>
              </div>
            )}
          </StyledItemLabel>
        </StyledCell>
        <StyledCell onClick={this.handleCheckItem}>
          {item.data.formattedLastModified}
        </StyledCell>
        <StyledCell onClick={this.handleCheckItem}>
          {item.type === 'file' && item.data.formattedSize}
        </StyledCell>
        <StyledCell className="last">
          <Menu size="tiny" compact className="itemActions">
            {item.type === 'file' && (
              <Menu.Item
                icon="download"
                onClick={this.handleDownloadFileClick}
              />
            )}
            <Dropdown
              icon="ellipsis horizontal"
              item
              upward={
                this.props.itemsCount > 2 &&
                this.props.index > this.props.itemsCount - 2
              }
            >
              <Dropdown.Menu>
                <Dropdown.Item
                  icon="delete"
                  text="Delete"
                  onClick={this.handleDeleteItemClick}
                />
                <Dropdown.Item icon="cut" text="Cut" />
                <Dropdown.Item icon="copy" text="Copy" />
                <Dropdown.Item
                  icon="text cursor"
                  text="Rename"
                  onClick={this.handleItemRenameClick}
                />
                <Dropdown.Divider />
                <Dropdown.Item
                  icon="tags"
                  text="Edit tags"
                  onClick={this.handleItemEditTagsClick}
                />
              </Dropdown.Menu>
            </Dropdown>
          </Menu>
        </StyledCell>
      </StyledRow>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const filterByID = selectItemById(state);
  return {
    item: filterByID(ownProps.id)
  };
};

export default connect(mapStateToProps)(ListRow);
