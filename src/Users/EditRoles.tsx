import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { Formik, FormikProps, FormikActions, Form, FieldArray } from "formik"
import * as Validator from "yup"
import Button from "@tourepedia/button"

import { withXHR, XHRProps } from "./../xhr"
import { UserDataProvider } from "./Item"
import { SelectRoles } from "./../Roles"
import { FormikFormGroup } from "../Shared/InputField"

interface EditRolesProps
  extends RouteComponentProps<{ userId: string }>,
    XHRProps {}

export function EditRoles({ xhr, navigate, userId }: EditRolesProps) {
  return (
    <UserDataProvider
      userId={userId}
      render={({ isFetching, user }) => {
        if (!userId) {
          navigate && navigate("/users")
          return null
        }
        if (isFetching) return "Loading..."
        if (!user) {
          navigate && navigate("/users")
          return null
        }
        const { id, name, roles = [] } = user
        const initialValues = {
          roles: roles,
        }
        type EditRolesCredentials = typeof initialValues
        return (
          <Fragment>
            <Helmet>
              <title>Edit {name}'s Roles</title>
            </Helmet>
            <Formik
              initialValues={initialValues}
              onSubmit={(
                values: EditRolesCredentials,
                actions: FormikActions<EditRolesCredentials>
              ) => {
                actions.setStatus()
                return xhr
                  .post(`/users/${userId}/roles`, {
                    roles: values.roles.map(({ name }) => ({
                      name,
                    })),
                  })
                  .then(_ => {
                    navigate && navigate(`../../${user.id}`)
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
              }: FormikProps<EditRolesCredentials>) => (
                <Form noValidate>
                  <fieldset>
                    <legend>Editing {name}'s roles</legend>
                    {status ? <div>{status}</div> : null}
                    <FormikFormGroup
                      name="roles"
                      render={({ field }) => (
                        <SelectRoles
                          {...field}
                          label="Select Role(s)"
                          onChange={(roles, name) => setFieldValue(name, roles)}
                        />
                      )}
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

export default withXHR<EditRolesProps>(EditRoles)
