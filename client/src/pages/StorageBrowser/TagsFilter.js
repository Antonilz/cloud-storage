import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Dropdown, Label, Icon, Button, Menu } from 'semantic-ui-react';
import styled from 'styled-components';
import {
  selectOptions,
  selectTagsValuesByItemId,
  selectTagsManager,
  selectTagsFilterOptions,
  selectFilteringTagsNames,
  selectFilteringTags
} from 'selectors';
import {
  addFilterTag,
  deleteFilterTag,
  toggleTagsEdit,
  searchTagsRequest,
  getItemsByTagsFilter
} from 'actions/storage';


const StyledMenu
const StyledDropdown = styled(Dropdown)`
  & {
    display: flex !important;
    flex-wrap: wrap;
    max-width: 55vw;
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
  }
`;
class TagsFilter extends PureComponent {
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
    this.props.deleteFilterTag({
      id: data.id
    });
  };

  handleChange = (e, { value }) => { if (value.length > 0) {
    this.props.addFilterTag({
      id: this.props.options.find(tag => tag.value === value[value.length - 1])
        .key
    });
}
  };
  handleSearchButtonClick = (e, data) => {
    this.props.getItemsByTagsFilter({
      ids: this.props.currentFilter.map(tag => tag.id)
    });
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
      <Menu>
        <Menu.Item>
          <StyledDropdown
            options={options}
            value={value}
            loading={this.props.tagsManager.isFetching}
            placeholder="Search Tags"
            search
            selection
            fluid
            multiple
            closeOnChange
            minCharacters={2}
            onChange={this.handleChange}
            onSearchChange={this.handleSearchChange}
            renderLabel={this.renderLabel}
          />
        </Menu.Item>
        <Menu.Item
          icon="filter"
          content="Filter"
          position="right"
          color="blue"
          loading={this.props.tagsManager.isFetching}
          onClick={this.handleSearchButtonClick}
        />
      </Menu>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    options: selectTagsFilterOptions(state),
    value: selectFilteringTagsNames(state),
    tagsManager: selectTagsManager(state),
    currentFilter: selectFilteringTags(state)
  };
};

export default connect(mapStateToProps, {
  deleteFilterTag,
  addFilterTag,
  toggleTagsEdit,
  searchTagsRequest,
  getItemsByTagsFilter
})(TagsFilter);
