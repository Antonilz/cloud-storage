import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Search, Label, List, Icon, Header } from 'semantic-ui-react';
import styled from 'styled-components';
import { getIconFromType } from 'utils/mimeCheck';
import {
  selectSearchResults,
  selectSearchLoadingStatus
} from 'selectors/searchSelectors';
import { searchItemsRequest } from 'actions/storage';

const StyledSearch = styled(Search)`
  padding-top: 0;
  input {
    width: 230px !important;
    transition: 0.2s width !important;
  }
  input:focus {
    width: 400px !important;
  }
  .results {
    width: 400px !important;

    .header {
      width: 300px;
      display: flex;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;
class SearchItems extends PureComponent {
  state = {
    value: ''
  };

  constructor(props) {
    super(props);
    this.timeout = 0;
  }

  handleResultSelect = (e, { result }) => {
    //this.props.onItemClick({ pathSlug: result.data.pathSlug });
    this.props.history.push(`/storage/home/${result.data.pathSlug}`);
    this.setState({ value: '' });
  };

  handleSearchChange = (e, { value }) => {
    const self = this;
    if (this.timeout) clearTimeout(this.timeout);
    this.setState({
      //isLoading: true,
      value
    });

    if (value.length > 0) {
      this.timeout = setTimeout(() => {
        self.props.searchItemsRequest({ query: value });
      }, 500);
    }
  };

  formatResultString = (result, searchValue) => {
    const formattedArr = result
      .split(searchValue)
      .reduce((acc, elem, index, arr) => {
        if (index == arr.length - 1) {
          return [...acc, elem];
        } else {
          return [...acc, elem, searchValue];
        }
      }, []);
    const formattedText = formattedArr.map((value, index) => {
      if (index % 2 == 0) {
        return value;
      } else {
        return (
          <b style={{ color: '#4082C4' }} key={index}>
            {value}
          </b>
        );
      }
    });
    return formattedText;
  };

  onFocus = (e, data) => {};

  resultRenderer = result => (
    <List>
      <List.Item>
        <Icon
          fitted
          name={
            result.type === 'folder'
              ? 'folder'
              : getIconFromType(result.data.name, result.data.type)
          }
          size="big"
        />
        <List.Content>
          <List.Header as="h4">
            {this.formatResultString(result.data.name, this.state.value)}
          </List.Header>
          <List.Description>{result.data.path}</List.Description>
        </List.Content>
      </List.Item>
    </List>
  );

  render() {
    const { value } = this.state;
    return (
      <StyledSearch
        //fluid
        loading={this.props.isFetching}
        onResultSelect={this.handleResultSelect}
        onSearchChange={this.handleSearchChange}
        resultRenderer={this.resultRenderer}
        results={this.props.searchResults}
        value={value}
        size="large"
        input={{ placeholder: 'Search', iconPosition: 'left' }}
      />
    );
  }
}

const mapStateToProps = state => ({
  searchResults: selectSearchResults(state),
  isFetching: selectSearchLoadingStatus(state)
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      searchItemsRequest
    }
  )(SearchItems)
);
