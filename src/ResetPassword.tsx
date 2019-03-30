import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Button from "@tourepedia/button"
import Helmet from "react-helmet-async"
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
import * as Validator from "yup"

import { searchToQuery } from "./utils"
import { ThunkDispatch, ThunkAction } from "./types"

// schemas
export interface IResetPasswordCredentials {
  email: string
  token: string
  password: string
  password_confirmation: string
}
export const resetPasswordSchema = Validator.object().shape({
  email: Validator.string()
    .required("Email field is required")
    .email("Invalid email address"),
  token: Validator.string().required(
    "Missing token to reset values. Please check for valid url from sent email"
  ),
  password: Validator.string().required("Password field is required"),
  password_confirmation: Validator.string().required(
    "Password confirmation field is required"
  ),
})

// actions
function XHR(xhr: AxiosInstance) {
  return {
    resetPassword(data: IResetPasswordCredentials): Promise<any> {
      return xhr.delete("/passwords/reset", { data })
    },
  }
}

export const resetPassword = (
  data: IResetPasswordCredentials
): ThunkAction<Promise<any>> => (dispatch, getState, { xhr }) =>
  XHR(xhr).resetPassword(data)

// component
interface OwnProps extends RouteComponentProps {}
interface DispatchProps {
  resetPassword: (data: IResetPasswordCredentials) => Promise<any>
}
interface IResetPasswordProps extends OwnProps, DispatchProps {}
function ResetPassword({
  navigate,
  location,
  resetPassword,
}: IResetPasswordProps) {
  const query = searchToQuery(location && location.search)
  const email = query["email"]
  const token = query["token"]
  if (!(email && token)) {
    navigate && navigate("/")
  }
  return (
    <div>
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      <h2>Reset Password</h2>
      <Formik
        initialValues={{
          email,
          token,
          password: "",
          password_confirmation: "",
        }}
        validationSchema={resetPasswordSchema}
        onSubmit={(
          values: IResetPasswordCredentials,
          actions: FormikActions<IResetPasswordCredentials>
        ) => {
          actions.setStatus()
          return resetPassword(values)
            .then(() => {
              alert(
                "Your passwords updated successfully. You can now log in with the new password"
              )
              navigate && navigate("/login")
            })
            .catch(error => {
              actions.setStatus(error.message)
              actions.setSubmitting(false)
            })
        }}
        render={({
          isSubmitting,
          status,
        }: FormikProps<IResetPasswordCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <Field
              name="email"
              render={({
                field: { value, name },
              }: FieldProps<IResetPasswordCredentials>) => (
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    autoComplete="username email"
                    readOnly
                    name={name}
                    value={value}
                  />
                  <ErrorMessage name="email" />
                </div>
              )}
            />
            <Field
              name="token"
              render={({
                field: { value, name },
              }: FieldProps<IResetPasswordCredentials>) => (
                <input type="hidden" value={value} name={name} />
              )}
            />
            <Field
              name="password"
              render={({ field }: FieldProps<IResetPasswordCredentials>) => (
                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    autoFocus
                    autoComplete="new-password"
                    required
                    {...field}
                  />
                  <ErrorMessage name="password" />
                </div>
              )}
            />
            <Field
              name="password_confirmation"
              render={({ field }: FieldProps<IResetPasswordCredentials>) => (
                <div>
                  <label htmlFor="password_confirmation">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="password_confirmation"
                    autoComplete="new-password"
                    required
                    {...field}
                  />
                  <ErrorMessage name="password_confirmation" />
                </div>
              )}
            />
            <footer>
              <Button type="submit" disabled={isSubmitting}>
                Reset Password
              </Button>
            </footer>
          </Form>
        )}
      />
      or get instructions{" "}
      <Link to={`/forgot-password?email=${email}`}>again</Link> or{" "}
      <Link to="/login">Login</Link> if you remember your password!
    </div>
  )
}
export default connect<{}, DispatchProps, OwnProps>(
  null,
  (dispatch: ThunkDispatch) => ({
    resetPassword: (data: IResetPasswordCredentials) =>
      dispatch(resetPassword(data)),
  })
)(ResetPassword)
