import React, { PureComponent } from 'react';
import {
  Table,
  Icon,
  Checkbox,
  Dropdown,
  Menu,
  Header,
  Button,
  Dimmer,
  Loader
} from 'semantic-ui-react';
import { formatBytes } from '../utils/formatBytes';
import { getIconFromType } from '../utils/mimeCheck';
import moment from 'moment';

class FilesViewTable extends PureComponent {
  renderDownloadLink(link) {
    return <Menu.Item icon="download" href={link} />;
  }

  renderItem(item, index) {
    const lastModified = moment(item.data.updatedAt).format('DD/MM/YYYY HH:mm');
    return (
      <Table.Row
        key={index}
        style={{ cursor: 'pointer' }}
        active={item.checked}
      >
        <Table.Cell width={1}>
          <Checkbox
            checked={item.checked}
            onChange={(e, data) => {
              e.stopPropagation();
              this.props.onItemCheck(item.data.id, data.checked);
            }}
          />
        </Table.Cell>
        <Table.Cell width={6} singleLine collapsing>
          <div
            style={{ width: 'fit-content' }}
            onClick={e => {
              e.stopPropagation();
              this.props.onFolderClick(this.props.token, item.data.path, true);
            }}
          >
            <Icon
              name={
                item.type == 'folder'
                  ? 'folder'
                  : getIconFromType(item.data.name, item.data.type)
              }
              size="big"
            />
            <a>{item.data.name}</a>
          </div>
        </Table.Cell>
        <Table.Cell
          width={3}
          onClick={(e, data) => {
            //e.stopPropagation();
            this.props.onItemCheck(item.data.id, !item.checked);
          }}
        >
          {lastModified}
        </Table.Cell>
        <Table.Cell
          width={3}
          onClick={(e, data) => {
            //e.stopPropagation();
            this.props.onItemCheck(item.data.id, !item.checked);
          }}
        >
          {item.type === 'file' && formatBytes(item.data.size)}
        </Table.Cell>
        <Table.Cell
          width={3}
          textAlign="right"
          verticalAlign="middle"
          width="two"
          style={{ height: '75px', width: '117px' }}
        >
          {this.props.items.selected === 0 && (
            <Menu size="tiny" compact>
              {item.type == 'file' && this.renderDownloadLink(item.data.url)}
              <Dropdown icon="ellipsis horizontal" item>
                <Dropdown.Menu>
                  <Dropdown.Item
                    icon="delete"
                    text="Delete"
                    onClick={(e, data) => {
                      this.props.deleteSelectedItems(this.props.token, [item]);
                    }}
                  />
                  <Dropdown.Item icon="cut" text="Cut" />
                  <Dropdown.Item icon="copy" text="Copy" />
                  <Dropdown.Item icon="text cursor" text="Rename" />
                  <Dropdown.Divider />
                  <Dropdown.Item icon="tags" text="Edit tags" />
                </Dropdown.Menu>
              </Dropdown>
            </Menu>
          )}
        </Table.Cell>
      </Table.Row>
    );
  }

  render() {
    const { items } = this.props;
    return (
      <div>
        {items.isFetching && (
          <Dimmer inverted active>
            <Loader content="Loading" />
          </Dimmer>
        )}
        {items.children.length > 0 && (
          <Table
            selectable
            padded
            unstackable
            columns={5}
            className="storage__files-view__table"
          >
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  <Checkbox
                    checked={items.children.length == items.selected}
                    indeterminate={
                      items.selected != items.children.length &&
                      items.selected > 0
                    }
                    onChange={(e, data) => {
                      e.stopPropagation();
                      this.props.onItemsCheck(data.checked);
                    }}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Last Modified</Table.HeaderCell>
                <Table.HeaderCell>Size</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.children.map((item, index) => {
                return this.renderItem(item, index);
              })}
            </Table.Body>
          </Table>
        )}
      </div>
    );
  }
}

export default FilesViewTable;
