import React, { PureComponent } from 'react';
import LoginForm from './forms/LoginForm';
import { connect } from 'react-redux';
import { loginRequest } from 'actions/auth';
import { Helmet } from 'react-helmet';
import { Grid, Header, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class Login extends PureComponent {
  render() {
    return (
      <div style={{ paddingTop: '10vh' }}>
        <Helmet>
          <title>Login</title>
        </Helmet>
        <Grid textAlign="center" verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" color="teal" textAlign="center">
              Login to your account
            </Header>
            <LoginForm
              onSubmit={this.login}
              loading={this.props.auth.currentlySending}
            />
            <Message>
              Not registered?
              <Link to="/auth/register"> Sign Up</Link>
            </Message>
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

export default connect(
  mapStateToProps,
  { loginRequest }
)(Login);
