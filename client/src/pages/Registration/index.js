import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { registerRequest } from 'actions/auth';
import { Helmet } from 'react-helmet';
import { Grid, Header, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import RegistrationForm from './forms/RegistrationForm';

class Registration extends PureComponent {
  render() {
    return (
      <div style={{ paddingTop: '10vh' }}>
        <Helmet>
          <title>Register</title>
        </Helmet>
        <Grid textAlign="center" verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" color="teal" textAlign="center">
              Create an account
            </Header>
            <RegistrationForm
              onSubmit={this.register}
              loading={this.props.auth.currentlySending}
            />
            <Message>
              Already registered?
              <Link to="/auth/login"> Sign in</Link>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    );
  }

  register = ({ email, login, password }) => {
    this.props.registerRequest({ email, login, password });
  };
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { registerRequest }
)(Registration);
