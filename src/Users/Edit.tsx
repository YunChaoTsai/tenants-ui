import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import {
  Formik,
  FormikProps,
  FormikActions,
  Form,
  Field,
  FieldProps,
  ErrorMessage,
} from "formik"
import * as Validator from "yup"
import Button from "@tourepedia/button"

import { InputField } from "./../Shared/InputField"
import { withXHR, XHRProps } from "./../xhr"
import { UserDataProvider } from "./Item"

const newUserSchema = Validator.object().shape({
  name: Validator.string()
    .required("Name is required")
    .min(4, "Minimum 4 characters required")
    .max(199, "Maximum 199 characters allowed"),
})

interface EditUserProps
  extends RouteComponentProps<{ userId: string }>,
    XHRProps {}

export function EditUser({ xhr, navigate, userId }: EditUserProps) {
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
        const { id, name } = user
        const initialValues = {
          name: name,
        }
        type UserCredentials = typeof initialValues
        return (
          <Fragment>
            <Helmet>
              <title>Edit User</title>
            </Helmet>
            <Formik
              initialValues={initialValues}
              validationSchema={newUserSchema}
              onSubmit={(
                values: UserCredentials,
                actions: FormikActions<UserCredentials>
              ) => {
                actions.setStatus()
                return xhr
                  .patch(`/users/${userId}`, values)
                  .then(({ data }) => {
                    const { user } = data
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
              }: FormikProps<UserCredentials>) => (
                <Form noValidate>
                  {status ? <div>{status}</div> : null}
                  <InputField
                    label="Name"
                    name="name"
                    placeholder="Manager"
                    required
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    Submit
                  </Button>
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

export default withXHR<EditUserProps>(EditUser)
