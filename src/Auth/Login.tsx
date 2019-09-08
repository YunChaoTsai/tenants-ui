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
import config from "../config"
import { ReactComponent as DashboardImage } from "./undraw_dashboard_nklg.svg"

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
      <div
        className="min-h-screen flex"
        style={{ marginLeft: "-15px", marginRight: "-15px" }}
      >
        <div className="md:w-1/2 hidden md:block self-center">
          <div className="px-12 py-10">
            <DashboardImage className="max-w-full h-auto" />
          </div>
        </div>
        <div className="bg-white w-full md:w-1/2 py-8">
          <div className="mx-auto" style={{ maxWidth: "250px" }}>
            <div className="flex items-center">
              <img
                src={config.publicUrl + "/logo.png"}
                className="inline-block w-12 rounded-full mr-4"
              />
              <h1 className="text-2xl m-0">Tourepedia</h1>
            </div>
            <h2 className="mt-32 mb-12 text-2xl">Login to Dashboard</h2>
            <div>
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
                      className="mb-10"
                    />
                    <InputField
                      label="Password"
                      name="password"
                      type="password"
                      id="password"
                      required
                      autoComplete="current-password"
                      autoFocus={!!initialValues.email}
                      tabIndex={2}
                      className="mb-10"
                    />
                    <footer>
                      <Button
                        tabIndex={3}
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4"
                      >
                        Login
                      </Button>
                    </footer>
                  </Form>
                )}
              />
            </div>
            <div className="mt-12 text-gray-600">
              Forgot Password ?{" "}
              <Link to="/forgot-password">Click here to reset.</Link>
            </div>
          </div>
        </div>
      </div>
    </RedirectIfAuthenticated>
  )
}
