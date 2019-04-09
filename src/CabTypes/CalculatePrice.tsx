import React, { useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  Field,
  FieldProps,
  ErrorMessage,
} from "formik"
import Button from "@tourepedia/button"
import * as Validator from "yup"
import moment from "moment"

import { ICabType } from "./store"
import { SelectCabTypes } from "./List"
import { store as locationStore, SelectServices } from "./../Locations"
import { InputField } from "./../Shared/InputField"
import { withXHR, XHRProps } from "./../xhr"

const validationSchema = Validator.object().shape({
  start_date: Validator.string().required("Start date field is required"),
  no_of_days: Validator.number()
    .positive("Number of days should be a positive integer")
    .integer("Number of days should be a positive integer")
    .required("Number of days is required."),
  cab_type: Validator.object().required("Cab type field is required"),
  location_service: Validator.object().required("Service is required"),
  no_of_cabs: Validator.number()
    .positive("Number of cabs should be a positive integer")
    .integer("Number of cabs should be a positive integer.")
    .required("Number of cabs is required"),
})

interface CalculatePriceSchema {
  start_date: string
  no_of_days: number
  cab_type?: ICabType
  location_service?: locationStore.IService
  no_of_cabs: number
}

const initialValues: CalculatePriceSchema = {
  start_date: "",
  no_of_days: 1,
  cab_type: undefined,
  location_service: undefined,
  no_of_cabs: 1,
}

interface CalculatePriceProps extends RouteComponentProps, XHRProps {}

function CalculatePrice({ xhr }: CalculatePriceProps) {
  const [price, setPrice] = useState<number>(0)
  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: CalculatePriceSchema,
          actions: FormikActions<CalculatePriceSchema>
        ) => {
          const {
            start_date,
            no_of_days,
            cab_type,
            location_service,
            no_of_cabs,
          } = values
          if (
            start_date &&
            no_of_days &&
            cab_type &&
            location_service &&
            no_of_cabs
          ) {
            xhr
              .get("/prices", {
                params: {
                  cabs: [
                    {
                      start_date: moment(start_date)
                        .hours(0)
                        .minutes(0)
                        .seconds(0)
                        .utc()
                        .format("YYYY-MM-DD HH:mm:ss"),
                      end_date: moment(start_date)
                        .add(no_of_days, "days")
                        .hours(23)
                        .minutes(59)
                        .seconds(59)
                        .utc()
                        .format("YYYY-MM-DD HH:mm:ss"),
                      cab_type_id: cab_type.id,
                      location_service_id: location_service.id,
                      no_of_cabs,
                    },
                  ],
                },
              })
              .then(resp => {
                actions.setStatus()
                actions.setSubmitting(false)
                const { price } = resp.data
                setPrice(price)
              })
              .catch(error => {
                actions.setStatus(error.message)
                if (error.formikErrors) {
                  actions.setErrors(error.formikErrors)
                }
                actions.setSubmitting(false)
              })
          }
        }}
        render={({
          isSubmitting,
          status,
        }: FormikProps<CalculatePriceSchema>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <InputField
              name="start_date"
              label="Start Date"
              type="date"
              required
            />
            <InputField
              name="no_of_days"
              label="Number of days"
              type="number"
              required
            />
            <Field
              name="location_service"
              render={({
                field,
                form: { setFieldValue },
              }: FieldProps<CalculatePriceSchema>) => (
                <div>
                  <SelectServices
                    label="Service"
                    multiple={false}
                    name={field.name}
                    value={field.value}
                    onChange={value => setFieldValue(field.name, value)}
                  />
                  <ErrorMessage name={field.name} />
                </div>
              )}
            />
            <Field
              name="cab_type"
              render={({
                field,
                form: { setFieldValue },
              }: FieldProps<CalculatePriceSchema>) => (
                <div>
                  <SelectCabTypes
                    label="Cab Type"
                    multiple={false}
                    name={field.name}
                    value={field.value}
                    onChange={value => setFieldValue(field.name, value)}
                  />
                  <ErrorMessage name={field.name} />
                </div>
              )}
            />
            <InputField
              name="no_of_cabs"
              label="Number of cabs"
              type="number"
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              Get Prices
            </Button>{" "}
            <Link to="..">Cancel</Link>
          </Form>
        )}
      />
      Price is: {price}
    </div>
  )
}

export default withXHR(CalculatePrice)
