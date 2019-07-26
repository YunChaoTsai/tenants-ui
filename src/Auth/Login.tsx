import React, { useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import { Button } from "@tourepedia/ui"
import Helmet from "react-helmet-async"
import { Formik, FormikActions, FormikProps, Form } from "formik"
import * as Validator from "yup"

import { RedirectIfAuthenticated } from "./User"
import { ThunkAction } from "./../types"
import { actions, IUser } from "./store"
import { getUserAction } from "./User"
import { searchToQuery, useThunkDispatch } from "./../utils"
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
    async login(data: ILoginCredentials): Promise<IAuthToken> {
      return xhr
        .post("/login", data)
        .then(({ data }: { data: IAuthToken }) => data)
    },
    async refresh(): Promise<IAuthToken> {
      return xhr
        .patch("/refresh")
        .then(({ data }: { data: IAuthToken }) => data)
    },
  }
}
export const loginAction = (
  data: ILoginCredentials
): ThunkAction<Promise<IUser>> => async (dispatch, _, { xhr }) => {
  actions.login.request()
  return XHR(xhr)
    .login(data)
    .then(() => {
      return dispatch(getUserAction())
    })
    .catch(error => {
      actions.login.failure(error)
      return Promise.reject(error)
    })
}

interface LoginProps extends RouteComponentProps {}

function useLogin() {
  const dispatch = useThunkDispatch()
  return useCallback((data: ILoginCredentials) => dispatch(loginAction(data)), [
    dispatch,
  ])
}

export default function Login({ location }: LoginProps) {
  const query = searchToQuery(location && location.search)
  const next = query["next"]
  initialValues.email = query["email"] || ""
  const login = useLogin()
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
                    autoFocus={!initialValues.email}
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
                    autoFocus={!!initialValues.email}
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
