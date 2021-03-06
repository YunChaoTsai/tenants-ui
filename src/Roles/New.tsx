import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, FormikProps, FormikActions, Form } from "formik"
import * as Validator from "yup"
import { Button } from "@tourepedia/ui"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"

export interface NewRoleCredentials {
  name: string
}
const newRoleSchema = Validator.object().shape({
  name: Validator.string()
    .required("Name is required")
    .min(4, "Minimum 4 characters required")
    .max(199, "Maximum 199 characters allowed"),
})
const initialValues = {
  name: "",
}

interface NewRoleProps extends RouteComponentProps, XHRProps {}

export function NewRole({ xhr, navigate }: NewRoleProps) {
  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={newRoleSchema}
        onSubmit={(
          values: NewRoleCredentials,
          actions: FormikActions<NewRoleCredentials>
        ) => {
          actions.setStatus()
          return xhr
            .post("/roles", values)
            .then(({ data }) => {
              const { data: role } = data
              navigate && navigate(`../${role.id}`)
              actions.setSubmitting(false)
            })
            .catch(error => {
              actions.setStatus(error.message)
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
              actions.setSubmitting(false)
            })
        }}
        render={({ isSubmitting, status }: FormikProps<NewRoleCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <fieldset>
              <legend>Add New Role</legend>
              <InputField
                label="Name"
                name="name"
                required
                placeholder="Manager"
              />
              <footer>
                <Button type="submit" disabled={isSubmitting}>
                  Create Role
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

export default withXHR<NewRoleProps>(NewRole)
