import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Segment } from 'semantic-ui-react';
import styled from 'styled-components';
import { required, email, length, confirmation } from 'redux-form-validators';

const StyledFormInputWrapper = styled.div`
  padding: 10px 0;
`;

const StyledError = styled.div`
  color: red;
  width: fit-content;
  margin-left: 7px;
`;

const renderField = ({
  input,
  placeholder,
  type,
  icon,
  meta: { touched, error, warning }
}) => (
  <StyledFormInputWrapper>
    <Form.Input
      {...input}
      placeholder={placeholder}
      type={type}
      icon={icon}
      size="large"
      iconPosition="left"
    />
    {touched &&
      ((error && <StyledError>{error}</StyledError>) ||
        (warning && <StyledError>{warning}</StyledError>))}
  </StyledFormInputWrapper>
);

const RegistrationForm = props => {
  const { handleSubmit, submitting, error, loading } = props;
  return (
    <Form onSubmit={handleSubmit} loading={loading} size="large">
      <Segment stacked>
        <Field
          name="login"
          placeholder="Login name"
          type="text"
          icon="user"
          autoFocus
          component={renderField}
          validate={[required(), length({ in: [4, 20] })]}
        />
        <Field
          name="email"
          placeholder="Email address"
          type="text"
          icon="mail"
          autoFocus
          component={renderField}
          validate={[required(), email()]}
        />
        <Field
          name="password"
          placeholder="Password"
          type="password"
          icon="lock"
          label="password"
          validate={[required(), length({ in: [6, 20] })]}
          component={renderField}
        />
        <Field
          name="repeatPassword"
          placeholder="Repeat Password"
          type="password"
          icon="lock"
          validate={[
            confirmation({ field: 'password', fieldLabel: 'Password' })
          ]}
          component={renderField}
        />
        <Form.Button
          disabled={loading}
          color="teal"
          fluid
          size="large"
          type="submit"
        >
          Register
        </Form.Button>
      </Segment>
    </Form>
  );
};

export default reduxForm({
  form: 'registrationForm'
})(RegistrationForm);
