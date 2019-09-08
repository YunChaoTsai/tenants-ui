import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  Form,
  FormikProps,
  FormikActions,
  Field,
  FieldProps,
} from "formik"
import { Button } from "@tourepedia/ui"
import Helmet from "react-helmet-async"
import * as Validator from "yup"

import { withXHR, XHRProps } from "./../xhr"
import { InputField, FormikFormGroup } from "./../Shared/InputField"
import { SelectCountries, SelectStates, SelectCities } from "./List"
import { ICountry, ICountryState, ICity } from "./store"
import { Grid, Col } from "../Shared/Layout"

const validationSchema = Validator.object().shape({
  country: Validator.object().required("Country field is required"),
  latitue: Validator.string(),
  longitude: Validator.string(),
})

interface NewItemCredentials {
  country?: ICountry
  state?: ICountryState
  city?: ICity
  latitude?: string
  longitude?: string
}
const initialValues: NewItemCredentials = {
  city: undefined,
  state: undefined,
  country: undefined,
  latitude: "",
  longitude: "",
}

interface NewItemProps extends RouteComponentProps, XHRProps {}

function NewItem({ xhr, navigate }: NewItemProps) {
  return (
    <Fragment>
      <Helmet>
        <title>New Location</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: NewItemCredentials,
          actions: FormikActions<NewItemCredentials>
        ) => {
          actions.setStatus()
          const { country, state, city, latitude, longitude } = values
          xhr
            .post("/locations", {
              country: country ? country.id : undefined,
              state: state ? state.name : undefined,
              city: city ? city.name : undefined,
              latitude,
              longitude,
            })
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
        render={({
          isSubmitting,
          status,
          values,
          setFieldValue,
        }: FormikProps<NewItemCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <fieldset>
              <legend>Add New Location</legend>
              <Grid>
                <Col sm="auto">
                  <FormikFormGroup
                    name="city"
                    render={({ field }: FieldProps<NewItemCredentials>) => (
                      <SelectCities
                        {...field}
                        multiple={false}
                        label="City"
                        onChange={(value, name) => setFieldValue(name, value)}
                        placeholder="Type to search.. (e.g. Jaipur)"
                        creatable
                      />
                    )}
                  />
                </Col>
                <Col sm="auto">
                  <FormikFormGroup
                    name="state"
                    render={({ field }: FieldProps<NewItemCredentials>) => (
                      <SelectStates
                        {...field}
                        multiple={false}
                        label="State"
                        onChange={(value, name) => setFieldValue(name, value)}
                        placeholder="Type to search.. (e.g. Rajasthan)"
                        creatable
                      />
                    )}
                  />
                </Col>
                <Col sm="auto">
                  <FormikFormGroup
                    name="country"
                    render={({ field }: FieldProps<NewItemCredentials>) => (
                      <SelectCountries
                        {...field}
                        multiple={false}
                        label="Country"
                        placeholder="Type to search.. (e.g. India)"
                        onChange={(value, name) => {
                          setFieldValue(name, value)
                        }}
                      />
                    )}
                  />
                </Col>
                <Col sm="auto">
                  <InputField
                    name="latitude"
                    label="Latitude"
                    placeholder="27° 2' 9.6252'' N"
                  />
                </Col>
                <Col sm="auto">
                  <InputField
                    name="longitude"
                    label="Longitude"
                    placeholder="88° 15' 45.6192'' E"
                  />
                </Col>
              </Grid>
              <footer>
                <Button type="submit" disabled={isSubmitting}>
                  Save Location
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
