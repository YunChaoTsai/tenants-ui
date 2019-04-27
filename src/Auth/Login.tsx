import React, { useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import Button from "@tourepedia/button"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { Formik, FormikActions, FormikProps, Form, ErrorMessage } from "formik"
import * as Validator from "yup"

import { RedirectIfAuthenticated } from "./User"
import { ThunkAction, ThunkDispatch } from "./../types"
import { actions, IUser } from "./store"
import { getUser } from "./User"
import { searchToQuery } from "./../utils"
import { InputField } from "./../Shared/InputField"

// schemas
export interface ILoginCredentials {
  email: string
  password: string
}
export interface IAuthToken {
  access_token: string
  expires_in: number
}
export const loginCredentialsSchema = Validator.object().shape({
  email: Validator.string()
    .email("Invalid email address")
    .required("Email field is required"),
  password: Validator.string().required("Password field is required"),
})
const initialValues: ILoginCredentials = {
  email: "",
  password: "",
}

// actions
function XHR(xhr: AxiosInstance) {
  return {
    login(data: ILoginCredentials): Promise<IAuthToken> {
      return xhr
        .post("/login", data)
        .then(({ data }: { data: IAuthToken }) => data)
    },
    refresh(): Promise<IAuthToken> {
      return xhr
        .patch("/refresh")
        .then(({ data }: { data: IAuthToken }) => data)
    },
  }
}
export const login = (data: ILoginCredentials): ThunkAction<Promise<IUser>> => (
  dispatch,
  getState,
  { xhr }
) => {
  actions.login.request()
  return XHR(xhr)
    .login(data)
    .then(() => {
      return dispatch(getUser())
    })
    .catch(error => {
      actions.login.failure(error)
      return Promise.reject(error)
    })
}

// component
interface OwnProps extends RouteComponentProps {}
interface DispatchProps {
  login: (data: ILoginCredentials) => Promise<IUser>
}
interface LoginProps extends OwnProps, DispatchProps {}
function Login({ login, navigate, location }: LoginProps) {
  const query = searchToQuery(location && location.search)
  const next = query["next"]
  return (
    <RedirectIfAuthenticated to={next}>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <h2>Login to Tourepdia Dashboard</h2>
      <Formik
        initialValues={initialValues}
        onSubmit={(
          values: ILoginCredentials,
          actions: FormikActions<ILoginCredentials>
        ) => {
          actions.setStatus()
          return login(values).catch(error => {
            actions.setStatus(error.message)
            actions.setSubmitting(false)
          })
        }}
        validationSchema={loginCredentialsSchema}
        render={({
          errors,
          isSubmitting,
          touched,
          isValid,
          status,
        }: FormikProps<ILoginCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <fieldset>
              <InputField
                label="Email"
                name="email"
                type="email"
                autoFocus
                id="email"
                placeholder="username@domain.com"
                autoComplete="username email"
                required
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                id="password"
                required
                autoComplete="current-password"
              />
              <Button type="submit" disabled={isSubmitting}>
                Login
              </Button>
            </fieldset>
          </Form>
        )}
      />
      <Link to="/forgot-password">Forgot Password ?</Link>
    </RedirectIfAuthenticated>
  )
}
export default connect<{}, DispatchProps, OwnProps>(
  null,
  (dispatch: ThunkDispatch) => ({
    login: (data: ILoginCredentials) => dispatch(login(data)),
  })
)(Login)
