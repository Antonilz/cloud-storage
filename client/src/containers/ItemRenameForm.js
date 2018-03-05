import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Container, Form, Label } from 'semantic-ui-react';

const required = value => (value ? undefined : 'Required');

const renderField = ({
  input,
  label,
  type,
  placeholder,
  meta: { touched, error }
}) => (
  <div>
    <Form.Input
      {...input}
      placeholder={placeholder}
      label={label}
      type={type}
      size="large"
    />
    {touched &&
      (error && (
        <Label basic color="red" pointing="left">
          {error}
        </Label>
      ))}
  </div>
);

class ItemRenameForm extends Component {
  render() {
    const {
      handleSubmit,
      pristine,
      submitting,
      error,
      loading,
      previousName
    } = this.props;
    return (
      <Form onSubmit={handleSubmit} loading={loading}>
        <Form.Group>
          <Field
            name="name"
            type="text"
            component={renderField}
            validate={required}
            placeholder="Name"
          />
          <Form.Button positive size="large" type="submit">
            Create
          </Form.Button>
        </Form.Group>
      </Form>
    );
  }
}

export default reduxForm({
  form: 'renameItemForm'
})(ItemRenameForm);
