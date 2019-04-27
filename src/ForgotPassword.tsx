import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Button from "@tourepedia/button"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import {
  Formik,
  FormikProps,
  Form,
  Field,
  FieldProps,
  FormikActions,
  ErrorMessage,
} from "formik"
import * as Validator from "yup"
import { connect } from "react-redux"

import { RedirectIfAuthenticated } from "./Auth"
import { ThunkDispatch, ThunkAction } from "./types"
import { searchToQuery } from "./utils"
import { InputField } from "./Shared/InputField"

// schemas
export interface IForgotPasswordCredentials {
  email: string
}
export const forgotPasswordSchema = Validator.object().shape({
  email: Validator.string()
    .email("Invalid email address")
    .required("Email field is required"),
})

// actions
function XHR(xhr: AxiosInstance) {
  return {
    forgotPassword(data: IForgotPasswordCredentials): Promise<any> {
      return xhr.post("/passwords/reset", data)
    },
  }
}
export const forgotPassword = (
  data: IForgotPasswordCredentials
): ThunkAction<Promise<any>> => (dispatch, getState, { xhr }) =>
  XHR(xhr).forgotPassword(data)

// component
interface DispatchProps {
  forgotPassword: (data: IForgotPasswordCredentials) => Promise<any>
}
interface OwnProps extends RouteComponentProps {}
interface ForgotPasswordProps extends DispatchProps, OwnProps {}
function ForgotPassword({
  forgotPassword,
  navigate,
  location,
}: ForgotPasswordProps) {
  const query = searchToQuery(location && location.search)
  const email = query["email"] || ""
  return (
    <RedirectIfAuthenticated>
      <Helmet>
        <title>Forgot Password</title>
      </Helmet>
      <h2>Forgot Password</h2>
      <p>
        Not problem? Just enter your email address and we will send the reset
        password instructions to you.
      </p>
      <Formik
        initialValues={{ email }}
        validationSchema={forgotPasswordSchema}
        onSubmit={(
          values: IForgotPasswordCredentials,
          actions: FormikActions<IForgotPasswordCredentials>
        ) => {
          actions.setStatus()
          forgotPassword(values)
            .then(() => {
              alert(`Please check your inbox for password reset instructions.`)
              actions.setSubmitting(false)
              navigate && navigate("/login")
            })
            .catch(error => {
              actions.setStatus(error.message)
              actions.setSubmitting(false)
            })
        }}
        render={({
          errors,
          status,
          isSubmitting,
        }: FormikProps<IForgotPasswordCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <fieldset>
              <InputField
                name="email"
                label="Email"
                placeholder="username@domain.com"
                autoComplete="username email"
                required
                autoFocus
                type="email"
                id="email"
              />
              <Button type="submit" disabled={isSubmitting}>
                Send Instructions
              </Button>
            </fieldset>
          </Form>
        )}
      />
      or <Link to="/login">Login</Link> if you remember your password!
    </RedirectIfAuthenticated>
  )
}
export default connect<{}, DispatchProps, OwnProps>(
  null,
  (dispatch: ThunkDispatch) => ({
    forgotPassword: (data: IForgotPasswordCredentials) =>
      dispatch(forgotPassword(data)),
  })
)(ForgotPassword)
