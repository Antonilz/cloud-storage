import React, { PureComponent } from 'react';
import { Checkbox } from 'semantic-ui-react';
import styled from 'styled-components';
import { Table as VTable, AutoSizer, WindowScroller } from 'react-virtualized';
import ListRow from '../containers/ListRow';

const StyledTable = styled(VTable)`
  background-color: white;
  .ReactVirtualized__Grid__innerScrollContainer {
    display: grid;
    grid-template-columns: 1fr 2fr 3fr 4fr;
    grid-gap: 20px;
    min-height: 460px;
  }
  .ReactVirtualized__Table__Grid {
    &:focus {
      outline: none;
    }
  }
`;

const StyledHeader = styled.div`
  width: 100%;
  position: sticky;
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns:
    minmax(20px, 50px) minmax(200px, 5fr) 3fr
    2fr 2fr;
  grid-gap: 20px;
  background: #f9fafb;
  font-weight: 700;
  border: 1px 1px 0 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.28571429rem;
  color: rgba(0, 0, 0, 0.87);
`;

const StyledCell = styled.div`
  padding: 20px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  &.selectBox {
    justify-content: center;
  }
`;

class FilesViewList extends PureComponent {
  rowRenderer = ({ key, index, style }) => {
    return (
      <ListRow
        id={this.props.itemsIDs[index]}
        index={index}
        key={key}
        itemsCount={this.props.itemsIDs.length}
        style={{ ...style, overflow: 'visible' }}
        onFolderClick={this.props.onFolderClick}
        onFileClick={this.props.onFileClick}
        onItemCheck={this.props.onItemCheck}
        onItemRenameToggle={this.props.onItemRenameToggle}
        onItemsTagsEditToggle={this.props.onItemsTagsEditToggle}
        deleteSelectedItems={this.props.deleteSelectedItems}
      />
    );
  };

  headerRowRenderer = ({ className, columns, style }) => {
    const { selectedItemsCount, itemsCount } = this.props;
    return (
      <StyledHeader style={{ width: style.width }}>
        <StyledCell className="selectBox">
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
        </StyledCell>
        <StyledCell>Name</StyledCell>
        <StyledCell>Last Modified</StyledCell>
        <StyledCell>Size</StyledCell>
        <StyledCell />
      </StyledHeader>
    );
  };
  render() {
    const { selectedItemsCount, itemsIDs } = this.props;
    return (
      <WindowScroller>
        {({ height, isScrolling, onChildScroll, scrollTop }) => (
          <AutoSizer disableHeight>
            {({ width }) => (
              <StyledTable
                autoHeight
                scrollTop={scrollTop}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                width={width}
                height={height}
                rowHeight={80}
                rowCount={itemsIDs.length}
                overScanRowCount={15}
                rowRenderer={this.rowRenderer}
                headerRowRenderer={this.headerRowRenderer}
                rowGetter={({ index }) => itemsIDs[index]}
              />
            )}
          </AutoSizer>
        )}
      </WindowScroller>
    );
  }
}
export default FilesViewList;
