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
  invited_signup_link: string
}
const newUserSchema = Validator.object().shape({
  name: Validator.string()
    .required("Name is required")
    .min(4, "Minimum 4 characters required")
    .max(199, "Maximum 199 characters allowed"),
  email: Validator.string()
    .email("Email must be a valid email address")
    .required("Email field is required"),
})
const initialValues: NewUserCredentials = {
  name: "",
  email: "",
  invited_signup_link: "",
}

interface NewUserProps extends RouteComponentProps, XHRProps {}

export function NewUser({ xhr, navigate, location }: NewUserProps) {
  initialValues.invited_signup_link = location
    ? `${location.origin}/invited-signup`
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
            .post("/invited-users", values)
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
              <input
                hidden
                type="hidden"
                name="invited_signup_link"
                value={values.invited_signup_link}
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
