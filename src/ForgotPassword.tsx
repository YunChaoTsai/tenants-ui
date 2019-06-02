import React from "react"
import { RouteComponentProps, Link, Location } from "@reach/router"
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
  reset_password_link: string
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
      <div className="text-center mt-16">
        <h1>Forgot Your Password?</h1>
        <p>
          No problem? Just enter your email address and we will send
          instructions to reset your password. <br />
          Or{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Login
          </Link>{" "}
          if you remember your password!
        </p>
      </div>
      <div className="max-w-sm mx-auto">
        <Formik
          initialValues={{
            email,
            reset_password_link: `${location &&
              location.origin}/reset-password`,
          }}
          validationSchema={forgotPasswordSchema}
          onSubmit={(
            values: IForgotPasswordCredentials,
            actions: FormikActions<IForgotPasswordCredentials>
          ) => {
            actions.setStatus()
            forgotPassword(values)
              .then(() => {
                alert(
                  `Please check your inbox for password reset instructions.`
                )
                actions.setSubmitting(false)
                navigate && navigate("/login")
              })
              .catch(error => {
                actions.setStatus(error.message)
                actions.setSubmitting(false)
              })
          }}
          render={({
            status,
            isSubmitting,
            values,
          }: FormikProps<IForgotPasswordCredentials>) => (
            <Form noValidate>
              <fieldset>
                {status ? <div className="error">{status}</div> : null}
                <InputField
                  name="email"
                  label="Email"
                  placeholder="username@domain.com"
                  autoComplete="username email"
                  required
                  autoFocus
                  type="email"
                  id="email"
                  tabIndex={1}
                />
                <input
                  type="hidden"
                  name="reset_password_link"
                  hidden
                  value={values.reset_password_link}
                />
                <footer>
                  <Button
                    primary
                    tabIndex={2}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Get Instructions
                  </Button>
                </footer>
              </fieldset>
            </Form>
          )}
        />
      </div>
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
