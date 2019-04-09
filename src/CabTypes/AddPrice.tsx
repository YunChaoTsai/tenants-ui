import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
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

import { ICabPrice, ICabType } from "./store"
import { store as locationServiceStore, SelectServices } from "./../Locations"
import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"
import { SelectCabTypes } from "./List"

export function XHR(xhr: AxiosInstance) {
  return {
    storePrice(data: any): Promise<ICabPrice> {
      return xhr.post("/cab-prices", data).then(resp => resp.data.cab_price)
    },
  }
}

const validationSchema = Validator.object().shape({
  start_date: Validator.string().required("Start date is required"),
  end_date: Validator.string().required("End date is required"),
  cab_type: Validator.object().required("Cab type is required"),
  location_service: Validator.object().required("Location service is required"),
  price: Validator.number(),
  per_km_charges: Validator.number(),
  minimum_km_per_day: Validator.number(),
  other_charges: Validator.number(),
})

interface AddPriceCredentials {
  start_date: string
  end_date: string
  cab_type?: ICabType
  location_service?: locationServiceStore.IService
  price?: number
  per_km_charges?: number
  minimum_km_per_day?: number
  other_charges: number
}

const initialValues: AddPriceCredentials = {
  start_date: "",
  end_date: "",
  cab_type: undefined,
  location_service: undefined,
  price: undefined,
  per_km_charges: undefined,
  minimum_km_per_day: undefined,
  other_charges: 0,
}

interface AddPriceProps extends RouteComponentProps, XHRProps {}

function AddPrice({ xhr, navigate }: AddPriceProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(
        values: AddPriceCredentials,
        actions: FormikActions<AddPriceCredentials>
      ) => {
        actions.setStatus()
        const {
          cab_type,
          location_service,
          start_date,
          end_date,
          ...otherData
        } = values
        if (cab_type && location_service) {
          return XHR(xhr)
            .storePrice({
              ...otherData,
              start_date: moment(start_date)
                .hours(0)
                .minutes(0)
                .seconds(0)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss"),
              end_date: moment(end_date)
                .hours(23)
                .minutes(59)
                .seconds(59)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss"),
              cab_type_id: cab_type.id,
              location_service_id: location_service.id,
            })
            .then(resp => {
              actions.setSubmitting(false)
              navigate && navigate("../prices")
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
        status,
        isSubmitting,
        values,
        setFieldValue,
      }: FormikProps<AddPriceCredentials>) => (
        <Form noValidate>
          {status ? <div>{status}</div> : null}
          <InputField
            name="start_date"
            label="Start Date"
            type="date"
            required
          />
          <InputField name="end_date" label="End Date" type="date" required />
          <Field
            name="cab_type"
            render={({ field }: FieldProps<AddPriceCredentials>) => (
              <div>
                <SelectCabTypes
                  label="Cab Type"
                  name={field.name}
                  multiple={false}
                  required
                  value={field.value}
                  onChange={value => setFieldValue(field.name, value)}
                />
                <ErrorMessage name={field.name} />
              </div>
            )}
          />
          <Field
            name="location_service"
            render={({ field }: FieldProps<AddPriceCredentials>) => (
              <div>
                <SelectServices
                  label="Service"
                  name={field.name}
                  multiple={false}
                  required
                  value={field.value}
                  onChange={value => setFieldValue(field.name, value)}
                />
                <ErrorMessage name={field.name} />
              </div>
            )}
          />
          <InputField
            name="price"
            label="Price (for fixed prices per service)"
            type="number"
          />
          <InputField
            name="per_km_charges"
            label="Per KM charges"
            type="number"
          />
          <InputField
            name="minimum_km_per_day"
            label="Minimum kms per day"
            type="number"
          />
          <InputField
            name="other_charges"
            label="Other charges"
            type="number"
          />
          <Button type="submit" disabled={isSubmitting}>
            Save
          </Button>{" "}
          <Link to={".."}>Cancel</Link>
        </Form>
      )}
    />
  )
}

export default withXHR(AddPrice)
