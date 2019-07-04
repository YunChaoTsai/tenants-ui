import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldArray,
  FieldProps,
} from "formik"
import { Button } from "@tourepedia/ui"
import * as Validator from "yup"
import moment from "moment"

import { InputField, FormikFormGroup } from "./../Shared/InputField"
import {
  SelectLocations,
  // SelectCountries,
  store as locationStore,
} from "./../Locations"
import { SelectTripSources, store as tripSourceStore } from "./../TripSources"
import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"
import DatePicker from "../Shared/DatePicker"
import { EmptyNumberValidator } from "../utils"

const validationSchema = Validator.object().shape({
  trip_id: Validator.string(),
  start_date: Validator.string().required("Start date is required"),
  no_of_nights: EmptyNumberValidator()
    .positive("Number of nights should be a positive integer")
    .integer("Number of nights should be a positive integer")
    .required("Number of nights is required"),
  destinations: Validator.array().min(
    1,
    "Please select atleast one destination"
  ),
  no_of_adults: EmptyNumberValidator()
    .positive("Number of adults should be a positive integer")
    .integer("Number of adults should be a positive integer")
    .required("Number of adults field is required"),
  children: Validator.array().of(
    Validator.object().shape({
      count: EmptyNumberValidator()
        .positive("Number of children should be positive integer")
        .integer("Number of children should be positive integer")
        .required("Number of children field is required"),
      age: EmptyNumberValidator()
        .positive("Child age should a positive number")
        .required("Child age is required"),
    })
  ),
  trip_source: Validator.object().required("Trip Source Type is required"),
  contact: Validator.object()
    .shape({
      name: Validator.string().required("Contact name is required."),
      email: Validator.string().email("Contact email address in invalid"),
      phone_number: EmptyNumberValidator()
        .typeError("Phone number is invalid")
        .positive("Phone number should be an positive integer"),
    })
    .required(),
})

interface NewItemSchema {
  trip_id?: string
  start_date: string
  no_of_nights: number
  destinations: locationStore.ILocation[]
  no_of_adults: number
  trip_source?: tripSourceStore.ITripSource
  children: { count: number; age: number }[]
  contact: {
    name: string
    email: string
    phone_number?: number
    country?: locationStore.ICountry
  }
}

const initialValues: NewItemSchema = {
  trip_id: "",
  start_date: "",
  no_of_nights: 1,
  destinations: [],
  no_of_adults: 1,
  children: [],
  trip_source: undefined,
  contact: {
    name: "",
    email: "",
    phone_number: undefined,
    country: undefined,
  },
}

interface NewItemProps extends XHRProps, RouteComponentProps {}
function NewItem({ xhr, navigate }: NewItemProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(
        values: NewItemSchema,
        actions: FormikActions<NewItemSchema>
      ) => {
        actions.setStatus()
        const {
          start_date,
          no_of_adults,
          no_of_nights,
          children = [],
          destinations,
          trip_source,
          trip_id,
          contact,
        } = values
        if (
          start_date &&
          no_of_nights &&
          no_of_adults &&
          destinations &&
          destinations.length
        ) {
          const data = {
            start_date: moment(start_date)
              .hours(0)
              .minutes(0)
              .seconds(0)
              .utc()
              .format("YYYY-MM-DD HH:mm:ss"),
            end_date: moment(start_date)
              .add(no_of_nights, "day")
              .hours(23)
              .minutes(59)
              .seconds(59)
              .utc()
              .format("YYYY-MM-DD HH:mm:ss"),
            no_of_adults,
            children: children
              .map(({ count, age }) => `${count}-${age}yo`)
              .join(","),
            locations: destinations.map(destination => destination.id),
            trip_id,
            trip_source_id: trip_source ? trip_source.id : undefined,
            contact: {
              name: contact.name,
              email: contact.email || undefined,
              phone_number: contact.phone_number || undefined,
              country_id: contact.country ? contact.country.id : undefined,
            },
          }
          xhr
            .post("/trips", data)
            .then(resp => {
              const { data: trip } = resp.data
              navigate && navigate(`../${trip.id}`)
              actions.setSubmitting(false)
            })
            .catch(error => {
              actions.setStatus(error.message)
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
              actions.setSubmitting(false)
            })
        } else {
          actions.setStatus("Please fill the required attributes")
          actions.setSubmitting(false)
        }
      }}
      render={({
        isSubmitting,
        status,
        values,
        setFieldValue,
      }: FormikProps<NewItemSchema>) => (
        <Form noValidate>
          <fieldset>
            <legend>Add New Trip</legend>
            {status ? <p className="text-red-700">{status}</p> : null}
            <Grid>
              <Col>
                <FormikFormGroup
                  name="destinations"
                  render={({ field }) => (
                    <SelectLocations
                      {...field}
                      label="Destinations"
                      onChange={(value, name) => setFieldValue(name, value)}
                    />
                  )}
                />
              </Col>
              <Col>
                <DatePicker name="start_date" label="Start Date" required />
              </Col>
              <Col>
                <InputField
                  name="no_of_nights"
                  label="Number of nights"
                  type="number"
                  min={1}
                  required
                />
              </Col>
              <Col>
                <FormikFormGroup
                  name="trip_source"
                  render={({ field }: FieldProps<NewItemSchema>) => (
                    <SelectTripSources
                      {...field}
                      label="Trip Source"
                      required
                      fetchOnMount
                      onChange={(value, name) => setFieldValue(name, value)}
                      multiple={false}
                    />
                  )}
                />
              </Col>
              <Col>
                <InputField
                  name="trip_id"
                  label="Trip ID"
                  placeholder="1231231"
                />
              </Col>
            </Grid>
            <Grid>
              <Col>
                <fieldset>
                  <legend>Pax Details</legend>
                  <InputField
                    name="no_of_adults"
                    label="Number of adults"
                    type="number"
                    min={1}
                    required
                  />
                  <FieldArray
                    name="children"
                    render={({ name, remove, push }) => (
                      <fieldset>
                        <legend>Children</legend>
                        <ul className="list">
                          {values.children.map((_, index) => (
                            <Grid as="li" key={index}>
                              <Col xs="auto">
                                <InputField
                                  label="Age"
                                  name={`${name}.${index}.age`}
                                  type="number"
                                  min={1}
                                  max={20}
                                  required
                                />
                              </Col>
                              <Col xs="auto">
                                <InputField
                                  label="Count"
                                  name={`${name}.${index}.count`}
                                  type="number"
                                  min={1}
                                  max={10000}
                                  required
                                />
                              </Col>
                              <Col
                                xs="auto"
                                className="d-flex align-items-center"
                              >
                                <Button
                                  className="btn--secondary"
                                  onClick={_ => remove(index)}
                                >
                                  &times; Remove
                                </Button>
                              </Col>
                            </Grid>
                          ))}
                          <Button onClick={_ => push({ count: 1, age: 6 })}>
                            + Add Children Details
                          </Button>
                        </ul>
                      </fieldset>
                    )}
                  />
                </fieldset>
              </Col>
              <Col sm={6}>
                <fieldset>
                  <legend>Contact Details</legend>
                  <FieldArray
                    name="contact"
                    render={({ name }) => (
                      <Grid>
                        <Col sm={"auto"}>
                          <InputField
                            name={`${name}.name`}
                            label="Contact Name"
                            required
                            placeholder="Anoop Rai"
                          />
                        </Col>
                        <Col sm="auto">
                          <InputField
                            name={`${name}.email`}
                            label="Email"
                            required
                            type="email"
                            placeholder="user@domain.com"
                          />
                        </Col>
                        {
                          // <Col>
                          //   <FormikFormGroup
                          //     name={`${name}.country`}
                          //     render={({ field }) => (
                          //       <SelectCountries
                          //         {...field}
                          //         multiple={false}
                          //         label="Country code"
                          //         placeholder="Type here... eg India or +91"
                          //         required
                          //         onChange={(value, name) =>
                          //           setFieldValue(name, value)
                          //         }
                          //       />
                          //     )}
                          //   />
                          // </Col>
                        }
                        <Col>
                          <InputField
                            name={`${name}.phone_number`}
                            label="Phone Number"
                            type="number"
                            required
                            placeholder="9779212232"
                          />
                        </Col>
                      </Grid>
                    )}
                  />
                </fieldset>
              </Col>
            </Grid>
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
  )
}

export default withXHR(NewItem)
