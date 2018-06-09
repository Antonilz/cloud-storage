import React, { PureComponent } from 'react';
import {
  Grid,
  Icon,
  Checkbox,
  Dropdown,
  Menu,
  Header,
  Button,
  Card,
  Container
} from 'semantic-ui-react';
import styled from 'styled-components';
import { Grid as VGrid, AutoSizer, WindowScroller } from 'react-virtualized';
import 'react-virtualized/styles.css';
import GridCell from '../containers/GridCell';

const StyledGrid = styled(VGrid)`
  background-color: white;
  &:focus {
    outline: none;
  }
  .ReactVirtualized__Grid__innerScrollContainer {
    min-height: 460px;
  }
  .ReactVirtualized__Grid {
    &:focus {
      outline: none;
    }
  }
`;

class FilesViewGrid extends PureComponent {
  cellRenderer = ({ key, columnIndex, rowIndex, style }) => {
    const index = rowIndex * 4 + columnIndex;
    return index < this.props.itemsIDs.length ? (
      <GridCell
        id={this.props.itemsIDs[index]}
        //index={index}
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
    ) : null;
  };

  render() {
    const { selectedItemsCount, itemsIDs } = this.props;
    return (
      <div>
        {itemsIDs.length > 0 && (
          <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <StyledGrid
                    autoHeight
                    scrollTop={scrollTop}
                    isScrolling={isScrolling}
                    onScroll={onChildScroll}
                    width={width}
                    height={height}
                    rowHeight={180}
                    columnWidth={width / 4}
                    columnCount={4}
                    rowCount={Math.ceil(this.props.itemsIDs.length / 4)}
                    overScanRowCount={10}
                    items={this.props.itemsIDs}
                    cellRenderer={this.cellRenderer}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        )}
      </div>
    );
  }
}

export default FilesViewGrid;
