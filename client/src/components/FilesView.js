import React, { PureComponent } from 'react';
import FilesViewTable from './FilesViewTable';
import FilesViewGrid from './FilesViewGrid';
import { formatBytes } from '../utils/formatBytes';
import moment from 'moment';

class FilesView extends PureComponent {
  render() {
    switch (this.props.items.view) {
      case 'grid':
        return <FilesViewGrid {...this.props} />;
      case 'table':
        return <FilesViewTable {...this.props} />;
      default:
        return '';
    }
  }
}

export default FilesView;
