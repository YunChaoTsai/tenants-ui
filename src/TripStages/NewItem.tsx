import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, Form, FormikProps, FormikActions } from "formik"
import Button from "@tourepedia/button"
import Helmet from "react-helmet-async"
import * as Validator from "yup"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"

const validationSchema = Validator.object().shape({
  name: Validator.string().required("Name field is required"),
  description: Validator.string().required("Description field is required"),
})
const initialValues = {
  name: "",
  description: "",
}
type NewItemCredentials = typeof initialValues

interface NewItemProps extends RouteComponentProps, XHRProps {}

function NewItem({ xhr, navigate }: NewItemProps) {
  return (
    <Fragment>
      <Helmet>
        <title>New Trip Stage</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: NewItemCredentials,
          actions: FormikActions<NewItemCredentials>
        ) => {
          actions.setStatus()
          return xhr
            .post("/trip-stages", values)
            .then(({ data }) => {
              navigate && navigate(`..`)
              actions.setSubmitting(false)
            })
            .catch(error => {
              actions.setSubmitting(false)
              actions.setStatus(error.message)
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
            })
        }}
        render={({ isSubmitting, status }: FormikProps<NewItemCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <fieldset>
              <legend>Add new Trip Stage</legend>
              <InputField
                label="Name"
                name="name"
                placeholder="Converted"
                required
              />
              <InputField
                label="Description"
                name="description"
                placeholder="Trip Converted"
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
}

export default withXHR<NewItemProps>(NewItem)
