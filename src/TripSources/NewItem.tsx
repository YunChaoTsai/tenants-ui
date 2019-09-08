import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, Form, FormikProps, FormikActions } from "formik"
import { Button } from "@tourepedia/ui"
import Helmet from "react-helmet-async"
import * as Validator from "yup"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"
import { Grid, Col } from "../Shared/Layout"

const validationSchema = Validator.object().shape({
  name: Validator.string().required("Name field is required"),
  short_name: Validator.string().required("Short name field is required"),
})
const initialValues = {
  name: "",
  short_name: "",
}
type NewItemCredentials = typeof initialValues

interface NewItemProps extends RouteComponentProps, XHRProps {}

function NewItem({ xhr, navigate }: NewItemProps) {
  return (
    <Fragment>
      <Helmet>
        <title>New Trip Source</title>
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
            .post("/trip-sources", values)
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
              <legend>Add New Source of Trips</legend>
              <Grid>
                <Col sm="auto">
                  <InputField
                    label="Name"
                    name="name"
                    placeholder="Travel Triangle"
                    required
                  />
                </Col>
                <Col sm="auto">
                  <InputField
                    label="Short name"
                    name="short_name"
                    placeholder="TT"
                    required
                  />
                </Col>
              </Grid>
              <footer>
                <Button type="submit" disabled={isSubmitting}>
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
}

export default withXHR<NewItemProps>(NewItem)
