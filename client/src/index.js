import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import registerServiceWorker from './registerServiceWorker';
import configureStore from './configureStore';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import { Route, Redirect, Switch } from 'react-router';
import indexSaga from './sagas';
import RefreshToken from './containers/RefreshToken';
import LoginPage from './containers/LoginPage';
import FolderPage from './containers/FolderPage';
import { checkToken } from './utils/localStorage';
//import './components/FilesViewTable.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-notifications/lib/notifications.css';
import { whyDidYouUpdate } from 'why-did-you-update';

const history = createHistory();
const store = configureStore(history);

store.runSaga(indexSaga);

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      checkToken('accessToken') ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location }
          }}
        />
      )
    }
  />
);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/login" component={LoginPage} />
        <RefreshToken>
          <PrivateRoute path="/storage" component={FolderPage} />
        </RefreshToken>
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
//whyDidYouUpdate(React)
