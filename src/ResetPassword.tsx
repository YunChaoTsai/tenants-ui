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
} from "formik"
import * as Validator from "yup"

import { searchToQuery } from "./utils"
import { ThunkDispatch, ThunkAction } from "./types"
import { InputField } from "./Shared/InputField"

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
      <div className="text--center">
        <h1>Reset Password</h1>
        <p>
          Just enter your new password to reset the password for your email
          address ({email})
        </p>
      </div>
      <div className="w--sm">
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
                if (error.formikErrors) {
                  actions.setErrors(error.formikErrors)
                }
                actions.setStatus(error.message)
                actions.setSubmitting(false)
              })
          }}
          render={({
            isSubmitting,
            status,
          }: FormikProps<IResetPasswordCredentials>) => (
            <Form noValidate>
              <fieldset>
                {status ? <p className="error">{status}</p> : null}
                <Field
                  name="email"
                  render={({
                    field: { value, name },
                  }: FieldProps<IResetPasswordCredentials>) => (
                    <input type="hidden" hidden name={name} value={value} />
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
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  id="password"
                  autoFocus
                  autoComplete="new-password"
                  required
                />
                <InputField
                  label="Confirm Password"
                  name="password_confirmation"
                  type="password"
                  id="password_confirmation"
                  autoComplete="new-password"
                  required
                />
                <footer>
                  <Button type="submit" disabled={isSubmitting}>
                    Reset Password
                  </Button>
                </footer>
              </fieldset>
            </Form>
          )}
        />
        or get instructions{" "}
        <Link to={`/forgot-password?email=${email}`}>again</Link> or{" "}
        <Link to="/login">login</Link> if you remember your password!
      </div>
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
