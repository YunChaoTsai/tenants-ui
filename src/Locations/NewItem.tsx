import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, Form, FormikProps, FormikActions } from "formik"
import Button from "@tourepedia/button"
import Helmet from "react-helmet-async"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"

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
        <title>New Meal Plan</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        onSubmit={(
          values: NewItemCredentials,
          actions: FormikActions<NewItemCredentials>
        ) => {
          actions.setStatus()
          return xhr
            .post("/locations", values)
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
            <InputField label="City" name="city" placeholder="Jaipur" />
            <InputField label="State" name="state" placeholder="Rajasthan" />
            <InputField
              label="Country"
              name="country"
              placeholder="India"
              required
            />
            <InputField
              label="Country Short Name"
              name="country_short_name"
              placeholder="IN"
            />
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>{" "}
            <Link to="..">Cancel</Link>
          </Form>
        )}
      />
    </Fragment>
  )
}

export default withXHR<NewItemProps>(NewItem)
