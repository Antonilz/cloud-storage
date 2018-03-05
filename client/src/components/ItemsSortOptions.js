import React, { PureComponent } from 'react';
import { Icon, Dropdown, Checkbox, Form, Radio } from 'semantic-ui-react';

class ItemsSortOptions extends PureComponent {
  handleChange = (e, data) => {
    let sortOptions = {};
    if (data.name === 'fieldNameGroup') {
      sortOptions.fieldName = data.value;
      sortOptions.formattedName = data.label;
    } else if (data.name === 'sortOrderGroup') {
      sortOptions.order = data.value;
    }
    this.props.changeSortOptions(sortOptions);
  };

  render() {
    const hasSelectedItems = this.props.numOfSelectedItems > 0;
    const { fieldName, order, formattedName } = this.props.sortOptions;
    return (
      <Dropdown text={formattedName} item multiple>
        <Dropdown.Menu>
          <Dropdown.Header>Sort By</Dropdown.Header>
          <Form>
            <Dropdown.Item>
              <Form.Field
                control={Radio}
                label="Name"
                name="fieldNameGroup"
                checked={fieldName === 'name'}
                value="name"
                onChange={this.handleChange}
              />
            </Dropdown.Item>
            <Dropdown.Item>
              <Form.Field
                control={Radio}
                label="Last Modified"
                name="fieldNameGroup"
                checked={fieldName === 'updatedAt'}
                value="updatedAt"
                onChange={this.handleChange}
              />
            </Dropdown.Item>
            <Dropdown.Item>
              <Form.Field
                control={Radio}
                label="Size"
                name="fieldNameGroup"
                value="size"
                checked={fieldName === 'size'}
                onChange={this.handleChange}
              />
            </Dropdown.Item>
            <Dropdown.Divider />
            <Form.Group>
              <Dropdown.Item>
                <Form.Field
                  control={Radio}
                  label="Ascending"
                  name="sortOrderGroup"
                  checked={order === 'asc'}
                  onChange={this.handleChange}
                  value="asc"
                />
              </Dropdown.Item>
              <Dropdown.Item>
                <Form.Field
                  control={Radio}
                  label="Descending"
                  name="sortOrderGroup"
                  checked={order === 'desc'}
                  onChange={this.handleChange}
                  value="desc"
                />
              </Dropdown.Item>
            </Form.Group>
          </Form>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default ItemsSortOptions;
