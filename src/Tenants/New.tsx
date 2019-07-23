import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, FormikProps, FormikActions, Form } from "formik"
import * as Validator from "yup"
import { Button } from "@tourepedia/ui"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"
import { Grid, Col } from "../Shared/Layout"

export interface NewTenantCredentials {
  name: string
  description?: string
  admin_name: string
  admin_email: string
  send_invite: boolean
}
const newTenantSchema = Validator.object().shape({
  name: Validator.string()
    .required("Name for the tenant is required.")
    .max(299, "Maximum 299 characters allowed"),
  description: Validator.string().max(299, "Maximum 299 characters allowed"),
  admin_name: Validator.string().required("Admin name is required"),
  admin_email: Validator.string()
    .email("Invalid email address")
    .required("Admin email is required"),
  send_invite: Validator.boolean(),
})
const initialValues = {
  name: "",
  description: "",
  admin_name: "",
  admin_email: "",
  send_invite: false,
}

interface NewTenantProps extends RouteComponentProps, XHRProps {}

export function NewTenant({ xhr, navigate }: NewTenantProps) {
  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={newTenantSchema}
        onSubmit={async (
          values: NewTenantCredentials,
          actions: FormikActions<NewTenantCredentials>
        ) => {
          actions.setStatus()
          return xhr
            .post("/tenants", {
              ...values,
              send_invite: +(values.send_invite || false),
            })
            .then(({ data }) => {
              const tenant = data.data
              navigate && navigate(`../${tenant.id}`)
            })
            .catch(error => {
              actions.setStatus(error.message)
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
            })
            .then(() => {
              actions.setSubmitting(false)
            })
        }}
        render={({
          isSubmitting,
          status,
        }: FormikProps<NewTenantCredentials>) => (
          <Form noValidate>
            {status ? <p className="text-red-700 my-2">{status}</p> : null}
            <fieldset>
              <legend>Add New Tenant</legend>
              <Grid>
                <Col>
                  <InputField
                    label="Name"
                    name="name"
                    required
                    placeholder="Tourepedia Holidays"
                  />
                </Col>
                <Col>
                  <InputField
                    label="Description"
                    name="description"
                    placeholder="Tourepedia provides best tourisum services across India"
                  />
                </Col>
                <Col>
                  <InputField
                    label="Admin Name"
                    name="admin_name"
                    placeholder="Admin Name"
                    required
                  />
                </Col>
                <Col>
                  <InputField
                    label="Admin Email"
                    name="admin_email"
                    type="email"
                    placeholder="admin@domain.com"
                    required
                  />
                </Col>
              </Grid>
              <InputField
                label="Send Invitation email also"
                name="send_invite"
                type="checkbox"
              />
              <footer>
                <Button primary type="submit" disabled={isSubmitting}>
                  Submit
                </Button>
                <Link to=".." className="btn">
                  Cancel
                </Link>
              </footer>
            </fieldset>
          </Form>
        )}
      />
    </div>
  )
}

export default withXHR<NewTenantProps>(NewTenant)
