import React from 'react';
import { Popup, Menu, Icon } from 'semantic-ui-react';
import FolderCreateForm from '../forms/FolderCreateForm';

const FolderCreatePopup = ({ onSubmitAction, path }) => (
  <Popup
    trigger={
      <Menu.Item>
        <Icon name="plus" color="green" />Create Folder
      </Menu.Item>
    }
    content={<FolderCreateForm path={path} createFolder={onSubmitAction} />}
    on="click"
    onOpen={(event, data) => {
      window.scrollTo(0, 0);
    }}
    style={{ position: 'fixed' }}
    position="bottom left"
  />
);

export default FolderCreatePopup;
