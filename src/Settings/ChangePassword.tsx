import React from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import { Formik, FormikProps, FormikActions, Form } from "formik"
import { Button } from "@tourepedia/ui"
import * as Validator from "yup"

import { RedirectUnlessAuthenticated, useAuthUser } from "./../Auth"
import Helmet from "react-helmet-async"
import { InputField } from "../Shared/InputField"
import { withXHR, XHRProps } from "../xhr"

// schemas
export interface IChangePasswordCredentials {
  current: string
  password: string
  password_confirmation: string
}
export const changePasswordSchema = Validator.object().shape({
  current: Validator.string().required("Current password field is required"),
  password: Validator.string().required("Password field is required"),
  password_confirmation: Validator.string().required(
    "Password confirmation field is required"
  ),
})

// actions
function XHR(xhr: AxiosInstance) {
  return {
    async changePassword(data: IChangePasswordCredentials): Promise<any> {
      return xhr.patch("/passwords", data)
    },
  }
}

const changePasswordInitialValues: IChangePasswordCredentials = {
  current: "",
  password: "",
  password_confirmation: "",
}

interface ChangePasswordProps extends XHRProps, RouteComponentProps {}

function ChangePassword({ xhr, navigate }: ChangePasswordProps) {
  const { user } = useAuthUser()
  return (
    <RedirectUnlessAuthenticated>
      <Helmet>
        <title>Change Password</title>
      </Helmet>
      <Formik
        initialValues={changePasswordInitialValues}
        validationSchema={changePasswordSchema}
        onSubmit={(
          values: IChangePasswordCredentials,
          actions: FormikActions<IChangePasswordCredentials>
        ) => {
          actions.setStatus()
          XHR(xhr)
            .changePassword(values)
            .then(() => {
              alert("Password updated successfully")
              navigate && navigate("/")
            })
            .catch(error => {
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
              actions.setStatus(error.message)
              actions.setSubmitting(false)
            })
        }}
        render={({ isSubmitting }: FormikProps<IChangePasswordCredentials>) => (
          <Form noValidate>
            <fieldset>
              <legend>Change Password</legend>
              {user ? (
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  hidden
                  readOnly
                  autoComplete="username"
                />
              ) : null}
              <InputField
                label="Current Password"
                name="current"
                type="password"
                required
                id="current"
                autoComplete="current-password"
              />
              <InputField
                name="password"
                label="New Password"
                type="password"
                required
                id="password"
                autoComplete="new-password"
              />
              <InputField
                label="Confirm new password"
                name="password_confirmation"
                type="password"
                required
                id="password_confirmation"
                autoComplete="new-password"
              />
              <footer>
                <Button primary type="submit" disabled={isSubmitting}>
                  Update
                </Button>
              </footer>
            </fieldset>
          </Form>
        )}
      />
    </RedirectUnlessAuthenticated>
  )
}
export default withXHR(ChangePassword)
