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
  capacity: Validator.number()
    .positive("Capacity should be a positive integer")
    .integer("Capacity should be a positive integer")
    .required("Capacity field is required"),
})
const initialValues = {
  name: "",
  capacity: 4,
}
type NewItemCredentials = typeof initialValues

interface NewItemProps extends RouteComponentProps, XHRProps {}

function NewItem({ xhr, navigate }: NewItemProps) {
  return (
    <Fragment>
      <Helmet>
        <title>New Cab Type</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: NewItemCredentials,
          actions: FormikActions<NewItemCredentials>
        ) => {
          actions.setStatus()
          xhr
            .post("/cab-types", values)
            .then(() => {
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
              <legend>Add Cab Type</legend>
              <Grid>
                <Col sm="auto">
                  <InputField
                    label="Name"
                    name="name"
                    placeholder="Medium"
                    required
                  />
                </Col>
                <Col sm="auto">
                  <InputField
                    label="Capacity"
                    name="capacity"
                    required
                    type="number"
                    min={1}
                  />
                </Col>
              </Grid>
              <footer>
                <Button type="submit" disabled={isSubmitting}>
                  Save Cab Type
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
