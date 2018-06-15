import React from 'react';
import { Menu, Responsive } from 'semantic-ui-react';
import styled from 'styled-components';
import { NavLink, withRouter } from 'react-router-dom';

const StyledSidebar = styled.div`
  top: 70px;
  position: fixed;
  z-index: 300;
  padding-left: 32px;
  padding-top: 25px;
  width: 148px;
  height: 100vh;

  .selected {
    color: black;
  }
`;

const Sidebar = props => {
  return (
    <Responsive minWidth={768} as={StyledSidebar}>
      <Menu text vertical fluid>
        <Menu.Item header>Navigation</Menu.Item>
        <Menu.Item name="Home">
          <NavLink to="/storage/home" activeClassName="selected">
            Home
          </NavLink>
        </Menu.Item>
        <Menu.Item name="Filter by tags">
          <NavLink to="/storage/tags" activeClassName="selected">
            Filter by tags
          </NavLink>
        </Menu.Item>
      </Menu>
    </Responsive>
  );
};

export default withRouter(Sidebar);
