import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Label, Segment } from 'semantic-ui-react';

const required = value => (value ? undefined : 'Required');

const renderField = ({
  input,
  placeholder,
  type,
  icon,
  meta: { touched, error, warning }
}) => (
  <div>
    <Form.Input
      {...input}
      placeholder={placeholder}
      type={type}
      icon={icon}
      size="large"
      iconPosition="left"
      style={{ marginBottom: '15px' }}
    />
    {touched &&
      ((error && (
        <Label basic color="red" pointing="left">
          {error}
        </Label>
      )) ||
        (warning && (
          <Label basic color="orange" pointing="left">
            {warning}
          </Label>
        )))}
  </div>
);

const LoginForm = props => {
  const { handleSubmit, pristine, submitting, error, loading } = props;
  return (
    <Form onSubmit={handleSubmit} loading={loading} size="large">
      <Segment stacked>
        <Field
          name="email"
          placeholder="Email address"
          type="text"
          icon="user"
          autoFocus
          component={renderField}
          validate={required}
        />
        <Field
          name="password"
          placeholder="Password"
          type="password"
          icon="lock"
          validate={required}
          component={renderField}
        />
        <Form.Button color="teal" fluid size="large" type="submit">
          Login
        </Form.Button>
      </Segment>
    </Form>
  );
};

export default reduxForm({
  form: 'loginForm'
})(LoginForm);
