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
import GridCell from '../containers/GridCell';

const StyledGrid = styled(VGrid)`
  background-color: white;
  padding-bottom: 20px;
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
  state = {
    columnCount: 5
  };

  cellRenderer = ({ key, columnIndex, rowIndex, style }) => {
    const index = rowIndex * this.state.columnCount + columnIndex;
    return (
      index < this.props.itemsCount && (
        <GridCell
          id={this.props.itemsIDs[index]}
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
      )
    );
  };

  calculateColumnCount = ({ width, height }) => {
    console.log(width);
    if (width <= 768) {
      this.setState({
        columnCount: 3
      });
    } else {
      this.setState({
        columnCount: 5
      });
    }
  };

  render() {
    const { selectedItemsCount, itemsIDs } = this.props;
    const { columnCount } = this.state;
    console.log(this.props);
    return (
      <WindowScroller>
        {({ height, isScrolling, onChildScroll, scrollTop }) => (
          <AutoSizer disableHeight onResize={this.calculateColumnCount}>
            {({ width }) => {
              return (
                <StyledGrid
                  autoHeight
                  scrollTop={scrollTop}
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  width={width}
                  height={height}
                  //rowHeight={180}
                  rowHeight={width / columnCount}
                  columnWidth={width / columnCount}
                  columnCount={columnCount}
                  rowCount={Math.ceil(itemsIDs.length / columnCount)}
                  overScanRowCount={10}
                  items={itemsIDs}
                  cellRenderer={this.cellRenderer}
                />
              );
            }}
          </AutoSizer>
        )}
      </WindowScroller>
    );
  }
}

export default FilesViewGrid;
