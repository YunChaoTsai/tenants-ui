import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, FormikProps, FormikActions, Form, ErrorMessage } from "formik"
import Helmet from "react-helmet-async"
import * as Validator from "yup"
import Button from "@tourepedia/button"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"
import { RoleDataProvider } from "./Item"

const newRoleSchema = Validator.object().shape({
  name: Validator.string()
    .required("Name is required")
    .min(4, "Minimum 4 characters required")
    .max(199, "Maximum 199 characters allowed"),
})
const initialValues = {
  name: "",
}

interface EditRoleProps
  extends RouteComponentProps<{ roleId: string }>,
    XHRProps {}

export function EditRole({ xhr, navigate, roleId }: EditRoleProps) {
  return (
    <RoleDataProvider
      roleId={roleId}
      render={({ isFetching, role }) => {
        if (!roleId) {
          navigate && navigate("/roles")
          return null
        }
        if (isFetching) return "Loading..."
        if (!role) {
          navigate && navigate("/roles")
          return null
        }
        const { id, name } = role
        const initialValues = {
          name,
        }
        type RoleCredentials = typeof initialValues
        return (
          <Fragment>
            <Helmet>
              <title>Editing {name} Role</title>
            </Helmet>
            <Formik
              initialValues={initialValues}
              validationSchema={newRoleSchema}
              onSubmit={(
                values: RoleCredentials,
                actions: FormikActions<RoleCredentials>
              ) => {
                actions.setStatus()
                return xhr
                  .put(`/roles/${id}`, values)
                  .then(({ data }) => {
                    const { data: role } = data
                    navigate && navigate(`../../${role.id}`)
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
              render={({
                isSubmitting,
                status,
              }: FormikProps<RoleCredentials>) => (
                <Form noValidate>
                  {status ? <div>{status}</div> : null}
                  <fieldset>
                    <legend>Edit Role</legend>
                    <InputField
                      label="Name"
                      name="name"
                      placeholder="Manager"
                      required
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      Save
                    </Button>
                  </fieldset>
                  <Link to="..">Cancel</Link>
                </Form>
              )}
            />
          </Fragment>
        )
      }}
    />
  )
}

export default withXHR<EditRoleProps>(EditRole)
