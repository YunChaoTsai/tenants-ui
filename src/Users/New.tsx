import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, FormikProps, FormikActions, Form } from "formik"
import * as Validator from "yup"
import { Button } from "@tourepedia/ui"

import { InputField } from "./../Shared/InputField"
import { withXHR, XHRProps } from "./../xhr"

export interface NewUserCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
  email_verified_link: string
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
const initialValues: NewUserCredentials = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  email_verified_link: "",
}

interface NewUserProps extends RouteComponentProps, XHRProps {}

export function NewUser({ xhr, navigate, location }: NewUserProps) {
  initialValues.email_verified_link = location
    ? `${location.origin}/email-verified`
    : ""
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
          xhr
            .post("/users", values)
            .then(({ data }) => {
              const { data: user } = data
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
        render={({
          isSubmitting,
          status,
          values,
        }: FormikProps<NewUserCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <fieldset>
              <legend>Invite New User</legend>
              <InputField
                label="Name"
                name="name"
                required
                placeholder="John Tourepedia"
                autoComplete="name"
              />
              <InputField
                label="Email"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="username@tourepedia.com"
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
              <input
                hidden
                type="hidden"
                name="email_verified_link"
                value={values.email_verified_link}
              />
              <footer>
                <Button primary type="submit" disabled={isSubmitting}>
                  Submit
                </Button>
                <Link to=".." className="btn">
                  Cancel
                </Link>
              </footer>
            </fieldset>
          </Form>
        )}
      />
    </div>
  )
}

export default withXHR<NewUserProps>(NewUser)
