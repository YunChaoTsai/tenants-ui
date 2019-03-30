import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikProps,
  FormikActions,
  Form,
  Field,
  FieldProps,
  ErrorMessage,
} from "formik"
import * as Validator from "yup"
import Button from "@tourepedia/button"

import { InputField } from "./../Shared/InputField"
import { withXHR, XHRProps } from "./../xhr"

export interface NewUserCredentials {
  name: string
}
const newUserSchema = Validator.object().shape({
  name: Validator.string()
    .required("Name is required")
    .min(4, "Minimum 4 characters required")
    .max(199, "Maximum 199 characters allowed"),
  email: Validator.string()
    .email("Email must be a valid email address")
    .required("Email field is required"),
  password: Validator.string()
    .required("Password is required")
    .min(8, "Password must be of a length greater than 8"),
  password_confirmation: Validator.string()
    .required("Password confirmation is required")
    .min(8, "Password must be of a length greater than 8"),
})
const initialValues = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
}

interface NewUserProps extends RouteComponentProps, XHRProps {}

export function NewUser({ xhr, navigate }: NewUserProps) {
  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={newUserSchema}
        onSubmit={(
          values: NewUserCredentials,
          actions: FormikActions<NewUserCredentials>
        ) => {
          actions.setStatus()
          return xhr
            .post("/users", values)
            .then(({ data }) => {
              const { user } = data
              navigate && navigate(`../${user.id}`)
              actions.setSubmitting(false)
            })
            .catch(error => {
              actions.setStatus(error.message)
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
              actions.setSubmitting(false)
            })
        }}
        render={({ isSubmitting, status }: FormikProps<NewUserCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <InputField label="Name" name="name" required />
            <InputField
              label="Email"
              type="email"
              name="email"
              autoComplete="username"
              required
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
            />
            <InputField
              label="Retype Password"
              type="password"
              name="password_confirmation"
              autoComplete="new-password"
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
            <Link to="..">Cancel</Link>
          </Form>
        )}
      />
    </div>
  )
}

export default withXHR<NewUserProps>(NewUser)
