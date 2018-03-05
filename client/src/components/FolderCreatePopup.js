import React, { Component } from 'react';
import { Popup, Menu, Icon } from 'semantic-ui-react';
import FolderCreateForm from '../containers/FolderCreateForm';

const FolderCreatePopup = ({ onSubmitAction }) => (
  <Popup
    trigger={
      <Menu.Item>
        <Icon name="plus" color="green" />Create Folder
      </Menu.Item>
    }
    content={<FolderCreateForm onSubmit={onSubmitAction} />}
    on="click"
    position="bottom left"
  />
);

export default FolderCreatePopup;
