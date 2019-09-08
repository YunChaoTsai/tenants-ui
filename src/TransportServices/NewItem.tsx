import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, FormikProps, FormikActions, Form, FieldArray } from "formik"
import { Button } from "@tourepedia/ui"
import * as Validator from "yup"

import { InputField, FormikFormGroup } from "./../Shared/InputField"
import {
  SelectTransportLocations,
  store as locationStore,
} from "./../TransportLocations"
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
  comments: Validator.string(),
})

interface NewServiceCredentials {
  via: locationStore.ITransportLocation[]
  is_sightseeing?: boolean
  distance: number
  comments?: string
}

const initialValues: NewServiceCredentials = {
  via: [undefined as any],
  is_sightseeing: false,
  distance: 0,
  comments: "",
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
        onSubmit={async (
          values: NewServiceCredentials,
          actions: FormikActions<NewServiceCredentials>
        ) => {
          actions.setStatus()
          const { via, is_sightseeing, ...otherData } = values
          return xhr
            .post("/transport-services", {
              ...otherData,
              via: via.map(location => location.name),
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
                              <SelectTransportLocations
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
                            <Button tertiary onClick={_ => remove(index)}>
                              &times; Remove
                            </Button>
                          ) : null}
                        </Col>
                      ))}
                    </Grid>
                    <Button onClick={_ => push(undefined)}>
                      + Add More Destinations
                    </Button>
                  </div>
                )}
              />
              <hr />
              <Grid>
                <Col>
                  <InputField
                    name="distance"
                    type="number"
                    label="Total distance for the transportation (in kms)"
                    placeholder="420"
                    required
                  />
                </Col>
                <Col>
                  <InputField
                    label="Any Comments"
                    name="comments"
                    type="text"
                  />
                </Col>
                <Col className="mt-4">
                  <InputField
                    name="is_sightseeing"
                    type="checkbox"
                    label="Includes sightseeing"
                  />
                </Col>
              </Grid>
              <footer>
                <Button type="submit" disabled={isSubmitting}>
                  Save Service
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
