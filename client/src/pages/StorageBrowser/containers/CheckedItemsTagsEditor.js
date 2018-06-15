import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  Dropdown,
  Label,
  Icon,
  Modal,
  Search,
  Header,
  Button
} from 'semantic-ui-react';
import styled from 'styled-components';
import {
  selectOptions,
  selectTagsValuesByItemId,
  selectTagsManager
} from 'selectors/tagsSelectors';
import {
  addTagToItems,
  deleteTagFromItems,
  toggleTagsEdit,
  searchTagsRequest
} from 'actions/storage';

const StyledModal = styled(Modal)`
  min-height: 250px;
  width: 60% !important;
`;

const StyledDropdown = styled(Dropdown)`
  display: flex !important;
  flex-wrap: wrap;
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

const StyledSearch = styled(Search)`
  margin-bottom: 30px;
  .results {
    width: 100% !important;
    max-height: 200px;
    overflow-y: auto;
  }
`;

class CheckedItemsTagsEditor extends PureComponent {
  state = {
    value: '',
    selectedTag: null
  };

  constructor(props) {
    super(props);
    this.timeout = 0;
  }

  handleSearchChange = (e, { value }) => {
    const self = this;
    if (this.timeout) clearTimeout(this.timeout);
    this.setState({
      value,
      selectedTag: null
    });
    if (value.length > 0) {
      this.timeout = setTimeout(() => {
        self.props.searchTagsRequest({ query: value });
      }, 500);
    }
  };

  handleResultSelect = (e, { result }) => {
    this.setState({ value: result.name, selectedTag: result });
  };

  resultRenderer = result => <Header as="h4">{result.name}</Header>;

  handleClose = () => {
    this.setState({ value: '', selectedTag: null });
    this.props.toggleTagsEdit({ ids: [], status: false });
  };

  handleAddTag = () => {
    this.props.addTagToItems({
      itemsIds: this.props.tagsManager.itemsIds,
      tagName: this.state.value
    });
  };

  handleDeleteTag = () => {
    this.props.deleteTagFromItems({
      itemsIds: this.props.tagsManager.itemsIds,
      tagId: this.state.selectedTag.id
    });
  };

  render() {
    const { value, selectedTag } = this.state;
    return (
      <StyledModal
        size="large"
        dimmer="blurring"
        closeIcon
        open={
          this.props.tagsManager.active &&
          this.props.tagsManager.itemsIds.length > 1
        }
        onClose={this.handleClose}
      >
        <Modal.Header>Edit tags</Modal.Header>
        <Modal.Content>
          <StyledSearch
            loading={this.props.tagsManager.isFetching}
            onResultSelect={this.handleResultSelect}
            onSearchChange={this.handleSearchChange}
            results={this.props.tagsManager.results}
            value={this.state.value}
            input={{ fluid: true, placeholder: 'Search tags' }}
            size="large"
            resultRenderer={this.resultRenderer}
            showNoResults={false}
          />
          <Button.Group widths="5">
            <Button
              negative
              loading={this.props.tagsManager.isFetching}
              disabled={!selectedTag}
              onClick={this.handleDeleteTag}
            >
              Delete
            </Button>
            <Button.Or />
            <Button
              positive
              loading={this.props.tagsManager.isFetching}
              disabled={value.length === 0}
              onClick={this.handleAddTag}
            >
              Add
            </Button>
          </Button.Group>
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
)(CheckedItemsTagsEditor);
