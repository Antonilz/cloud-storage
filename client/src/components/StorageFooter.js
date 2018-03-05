import React, { PureComponent } from 'react';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';

class StorageFooter extends PureComponent {
  render() {
    return (
      <Menu>
        <Menu.Item header>
          MPEI<Icon
            color="blue"
            name="cloud"
            size="large"
            style={{ margin: 0 }}
          />storage
        </Menu.Item>
        <Menu.Menu position="right">
          <Dropdown item text={this.props.username}>
            <Dropdown.Menu>
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Item onClick={this.props.handleLogoutClick}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
    );
  }
}

export default StorageFooter;
