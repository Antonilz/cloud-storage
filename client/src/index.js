import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import { Route, Redirect, Switch } from 'react-router';
import indexSaga from './sagas';
import RefreshToken from './containers/RefreshToken';
import Login from './pages/Login';
import Registration from './pages/Registration';
import StorageBrowser from './pages/StorageBrowser';
import 'react-notifications/lib/notifications.css';
import 'semantic-ui-css/semantic.min.css';
import PrivateRoute from 'components/PrivateRoute';
//import { whyDidYouUpdate } from 'why-did-you-update';

const history = createHistory();
const store = configureStore(history);

store.runSaga(indexSaga);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/auth/login" component={Login} />
        <Route exact path="/auth/register" component={Registration} />
        <Route exact path="/auth">
          <Redirect to="/auth/login" />
        </Route>
        <Route exact path="/">
          <Redirect to="/storage/home" />
        </Route>
        <Route exact path="/storage">
          <Redirect to="/storage/home" />
        </Route>
        <RefreshToken>
          <PrivateRoute path="/storage" component={StorageBrowser} />
        </RefreshToken>
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);

//whyDidYouUpdate(React);
