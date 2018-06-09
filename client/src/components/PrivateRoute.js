import React from 'react';
import { Route, Redirect } from 'react-router';
import { checkToken } from 'utils/localStorage';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      checkToken('accessToken') ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/auth',
            state: { from: props.location }
          }}
        />
      )
    }
  />
);

export default PrivateRoute;
