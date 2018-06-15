import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import FilesViewList from './FilesViewList';
import FilesViewGrid from './FilesViewGrid';

const FilesView = props => {
  const { storageIsFetching, currentViewType } = props;
  return (
    <React.Fragment>
      {storageIsFetching && (
        <Dimmer
          inverted
          active
          style={{ height: '30vh', backgroundColor: 'transparent' }}
        >
          <Loader size="large" />
        </Dimmer>
      )}
      <Dimmer.Dimmable blurring dimmed={storageIsFetching}>
        {currentViewType === 'list' ? (
          <FilesViewList {...props} />
        ) : (
          <FilesViewGrid {...props} />
        )}
      </Dimmer.Dimmable>
    </React.Fragment>
  );
};

export default FilesView;
