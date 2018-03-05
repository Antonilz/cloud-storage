import React, { PureComponent } from 'react';
import LoginForm from './LoginForm';
import { connect } from 'react-redux';
import { loginRequest } from '../actions/auth';
import { Helmet } from 'react-helmet';
import { Grid, Header } from 'semantic-ui-react';

class LoginPage extends PureComponent {
  render() {
    return (
      <div style={{ marginTop: '20vh' }}>
        <Helmet>
          <title>Login</title>
        </Helmet>,
        <Grid
          textAlign="center"
          style={{ height: '100%' }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" color="teal" textAlign="center">
              Login to your account
            </Header>
            <LoginForm
              onSubmit={this.login}
              loading={this.props.auth.currentlySending}
            />
          </Grid.Column>
        </Grid>
      </div>
    );
  }

  login = ({ email, password }) => {
    this.props.loginRequest({ email, password });
  };
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { loginRequest })(LoginPage);
