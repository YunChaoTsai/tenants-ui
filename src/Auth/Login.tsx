import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import { Button } from "@tourepedia/ui"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { Formik, FormikActions, FormikProps, Form } from "formik"
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
function Login({ login, location }: LoginProps) {
  const query = searchToQuery(location && location.search)
  const next = query["next"]
  return (
    <RedirectIfAuthenticated to={next}>
      <Helmet>
        <title>Sign in to TAD</title>
      </Helmet>
      <div className="min-h-screen">
        <div className="text-center">
          <img
            src={process.env.PUBLIC_URL + "/logo.png"}
            className="inline-block mt-16 w-20 rounded-full shadow"
          />
        </div>
        <h1 className="text-center my-4">Sign in to TAD</h1>
        <div className="max-w-sm mx-auto">
          <Formik
            initialValues={initialValues}
            onSubmit={(
              values: ILoginCredentials,
              actions: FormikActions<ILoginCredentials>
            ) => {
              actions.setStatus()
              login(values).catch(error => {
                actions.setStatus(error.message)
                actions.setSubmitting(false)
              })
            }}
            validationSchema={loginCredentialsSchema}
            render={({
              isSubmitting,
              status,
            }: FormikProps<ILoginCredentials>) => (
              <Form noValidate>
                <fieldset>
                  {status ? (
                    <p className="text-red-700" role="alert">
                      {status}
                    </p>
                  ) : null}
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    autoFocus
                    id="email"
                    placeholder="username@domain.com"
                    autoComplete="username email"
                    required
                    tabIndex={1}
                  />
                  <Link
                    to="/forgot-password"
                    className="float-right text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Forgot Password ?
                  </Link>
                  <InputField
                    label="Password"
                    name="password"
                    type="password"
                    id="password"
                    required
                    autoComplete="current-password"
                    tabIndex={2}
                  />
                  <footer>
                    <Button
                      primary
                      tabIndex={3}
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      Sign in
                    </Button>
                  </footer>
                </fieldset>
              </Form>
            )}
          />
        </div>
      </div>
    </RedirectIfAuthenticated>
  )
}
export default connect<{}, DispatchProps, OwnProps>(
  null,
  (dispatch: ThunkDispatch) => ({
    login: (data: ILoginCredentials) => dispatch(login(data)),
  })
)(Login)
