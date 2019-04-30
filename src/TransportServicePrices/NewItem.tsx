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
  FieldArray,
  ErrorMessage,
} from "formik"
import Button from "@tourepedia/button"
import * as Validator from "yup"
import moment from "moment"

import { ITransportServicePrice } from "./store"
import { store as cabTypeStore, SelectCabTypes } from "./../CabTypes"
import {
  SelectTransportServices as SelectServices,
  store as transportServiceStore,
} from "./../TransportServices"
import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"

export function XHR(xhr: AxiosInstance) {
  return {
    storePrice(data: any): Promise<ITransportServicePrice> {
      return xhr.post("/cab-prices", data).then(resp => resp.data.cab_price)
    },
  }
}

const validationSchema = Validator.object().shape({
  prices: Validator.array().of(
    Validator.object().shape({
      start_date: Validator.string().required("Start date is required"),
      end_date: Validator.string().required("End date is required"),
      cab_type: Validator.object().required("Cab type is required"),
      transport_service: Validator.object().required(
        "Transport service is required"
      ),
      price: Validator.number(),
      per_km_charges: Validator.number(),
      minimum_km_per_day: Validator.number(),
      night_charges: Validator.number(),
      toll_charges: Validator.number(),
      parking_charges: Validator.number(),
    })
  ),
})

interface AddPriceCredentials {
  prices: {
    start_date: string
    end_date: string
    cab_type?: cabTypeStore.ICabType
    transport_service?: transportServiceStore.ITransportService
    price?: number
    per_km_charges?: number
    minimum_km_per_day?: number
    toll_charges?: number
    night_charges?: number
    parking_charges?: number
  }[]
}

const initialValues: AddPriceCredentials = {
  prices: [
    {
      start_date: "",
      end_date: "",
      cab_type: undefined,
      transport_service: undefined,
      price: undefined,
      per_km_charges: undefined,
      minimum_km_per_day: undefined,
      toll_charges: 0,
      night_charges: 0,
      parking_charges: 0,
    },
  ],
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
        const prices: any = []
        values.prices.forEach(values => {
          const {
            cab_type,
            transport_service,
            start_date,
            end_date,
            ...otherData
          } = values
          if (cab_type && transport_service) {
            prices.push({
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
              transport_service_id: transport_service.id,
            })
          }
        })
        return XHR(xhr)
          .storePrice({ prices })
          .then(resp => {
            actions.setSubmitting(false)
            navigate && navigate("..")
          })
          .catch(error => {
            actions.setStatus(error.message)
            if (error.formikErrors) {
              actions.setErrors(error.formikErrors)
            }
            actions.setSubmitting(false)
          })
      }}
      render={({
        status,
        isSubmitting,
        values,
        setFieldValue,
      }: FormikProps<AddPriceCredentials>) => (
        <Form noValidate>
          {status ? <div>{status}</div> : null}
          <table>
            <thead>
              <tr>
                <td>Start Date</td>
                <td>End Date</td>
                <td>Cab Type</td>
                <td>Transport Service</td>
                <td>Price(for fixed/service type)</td>
                <td>/KM charges</td>
                <td>Minimum kms per day</td>
                <td>Toll factor</td>
                <td>Night factor</td>
                <td>Parking factor</td>
              </tr>
            </thead>
            <FieldArray
              name="prices"
              render={({ name, push, remove }) => (
                <tbody>
                  {values.prices.map((price, index, prices) => (
                    <tr key={index}>
                      <td>
                        <InputField
                          name={`${name}.${index}.start_date`}
                          type="date"
                          required
                        />
                      </td>
                      <td>
                        <InputField
                          name={`${name}.${index}.end_date`}
                          type="date"
                          required
                        />
                      </td>
                      <td>
                        <Field
                          name={`${name}.${index}.cab_type`}
                          render={({
                            field,
                          }: FieldProps<AddPriceCredentials>) => (
                            <div>
                              <SelectCabTypes
                                name={field.name}
                                multiple={false}
                                required
                                value={field.value}
                                onChange={value =>
                                  setFieldValue(field.name, value)
                                }
                              />
                              <ErrorMessage name={field.name} />
                            </div>
                          )}
                        />
                      </td>
                      <td>
                        <Field
                          name={`${name}.${index}.transport_service`}
                          render={({
                            field,
                          }: FieldProps<AddPriceCredentials>) => (
                            <div>
                              <SelectServices
                                name={field.name}
                                multiple={false}
                                required
                                value={field.value}
                                onChange={value =>
                                  setFieldValue(field.name, value)
                                }
                              />
                              <ErrorMessage name={field.name} />
                            </div>
                          )}
                        />
                      </td>
                      <td>
                        <InputField
                          name={`${name}.${index}.price`}
                          type="number"
                          min={0}
                        />
                      </td>
                      <td>
                        <InputField
                          name={`${name}.${index}.per_km_charges`}
                          type="number"
                          min={0}
                        />
                      </td>
                      <td>
                        <InputField
                          name={`${name}.${index}.minimum_km_per_day`}
                          type="number"
                          min={0}
                        />
                      </td>
                      <td>
                        <InputField
                          name={`${name}.${index}.toll_charges`}
                          type="number"
                          min={0}
                        />
                      </td>
                      <td>
                        <InputField
                          name={`${name}.${index}.night_charges`}
                          type="number"
                          min={0}
                        />
                      </td>
                      <td>
                        <InputField
                          name={`${name}.${index}.parking_charges`}
                          type="number"
                          min={0}
                        />
                      </td>

                      <td>
                        {prices.length > 1 ? (
                          <Button onClick={() => remove(index)}>Remove</Button>
                        ) : null}
                        <Button onClick={() => push(price)}>Duplicate</Button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <Button onClick={() => push(initialValues.prices[0])}>
                        Add More
                      </Button>
                    </td>
                  </tr>
                </tbody>
              )}
            />
          </table>
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
