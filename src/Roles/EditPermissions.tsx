import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { Formik, FormikProps, FormikActions, Form } from "formik"
import Button from "@tourepedia/button"

import { withXHR, XHRProps } from "./../xhr"
import { RoleDataProvider } from "./Item"
import { SelectPermissions } from "./List"
import { FormikFormGroup } from "../Shared/InputField"

interface EditPermissionsProps
  extends RouteComponentProps<{ roleId: string }>,
    XHRProps {}

export function EditPermissions({
  xhr,
  navigate,
  roleId,
}: EditPermissionsProps) {
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
        const { name, permissions = [] } = role
        const initialValues = {
          permissions,
        }
        type EditPermissionsCredentials = typeof initialValues
        return (
          <Fragment>
            <Helmet>
              <title>Edit {name}'s permissions</title>
            </Helmet>
            <Formik
              initialValues={initialValues}
              onSubmit={(
                values: EditPermissionsCredentials,
                actions: FormikActions<EditPermissionsCredentials>
              ) => {
                actions.setStatus()
                return xhr
                  .post(`/roles/${roleId}/permissions`, {
                    permissions: values.permissions.map(({ name }) => ({
                      name,
                    })),
                  })
                  .then(_ => {
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
                values,
                setFieldValue,
              }: FormikProps<EditPermissionsCredentials>) => (
                <Form noValidate>
                  <fieldset>
                    <legend>Editing {name}'s permissions</legend>
                    {status ? <div>{status}</div> : null}
                    <FormikFormGroup
                      name="permissions"
                      render={({ field }) => (
                        <SelectPermissions
                          {...field}
                          label="Select permission(s)"
                          onChange={(value, name) => setFieldValue(name, value)}
                        />
                      )}
                    />
                    <footer>
                      <Button primary type="submit" disabled={isSubmitting}>
                        Save
                      </Button>
                      <Link to=".." className="btn">
                        Cancel
                      </Link>
                    </footer>
                  </fieldset>
                </Form>
              )}
            />
          </Fragment>
        )
      }}
    />
  )
}

export default withXHR<EditPermissionsProps>(EditPermissions)
