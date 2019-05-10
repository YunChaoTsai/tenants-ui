import React from "react"
import { RouteComponentProps } from "@reach/router"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import {
  Formik,
  FormikProps,
  FormikActions,
  Form,
  Field,
  FieldProps,
  ErrorMessage,
} from "formik"
import Button from "@tourepedia/button"
import * as Validator from "yup"

import { RedirectUnlessAuthenticated, AuthUserProvider } from "./../Auth"
import { ThunkDispatch, ThunkAction } from "./../types"
import Helmet from "react-helmet-async"
import { InputField } from "../Shared/InputField"

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
    changePassword(data: IChangePasswordCredentials): Promise<any> {
      return xhr.patch("/passwords", data)
    },
  }
}
export const changePassword = (
  data: IChangePasswordCredentials
): ThunkAction<Promise<any>> => (dispatch, getState, { xhr }) =>
  XHR(xhr).changePassword(data)
const changePasswordInitialValues: IChangePasswordCredentials = {
  current: "",
  password: "",
  password_confirmation: "",
}

// component
interface DispatchProps {
  changePassword: (data: IChangePasswordCredentials) => Promise<any>
}
interface OwnProps extends RouteComponentProps {}
interface ChangePasswordProps extends OwnProps, DispatchProps {}
function ChangePassword({ changePassword, navigate }: ChangePasswordProps) {
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
          changePassword(values)
            .then(() => {
              alert("Password updated successfully")
              navigate && navigate("/me")
            })
            .catch(error => {
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
              actions.setStatus(error.message)
              actions.setSubmitting(false)
            })
        }}
        render={(form: FormikProps<IChangePasswordCredentials>) => (
          <Form noValidate>
            <fieldset>
              <legend>Change Password</legend>
              <AuthUserProvider>
                {({ user }) =>
                  user ? (
                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      hidden
                      readOnly
                      autoComplete="username"
                    />
                  ) : null
                }
              </AuthUserProvider>
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
                <Button type="submit">Update</Button>
              </footer>
            </fieldset>
          </Form>
        )}
      />
    </RedirectUnlessAuthenticated>
  )
}
export default connect<{}, DispatchProps, {}>(
  null,
  (dispatch: ThunkDispatch) => ({
    changePassword: (data: IChangePasswordCredentials) =>
      dispatch(changePassword(data)),
  })
)(ChangePassword)
