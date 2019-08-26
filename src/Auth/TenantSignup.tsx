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
import config from "../config"

// schemas
export interface ITenantSignupCredentials {
  company_name: string
  name: string
  email: string
  password: string
  password_confirmation: string
  invite_token: string
  address_email: string
  email_verified_url: string
}
export interface IAuthToken {
  access_token: string
  expires_in: number
}
export const tenantSignupCredentialsSchema = Validator.object().shape({
  company_name: Validator.string()
    .required(" field is required")
    .max(191, "Max 191 Characters allowed"),
  name: Validator.string()
    .required("Name field is required")
    .max(191, "Max 191 Characters allowed"),
  email: Validator.string()
    .email("Please provide a valid email address")
    .required("Email address is required")
    .max(191, "Max 191 Characters allowed"),
  password: Validator.string().required("Password field is required"),
  password_confirmation: Validator.string().required(
    "Password Confirmation field is required"
  ),
})
const initialValues: ITenantSignupCredentials = {
  company_name: "",
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  invite_token: "",
  address_email: "",
  email_verified_url: "",
}

// actions
function XHR(xhr: AxiosInstance) {
  return {
    async signup(data: ITenantSignupCredentials): Promise<any> {
      return xhr
        .post("/tenants/signup", data)
        .then(({ data }: { data: any }) => data)
    },
  }
}

interface InviteSignupProps extends RouteComponentProps, XHRProps {}

const TenantSignup = withXHR(function TenantSignup({
  location,
  xhr,
  navigate,
}: InviteSignupProps) {
  const query = searchToQuery(location && location.search)
  const invite_token = query["ref"] || ""
  const email = query["email"] || ""
  const name = query["name"] || ""
  const tenantName = query["tenant-name"] || ""
  initialValues.company_name = tenantName
  initialValues.invite_token = invite_token
  initialValues.name = name
  initialValues.email = email
  initialValues.address_email = email
  initialValues.email_verified_url = location
    ? `${location.origin}/email-verified`
    : ""
  return (
    <RedirectIfAuthenticated>
      <Helmet>
        <title>Invited on TAD</title>
      </Helmet>
      <div>
        <h1 className="flex justify-center items-center mt-4">
          <Link to="/">
            <img
              src={config.publicUrl + "/logo.png"}
              className="inline-blockw-20 w-8 rounded-full shadow"
            />
          </Link>
          <div className="px-4 text-gray-400">+</div>
          <div>{tenantName}</div>
        </h1>
        <p className="text-center max-w-sm mx-auto text-sm text-gray-700">
          Please provide following details to complete your registraion for
          Tourepedia Admin Dashboard
        </p>
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
                  if (error.formikErrors) {
                    actions.setErrors(error.formikErrors)
                  }
                  actions.setSubmitting(false)
                })
            }}
            validationSchema={tenantSignupCredentialsSchema}
            render={({ isSubmitting, status, values }) => (
              <Form noValidate>
                <fieldset>
                  {status ? (
                    <p className="text-red-700" role="alert">
                      {status}
                    </p>
                  ) : null}
                  <InputField
                    label="Company Name"
                    name="company_name"
                    placeholder="Tourepedia Holidays"
                    required
                  />
                  <InputField
                    label="Your Name"
                    name="name"
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
                  <input
                    hidden
                    type="hidden"
                    name="address_email"
                    value={values.address_email}
                  />
                  <footer>
                    <Button
                      primary
                      tabIndex={3}
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      Complete Registration
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

export default TenantSignup
