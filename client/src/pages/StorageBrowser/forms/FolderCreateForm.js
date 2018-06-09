import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Label } from 'semantic-ui-react';
import { createFolderRequest } from 'actions/storage'; // importing our

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
  submit = (values, dispatch, props) =>
    new Promise((resolve, reject) => {
      dispatch(
        createFolderRequest({
          formName: props.form,
          ...values,
          path: this.props.path.replace(/\/storage.|\/storage/, ''),
          promise: { resolve, reject }
        })
      );
    });
  render() {
    const { handleSubmit, pristine, submitting, error } = this.props;
    const submit = handleSubmit(this.submit);
    return (
      <Form onSubmit={submit} loading={submitting}>
        <Form.Group inline>
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
