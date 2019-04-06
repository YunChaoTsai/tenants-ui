import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  Form,
  FormikProps,
  FormikActions,
  Field,
  FieldProps,
  ErrorMessage,
} from "formik"
import Button from "@tourepedia/button"
import Helmet from "react-helmet-async"
import * as Validator from "yup"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"
import { SelectCountries, SelectStates, SelectCities } from "./List"
import { ICountry, ICountryState, ICity } from "./store"

const validationSchema = Validator.object().shape({
  country: Validator.object().required("Country field is required"),
  country_short_name: Validator.string().required(
    "Short Name for country is required"
  ),
  latitue: Validator.string(),
  longitude: Validator.string(),
})

interface NewItemCredentials {
  country?: ICountry
  country_short_name: string
  state?: ICountryState
  city?: ICity
  latitude?: string
  longitude?: string
}
const initialValues = {
  city: undefined,
  state: undefined,
  country: undefined,
  country_short_name: "",
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
          const {
            country,
            state,
            city,
            country_short_name,
            latitude,
            longitude,
          } = values
          return xhr
            .post("/locations", {
              country: country ? country.name : undefined,
              country_short_name,
              state: state ? state.name : undefined,
              city: city ? city.name : undefined,
              latitude,
              longitude,
            })
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
        render={({
          isSubmitting,
          status,
          values,
          setFieldValue,
        }: FormikProps<NewItemCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <Field
              name="country"
              render={({ field }: FieldProps<NewItemCredentials>) => (
                <div>
                  <SelectCountries
                    multiple={false}
                    label="Country"
                    name={field.name}
                    value={field.value}
                    onChange={value => {
                      setFieldValue(field.name, value)
                      setFieldValue(
                        "country_short_name",
                        value ? value.short_name : null
                      )
                    }}
                    placeholder="Type to search.. (e.g. India)"
                  />
                  <ErrorMessage name={field.name} />
                </div>
              )}
            />
            <Field
              name="country"
              render={({ field }: FieldProps<NewItemCredentials>) => (
                <InputField
                  label="Country Short Name"
                  name="country_short_name"
                  placeholder="IN"
                  readOnly={!!values.country}
                />
              )}
            />
            <Field
              name="state"
              render={({ field }: FieldProps<NewItemCredentials>) => (
                <div>
                  <SelectStates
                    multiple={false}
                    label="State"
                    name={field.name}
                    value={field.value}
                    onChange={value => setFieldValue(field.name, value)}
                    placeholder="Type to search.. (e.g. Rajasthan)"
                    creatable
                  />
                  <ErrorMessage name={field.name} />
                </div>
              )}
            />
            <Field
              name="city"
              render={({ field }: FieldProps<NewItemCredentials>) => (
                <div>
                  <SelectCities
                    multiple={false}
                    label="City"
                    name={field.name}
                    value={field.value}
                    onChange={value => setFieldValue(field.name, value)}
                    placeholder="Type to search.. (e.g. Jaipur)"
                    creatable
                  />
                  <ErrorMessage name={field.name} />
                </div>
              )}
            />
            <InputField
              name="latitude"
              label="Latitude"
              placeholder="27° 2' 9.6252'' N"
              type="string"
            />
            <InputField
              name="longitude"
              label="Longitude"
              placeholder="88° 15' 45.6192'' E"
              type="string"
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
