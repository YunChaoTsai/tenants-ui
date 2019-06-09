import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, FormikProps, FormikActions, Form, FieldArray } from "formik"
import { Button } from "@tourepedia/ui"
import * as Validator from "yup"

import { InputField, FormikFormGroup } from "./../Shared/InputField"
import { SelectLocations, store as locationStore } from "./../Locations"
import { withXHR, XHRProps } from "./../xhr"
import Helmet from "react-helmet-async"
import { Grid, Col } from "../Shared/Layout"

const validationSchema = Validator.object().shape({
  via: Validator.array()
    .of(Validator.object().required("Destination is required"))
    .min(1, "Atleast one locations required")
    .required("Via field is required"),
  is_sightseeing: Validator.boolean(),
  distance: Validator.number()
    .positive("Distance should be a positive number")
    .integer("Distance should be an integer")
    .required("Distance field is required"),
})

interface NewServiceCredentials {
  via: locationStore.ILocation[]
  is_sightseeing?: boolean
  distance: number
}

const initialValues: NewServiceCredentials = {
  via: [undefined as any],
  is_sightseeing: false,
  distance: 0,
}

interface NewServicesProps extends RouteComponentProps, XHRProps {}
function NewServices({ xhr, navigate }: NewServicesProps) {
  return (
    <Fragment>
      <Helmet>
        <title>Add New Transport Service</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: NewServiceCredentials,
          actions: FormikActions<NewServiceCredentials>
        ) => {
          actions.setStatus()
          const { distance, via, is_sightseeing } = values
          return xhr
            .post("/transport-services", {
              distance,
              via: via.map(location => location.id),
              is_sightseeing: +!!is_sightseeing,
            })
            .then(() => {
              navigate && navigate("..")
              actions.setSubmitting(false)
            })
            .catch(error => {
              actions.setStatus(error.message)
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
              actions.setSubmitting(false)
              return Promise.reject(error)
            })
        }}
        render={({
          isSubmitting,
          values,
          status,
          setFieldValue,
        }: FormikProps<NewServiceCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <fieldset>
              <legend>Add New Transport Service</legend>
              <FieldArray
                name="via"
                render={({ name, remove, push }) => (
                  <div className="form-group">
                    <p>Add destinations for the transportation</p>
                    <Grid>
                      {values.via.map((_, index, locations) => (
                        <Col
                          md={3}
                          key={index}
                          style={{ marginBottom: "10px" }}
                        >
                          <FormikFormGroup
                            name={`${name}.${index}`}
                            render={({ field }) => (
                              <SelectLocations
                                {...field}
                                label="Destination"
                                multiple={false}
                                onChange={(value, name) =>
                                  setFieldValue(name, value)
                                }
                              />
                            )}
                          />
                          {locations.length > 1 ? (
                            <Button onClick={_ => remove(index)}>
                              &times; Remove
                            </Button>
                          ) : null}
                        </Col>
                      ))}
                    </Grid>
                    <hr />
                    <Button onClick={_ => push(undefined)}>
                      + Add More Destinations
                    </Button>
                  </div>
                )}
              />
              <InputField
                name="distance"
                type="number"
                label="Total distance for the transportation (in kms)"
                placeholder="420"
                required
              />
              <InputField
                name="is_sightseeing"
                type="checkbox"
                label="Includes sightseeing"
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
}

export default withXHR(NewServices)
