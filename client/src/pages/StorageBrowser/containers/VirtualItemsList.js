import React, { PureComponent } from 'react';
import { Table, Checkbox } from 'semantic-ui-react';
import ItemRenameForm from 'containers/ItemRenameForm';
import { getIconFromType } from 'utils/mimeCheck';
import moment from 'moment';
import styled from 'styled-components';
import ListRow from 'containers/ListRow';
import { Table as VTable } from 'react-virtualized';
import 'react-virtualized/styles.css';

const StyledTable = styled(Table)``;

class VirtualItemsList extends PureComponent {
  rowRenderer = ({ key, index, style }) => {
    return (
      <ListRow
        id={this.props.itemsIDs[index]}
        disableHeader
        key={index}
        style={style}
        onFolderClick={this.props.onFolderClick}
        onItemCheck={this.props.onItemCheck}
        onItemRenameToggle={this.props.onItemRenameToggle}
        deleteSelectedItems={this.props.deleteSelectedItems}
      />
    );
  };

  headerRowRenderer = ({ className, columns, style }) => {
    const { selectedItemsCount, itemsCount } = this.props;
    return (
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>
            <Checkbox
              checked={itemsCount === selectedItemsCount}
              indeterminate={
                selectedItemsCount !== itemsCount && selectedItemsCount > 0
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
    );
  };
  render() {
    const { selectedItemsCount, itemsCount } = this.props;
    return (
      <VTable
        width={800}
        height={500}
        rowHeight={70}
        rowCount={this.props.itemsIDs.length}
        overScanRowCount={this.props.itemsIDs.length}
        rowRenderer={this.rowRenderer}
        headerRowRenderer={this.headerRowRenderer}
        rowGetter={({ index }) => this.props.itemsIDs[index]}
      />
    );
  }
}
export default VirtualItemsList;
