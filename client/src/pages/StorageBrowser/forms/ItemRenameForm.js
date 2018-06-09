import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Label } from 'semantic-ui-react';
import { renameItemRequest } from 'actions/storage';
import styled from 'styled-components';

const required = value => (value && value.length > 0 ? undefined : 'Required');

const StyledForm = styled(Form)`
  & {
    display: inline-block;
    input {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    form {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .field {
      width: 100%;
    }
  }
`;

const renderField = ({
  input,
  label,
  type,
  placeholder,
  meta: { touched, error }
}) => (
  <React.Fragment>
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
  </React.Fragment>
);

class ItemRenameForm extends Component {
  submit = (values, dispatch, props) =>
    new Promise((resolve, reject) => {
      dispatch(
        renameItemRequest({
          formName: props.form,
          ...values,
          item: this.props.item,
          promise: { resolve, reject }
        })
      );
    });
  render() {
    const { handleSubmit, pristine, submitting, error } = this.props;
    const submit = handleSubmit(this.submit);
    return (
      <StyledForm
        onSubmit={() => {
          if (!pristine) {
            submit();
          } else {
            this.props.onItemRenameToggle({
              id: this.props.item.data.id,
              status: false
            });
          }
        }}
        onBlur={() => {
          if (!pristine) {
            submit();
          } else {
            this.props.onItemRenameToggle({
              id: this.props.item.data.id,
              status: false
            });
          }
        }}
        loading={submitting}
        size="small"
      >
        <Field
          name="name"
          type="text"
          component={renderField}
          placeholder="Name"
          onFocus={event => {
            event.target.select();
          }}
        />
      </StyledForm>
    );
  }
}

export default reduxForm({
  form: 'renameItemForm'
})(ItemRenameForm);
