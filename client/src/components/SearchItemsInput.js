import React, { PureComponent } from 'react';
import { Search, Label, List, Icon, Header } from 'semantic-ui-react';
import { getIconFromType } from '../utils/mimeCheck';

export default class SearchItemsInput extends PureComponent {
  componentWillMount() {
    this.resetComponent();
  }
  resetComponent = () => this.setState({ isLoading: false, value: '' });

  handleResultSelect = (e, { result }) =>
    this.setState({ value: result.title });

  handleSearchChange = (e, { value }) => {
    this.setState({
      //isLoading: true,
      value
    });
    //if (this.state.value.length < 1) return this.resetComponent();
    if (value.length > 0) {
      this.props.handleSearchChange({ queryInput: value });
      this.setState({
        isLoading: false
        //results: filteredResults
      });
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
          <List.Header as="p">
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
      <Search
        fluid
        loading={this.props.isFetching}
        //onResultSelect={this.handleResultSelect}
        onSearchChange={this.handleSearchChange}
        resultRenderer={this.resultRenderer}
        results={this.props.searchResults}
        value={value}
        input={{ fluid: true }}
        style={{ margin: '15px 0' }}
      />
    );
  }
}
