import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import { Button } from "@tourepedia/ui"
import Helmet from "react-helmet-async"
import { Formik, Form } from "formik"
import * as Validator from "yup"

import { RedirectIfAuthenticated } from "./User"
import { searchToQuery } from "./../utils"
import { InputField } from "./../Shared/InputField"
import { withXHR, XHRProps } from "../xhr"

// schemas
export interface IInvitedSignupCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
  invite_token: string
}
export interface IAuthToken {
  access_token: string
  expires_in: number
}
export const loginCredentialsSchema = Validator.object().shape({
  name: Validator.string()
    .required("Email field is required")
    .max(191, "Max 191 Characters allowed"),
  password: Validator.string().required("Password field is required"),
  password_confirmation: Validator.string().required(
    "Password Confirmation field is required"
  ),
})
const initialValues: IInvitedSignupCredentials = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  invite_token: "",
}

// actions
function XHR(xhr: AxiosInstance) {
  return {
    async signup(data: IInvitedSignupCredentials): Promise<any> {
      return xhr
        .patch("/invited-users", data)
        .then(({ data }: { data: any }) => data)
    },
  }
}

interface InviteSignupProps extends RouteComponentProps, XHRProps {}

const InvitedSignup = withXHR(function InvitedSignup({
  location,
  xhr,
  navigate,
}: InviteSignupProps) {
  const query = searchToQuery(location && location.search)
  const invite_token = query["ref"] || ""
  const email = query["email"] || ""
  const name = query["name"] || ""
  initialValues.invite_token = invite_token
  initialValues.email = email
  initialValues.name = name
  return (
    <RedirectIfAuthenticated>
      <Helmet>
        <title>Invited on TAD</title>
      </Helmet>
      <div>
        <div className="text-center">
          <Link to="/">
            <img
              src={process.env.PUBLIC_URL + "/logo.png"}
              className="inline-block mt-4 w-20 rounded-full shadow"
            />
          </Link>
        </div>
        <h1 className="text-center my-4">Complete Signup for TAD</h1>
        <div className="max-w-sm mx-auto">
          <Formik
            initialValues={initialValues}
            onSubmit={(values, actions) => {
              actions.setStatus()
              XHR(xhr)
                .signup(values)
                .then(data => {
                  alert(
                    data.message ||
                      "Registered Successfully. You can now login."
                  )
                  navigate && navigate(`../login?email=${values.email}`)
                })
                .catch(error => {
                  actions.setStatus(error.message)
                  actions.setSubmitting(false)
                })
            }}
            validationSchema={loginCredentialsSchema}
            render={({ isSubmitting, status, values }) => (
              <Form noValidate>
                <fieldset>
                  {status ? (
                    <p className="text-red-700" role="alert">
                      {status}
                    </p>
                  ) : null}
                  <InputField
                    label="Name"
                    name="name"
                    autoFocus
                    placeholder="John Ana"
                    autoComplete="full-name"
                    required
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="username@domain.com"
                    autoComplete="username email"
                    readOnly
                    required
                  />
                  <InputField
                    label="Password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    required
                  />
                  <InputField
                    label="Retype Password"
                    type="password"
                    name="password_confirmation"
                    autoComplete="new-password"
                    required
                  />
                  <input
                    hidden
                    type="hidden"
                    name="invite_token"
                    value={values.invite_token}
                  />
                  <footer>
                    <Button
                      primary
                      tabIndex={3}
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      Complete Signup
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
})

export default InvitedSignup
