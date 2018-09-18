import React, { PureComponent } from 'react';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import SearchItems from './SearchItems';
import styled from 'styled-components';

const StyledStickyHeader = styled.header`
  & {
    top: 0;
    position: sticky;
    display: flex;
    width: 100%;
    z-index: 300;
    background-color: #edeef0;
    margin-top: 0;
  }
`;

class StorageHeader extends PureComponent {
  render() {
    return (
      <StyledStickyHeader>
        <Menu fluid>
          <Menu.Item header>
            {this.props.appName}
            <Icon
              color="blue"
              name="cloud"
              size="large"
              style={{ margin: '5px' }}
            />
            storage
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item>
              <SearchItems />
            </Menu.Item>
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
      </StyledStickyHeader>
    );
  }
}

export default StorageHeader;
