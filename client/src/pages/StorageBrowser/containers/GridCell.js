import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Icon, Checkbox, Dropdown, Menu } from 'semantic-ui-react';
import styled from 'styled-components';
import ItemRenameForm from '../forms/ItemRenameForm';
import { getIconFromType } from 'utils/mimeCheck';
import { selectItemById } from 'selectors/storageSelectors';

const StyledCell = styled.div`
  padding: 15px;
  &:hover {
    cursor: pointer;
    .itemLabel {
      color: #5995ed;
    }
    .itemActions {
      display: block;
    }
  }

  .itemLabel {
    display: flex;
    padding-top: 10px;
    width: 100%;
    align-items: center;
    justify-content: center;

    .itemName {
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      width: 100%;
    }

    &:hover {
      .itemName {
        overflow: visible;
        white-space: normal;
      }
    }
  }

  .ui.dropdown > .menu {
    left: auto !important;
    right: 0 !important;
  }

  .itemActions {
    display: ${props => (props.checked ? 'block' : 'none')};
  }
`;

const StyledCheckboxWrapper = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  height: 35px;
  width: 35px;
  display: flex;
  justify-content: center;
`;

const StyledMenuWrapper = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
`;

const StyledThumbnailContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80%;
  width: 100%;
  background: ${props =>
    props.imageURL && `url(${props.imageURL}) no-repeat center center`};
  background-size: contain;
  background-color: ${props => props.checked && 'rgba(0, 0, 0, 0.05)'};

  i {
    font-size: 11vw !important;
    color: #5995ed;
  }
`;

class GridCell extends PureComponent {
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
    const { item } = this.props;
    if (e.target.name !== 'name') {
      item.type === 'folder'
        ? this.props.onFolderClick({ pathSlug: item.data.pathSlug })
        : this.props.onFileClick({ file: item.data, mode: 'open' });
    }
  };

  handleDownloadFileClick = (e, data) => {
    this.props.onFileClick({ file: this.props.item.data, mode: 'download' });
  };

  render() {
    const { item } = this.props;
    return (
      <StyledCell style={this.props.style} checked={item.checked}>
        <StyledThumbnailContainer
          onClick={this.handleItemLabelClick}
          imageURL={item.preview}
          checked={item.checked}
        >
          {!(
            item.type === 'file' &&
            item.data.type.includes('image') &&
            item.preview
          ) && (
            <Icon
              name={
                item.type === 'folder'
                  ? 'folder'
                  : getIconFromType(item.data.name, item.data.type)
              }
              size="massive"
            />
          )}
        </StyledThumbnailContainer>

        <div className="itemLabel" onClick={this.handleItemLabelClick}>
          {item.renameIsActive ? (
            <ItemRenameForm
              item={item}
              initialValues={{ name: item.data.name }}
              onItemRenameToggle={this.props.onItemRenameToggle}
            />
          ) : (
            <div className="itemName">{item.data.name}</div>
          )}
        </div>

        <StyledCheckboxWrapper
          className="itemActions"
          onClick={this.handleCheckItem}
        >
          <Checkbox
            checked={item.checked}
            onChange={(e, data) => {
              e.stopPropagation();
              this.props.onItemCheck(item.data.id, data.checked);
            }}
          />
        </StyledCheckboxWrapper>
        <StyledMenuWrapper className="itemActions">
          <Menu size="tiny" compact>
            {item.type === 'file' && (
              <Menu.Item
                icon="download"
                onClick={this.handleDownloadFileClick}
              />
            )}
            <Dropdown icon="ellipsis horizontal" item>
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
        </StyledMenuWrapper>
      </StyledCell>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const filterByID = selectItemById(state);
  return {
    item: filterByID(ownProps.id)
  };
};

export default connect(mapStateToProps)(GridCell);
