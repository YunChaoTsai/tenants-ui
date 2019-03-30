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
      <h2>Change Password</h2>
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
              actions.setStatus(error.message)
              actions.setSubmitting(false)
            })
        }}
        render={(form: FormikProps<IChangePasswordCredentials>) => (
          <Form noValidate>
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
            <Field
              name="current"
              render={({ field }: FieldProps<IChangePasswordCredentials>) => (
                <div>
                  <label htmlFor="current">Current Password</label>
                  <input
                    {...field}
                    type="password"
                    required
                    id="current"
                    autoComplete="current-password"
                  />
                  <ErrorMessage name={field.name} />
                </div>
              )}
            />
            <Field
              name="password"
              render={({ field }: FieldProps<IChangePasswordCredentials>) => (
                <div>
                  <label htmlFor="password">New Password</label>
                  <input
                    {...field}
                    type="password"
                    required
                    id="password"
                    autoComplete="new-password"
                  />
                  <ErrorMessage name={field.name} />
                </div>
              )}
            />
            <Field
              name="password_confirmation"
              render={({ field }: FieldProps<IChangePasswordCredentials>) => (
                <div>
                  <label htmlFor="password_confirmation">
                    Confirm new password
                  </label>
                  <input
                    {...field}
                    type="password"
                    required
                    id="password_confirmation"
                    autoComplete="new-password"
                  />
                  <ErrorMessage name={field.name} />
                </div>
              )}
            />
            <Button type="submit">Update</Button>
            <Button
              onClick={() => {
                navigate && navigate("..")
              }}
            >
              Cancel
            </Button>
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
