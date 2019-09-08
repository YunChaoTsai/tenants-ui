import React, { Fragment, useEffect } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, FormikProps, FormikActions, Form } from "formik"
import Helmet from "react-helmet-async"
import * as Validator from "yup"
import { Button } from "@tourepedia/ui"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"
import { useRole } from "./Item"
import Spinner from "../Shared/Spinner"

const newRoleSchema = Validator.object().shape({
  name: Validator.string()
    .required("Name is required")
    .min(4, "Minimum 4 characters required")
    .max(199, "Maximum 199 characters allowed"),
})

interface EditRoleProps
  extends RouteComponentProps<{ roleId: string }>,
    XHRProps {}

export function EditRole({ xhr, navigate, roleId }: EditRoleProps) {
  const { role, isFetching } = useRole(roleId, true)
  if (!roleId) {
    navigate && navigate("/roles")
    return null
  }
  if (isFetching)
    return (
      <div className="text-center">
        <Spinner />
      </div>
    )
  if (!role) return null
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
          xhr
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
        render={({ isSubmitting, status }: FormikProps<RoleCredentials>) => (
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
              <footer>
                <Button type="submit" disabled={isSubmitting}>
                  Update Role
                </Button>
                <Link className="btn" to="..">
                  Cancel
                </Link>
              </footer>
            </fieldset>
          </Form>
        )}
      />
    </Fragment>
  )
}

export default withXHR<EditRoleProps>(EditRole)
