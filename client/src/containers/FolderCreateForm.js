import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Label } from 'semantic-ui-react';

const required = value => (value && value.length > 0 ? undefined : 'Required');

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
      autoFocus
    />
    {touched &&
      (error && (
        <Label basic color="red" pointing="left">
          {error}
        </Label>
      ))}
  </div>
);

class FolderCreateForm extends Component {
  render() {
    const { handleSubmit, pristine, submitting, error, loading } = this.props;
    return (
      <Form onSubmit={handleSubmit} loading={loading}>
        <Form.Group>
          <Field
            name="name"
            type="text"
            component={renderField}
            //validate={required}
            placeholder="Name"
          />
          <Form.Button
            positive
            size="large"
            type="submit"
            disabled={submitting}
          >
            Create
          </Form.Button>
        </Form.Group>
      </Form>
    );
  }
}

export default reduxForm({
  form: 'createFolderForm'
})(FolderCreateForm);
