import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Dropdown, Label, Icon, Modal } from 'semantic-ui-react';
import styled from 'styled-components';
import {
  selectOptions,
  selectTagsValuesByItemId,
  selectTagsManager,
  selectFilteringTagsNames
} from 'selectors/tagsSelectors';
import {
  addTagToItems,
  deleteTagFromItems,
  toggleTagsEdit,
  searchTagsRequest
} from 'actions/storage';

const StyledModal = styled(Modal)`
  min-height: 250px;
`;

const StyledDropdown = styled(Dropdown)`
  display: flex !important;
  flex-wrap: wrap;
  margin-top: 25px;
  .label {
    flex-grow: 1;
    display: flex !important;
    justify-content: center;
  }
  input {
    flex-grow: 100;
    display: flex !important;
    width: auto !important;
  }
`;

class TagsEditor extends PureComponent {
  constructor(props) {
    super(props);
    this.timeout = 0;
  }

  renderLabel = tag => (
    <Label
      color="blue"
      content={tag.text}
      onRemove={this.removeTag}
      id={tag.key}
      as="a"
    />
  );

  removeTag = (e, data) => {
    this.props.deleteTagFromItems({
      itemsIds: this.props.tagsManager.itemsIds,
      tagId: data.id
    });
  };

  handleChange = (e, { value }) => {
    if (value.length > 0) {
      this.props.addTagToItems({
        itemsIds: this.props.tagsManager.itemsIds,
        tagName: value[value.length - 1]
      });
    }
  };

  handleSearchChange = (e, { searchQuery }) => {
    const self = this;
    if (this.timeout) clearTimeout(this.timeout);

    if (searchQuery.length > 0) {
      this.timeout = setTimeout(() => {
        self.props.searchTagsRequest({ query: searchQuery });
      }, 500);
    }
  };

  handleClose = () => this.props.toggleTagsEdit({ ids: [], status: false });

  render() {
    const { value, options } = this.props;
    return (
      <StyledModal
        style={{ display: 'flex' }}
        open={
          this.props.tagsManager.active &&
          this.props.tagsManager.itemsIds.length === 1
        }
        size="small"
        dimmer="blurring"
        closeIcon
        onClose={this.handleClose}
      >
        <Modal.Header>Edit tags</Modal.Header>
        <Modal.Content>
          <StyledDropdown
            options={options}
            value={value}
            loading={this.props.tagsManager.isFetching}
            placeholder="Search Tags"
            search
            selection
            fluid
            multiple
            allowAdditions
            minCharacters={2}
            onChange={this.handleChange}
            onSearchChange={this.handleSearchChange}
            renderLabel={this.renderLabel}
          />
        </Modal.Content>
      </StyledModal>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    options: selectOptions(state),
    value: selectTagsValuesByItemId(state),
    tagsManager: selectTagsManager(state)
  };
};

export default connect(
  mapStateToProps,
  {
    deleteTagFromItems,
    addTagToItems,
    toggleTagsEdit,
    searchTagsRequest
  }
)(TagsEditor);
