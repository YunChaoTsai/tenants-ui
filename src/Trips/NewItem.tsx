import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldArray,
  ErrorMessage,
  Field,
  FieldProps,
} from "formik"
import Button from "@tourepedia/button"
import * as Validator from "yup"
import moment from "moment"

import { InputField } from "./../Shared/InputField"
import { SelectLocations, store as locationStore } from "./../Locations"
import { SelectTripSources, store as tripSourceStore } from "./../TripSources"
import { withXHR, XHRProps } from "./../xhr"

const validationSchema = Validator.object().shape({
  trip_id: Validator.string(),
  start_date: Validator.string().required("Start date is required"),
  no_of_nights: Validator.number()
    .positive("Number of nights should be a positive integer")
    .integer("Number of nights should be a positive integer")
    .required("Number of nights is required"),
  destinations: Validator.array().min(
    1,
    "Please select atleast one destination"
  ),
  no_of_adults: Validator.number()
    .positive("Number of adults should be a positive integer")
    .integer("Number of adults should be a positive integer")
    .required("Number of adults field is required"),
  children: Validator.array().of(
    Validator.object().shape({
      count: Validator.number()
        .positive("Number of children should be positive integer")
        .integer("Number of children should be positive integer")
        .required("Number of children field is required"),
      age: Validator.number()
        .positive("Child age should a positive number")
        .required("Child age is required"),
    })
  ),
  trip_source: Validator.object().required("Trip Source Type is required"),
})

interface NewItemSchema {
  trip_id?: string
  start_date: string
  no_of_nights: number
  destinations: locationStore.ILocation[]
  no_of_adults: number
  trip_source?: tripSourceStore.ITripSource
  children: { count: number; age: number }[]
}

const initialValues: NewItemSchema = {
  trip_id: "",
  start_date: "",
  no_of_nights: 1,
  destinations: [],
  no_of_adults: 1,
  children: [],
  trip_source: undefined,
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
          }
          xhr.post("/trips", data).then(resp => {
            const { trip } = resp.data
            navigate && navigate(`../${trip.id}`)
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
          {status ? <div>{status}</div> : null}
          <FieldArray
            name="destinations"
            render={({ name }) => (
              <div>
                <SelectLocations
                  label="Destinations"
                  name={name}
                  value={values.destinations}
                  onChange={value => setFieldValue(name, value)}
                />
                <ErrorMessage name={name} />
              </div>
            )}
          />
          <InputField
            name="start_date"
            label="Start Date"
            type="date"
            required
          />
          <InputField
            name="no_of_nights"
            label="Number of nights"
            type="number"
            min={1}
            required
          />
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
              <div>
                <label>Children</label>
                {values.children.map((children, index) => (
                  <div key={index}>
                    <InputField
                      label="Age"
                      name={`${name}.${index}.age`}
                      type="number"
                      min={1}
                      required
                    />
                    <InputField
                      label="Count"
                      name={`${name}.${index}.count`}
                      type="number"
                      min={1}
                      required
                    />
                    <Button onClick={_ => remove(index)}>Remove</Button>
                  </div>
                ))}
                <Button onClick={_ => push({ count: 1, age: 6 })}>
                  Add More
                </Button>
              </div>
            )}
          />
          <Field
            name="trip_source"
            render={({ field }: FieldProps<NewItemSchema>) => (
              <div>
                <SelectTripSources
                  name={field.name}
                  label="Trip Source"
                  required
                  value={values.trip_source}
                  onChange={value => setFieldValue(field.name, value)}
                  multiple={false}
                />
                <ErrorMessage name={field.name} />
              </div>
            )}
          />
          <InputField name="trip_id" label="Trip ID" placeholder="1231231" />
          <Button type="submit" disabled={isSubmitting}>
            Save
          </Button>{" "}
          <Link to="..">Cancel</Link>
        </Form>
      )}
    />
  )
}

export default withXHR(NewItem)
