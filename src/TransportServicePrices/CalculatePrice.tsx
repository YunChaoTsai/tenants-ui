import React, { useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  Field,
  FieldArray,
  FieldProps,
  ErrorMessage,
} from "formik"
import Button from "@tourepedia/button"
import * as Validator from "yup"
import moment from "moment"
import { AxiosInstance } from "axios"

import { store as cabTypeStore, SelectCabTypes } from "./../CabTypes"
import {
  SelectTransportServices as SelectServices,
  store as transportServiceStore,
} from "./../TransportServices"
import { InputField, Input, FormikFormGroup } from "./../Shared/InputField"
import { withXHR, XHRProps } from "./../xhr"

export function XHR(xhr: AxiosInstance) {
  return {
    getPrice(cabs: any) {
      return xhr.get("/prices", { params: { cabs } }).then(resp => resp.data)
    },
  }
}

const validationSchema = Validator.object().shape({
  cabs: Validator.array().of(
    Validator.object().shape({
      start_date: Validator.string().required("Start date field is required"),
      no_of_days: Validator.number()
        .positive("Number of days should be a positive integer")
        .integer("Number of days should be a positive integer")
        .required("Number of days is required."),
      cab_type: Validator.object().required("Cab type field is required"),
      transport_service: Validator.object().required("Service is required"),
      no_of_cabs: Validator.number()
        .positive("Number of cabs should be a positive integer")
        .integer("Number of cabs should be a positive integer.")
        .required("Number of cabs is required"),
    })
  ),
})

interface CalculatePriceSchema {
  cabs: {
    start_date: string
    no_of_days: number
    cab_type?: cabTypeStore.ICabType
    transport_service?: transportServiceStore.ITransportService
    no_of_cabs: number
    calculated_price?: number
    given_price?: number
    comments?: string
  }[]
}

const InitialValues: CalculatePriceSchema = {
  cabs: [
    {
      start_date: "",
      no_of_days: 1,
      cab_type: undefined,
      transport_service: undefined,
      no_of_cabs: 1,
      calculated_price: undefined,
      given_price: 0,
      comments: "",
    },
  ],
}

interface CalculatePriceFormProps extends XHRProps {
  initialValues?: CalculatePriceSchema
  onChange?: (price: number, cabs: any) => void
}
export const CalculatePriceForm = withXHR(function CalculatePriceForm({
  initialValues = InitialValues,
  xhr,
  onChange,
}: CalculatePriceFormProps) {
  function notifyOnChange(flattenValues: CalculatePriceSchema) {
    onChange &&
      onChange(
        flattenValues.cabs.reduce(
          (price: number, cab) =>
            price + (cab.given_price ? cab.given_price : 0),
          0
        ),
        flattenValues.cabs.map(
          ({
            start_date,
            no_of_days,
            cab_type,
            transport_service,
            ...cab
          }) => ({
            ...cab,
            date: moment(start_date)
              .hours(12)
              .minutes(0)
              .seconds(0)
              .utc()
              .format("YYYY-MM-DD HH:mm:ss"),
            cab_type_id: cab_type && cab_type.id,
            transport_service_id: transport_service && transport_service.id,
          })
        )
      )
  }
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(
        values: CalculatePriceSchema,
        actions: FormikActions<CalculatePriceSchema>
      ) => {
        actions.setStatus()
        const cabs: any[] = []
        // flatten values so that we cab show the prices for each row
        const flattenValues: CalculatePriceSchema = {
          cabs: [],
        }
        values.cabs.forEach(values => {
          const {
            start_date,
            no_of_days,
            cab_type,
            transport_service,
            no_of_cabs,
          } = values
          if (
            start_date &&
            no_of_days &&
            cab_type &&
            transport_service &&
            no_of_cabs
          ) {
            for (let i = 0; i < no_of_days; i++) {
              flattenValues.cabs.push({
                ...values,
                start_date: moment(start_date)
                  .add(i, "days")
                  .format("YYYY-MM-DD"),
                no_of_days: 1,
              })
              cabs.push({
                date: moment(start_date)
                  .add(i, "days")
                  .hours(12)
                  .minutes(0)
                  .seconds(0)
                  .utc()
                  .format("YYYY-MM-DD HH:mm:ss"),
                cab_type_id: cab_type.id,
                transport_service_id: transport_service.id,
                no_of_cabs,
              })
            }
          }
        })
        XHR(xhr)
          .getPrice(cabs)
          .then(data => {
            flattenValues.cabs = flattenValues.cabs.map((cab, i) => ({
              ...cab,
              calculated_price: data.cab_prices_per_row[i],
              given_price: cab.given_price || data.cab_prices_per_row[i],
            }))
            actions.setValues(flattenValues)
            actions.setSubmitting(false)
            notifyOnChange(flattenValues)
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
        isSubmitting,
        values,
        status,
        setFieldValue,
      }: FormikProps<CalculatePriceSchema>) => (
        <Form noValidate>
          {status ? <div>{status}</div> : null}
          <table>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>Number of days</th>
                <th>Service</th>
                <th>Cab Type</th>
                <th>Number of cabs</th>
                <th>Calculated Price</th>
                <th>Given Price</th>
                <th>Comments</th>
              </tr>
            </thead>
            <FieldArray
              name="cabs"
              render={({ name, push, remove }) => (
                <tbody>
                  {values.cabs.map((cab, index) => (
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
                          name={`${name}.${index}.no_of_days`}
                          type="number"
                          required
                        />
                      </td>
                      <td>
                        <FormikFormGroup
                          name={`${name}.${index}.transport_service`}
                          render={({
                            field,
                          }: FieldProps<CalculatePriceSchema>) => (
                            <SelectServices
                              {...field}
                              multiple={false}
                              onChange={(value, name) =>
                                setFieldValue(name, value)
                              }
                            />
                          )}
                        />
                      </td>
                      <td>
                        <FormikFormGroup
                          name={`${name}.${index}.cab_type`}
                          render={({
                            field,
                          }: FieldProps<CalculatePriceSchema>) => (
                            <SelectCabTypes
                              {...field}
                              multiple={false}
                              onChange={(value, name) =>
                                setFieldValue(name, value)
                              }
                            />
                          )}
                        />
                      </td>
                      <td>
                        <InputField
                          name={`${name}.${index}.no_of_cabs`}
                          type="number"
                          required
                        />
                      </td>
                      <td>
                        <Button type="submit" disabled={isSubmitting}>
                          Get Prices
                        </Button>
                        <div>{cab.calculated_price}</div>
                      </td>
                      <td>
                        <Input
                          name={`${name}.${index}.given_price`}
                          type="number"
                          value={cab.given_price}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            let value: number | undefined = parseInt(
                              e.target.value,
                              10
                            )
                            if (isNaN(value)) {
                              value = undefined
                            }
                            const flattenValues = {
                              cabs: values.cabs.map((cab, i) =>
                                i !== index
                                  ? cab
                                  : {
                                      ...cab,
                                      given_price: value,
                                    }
                              ),
                            }
                            notifyOnChange(flattenValues)
                            setFieldValue(e.target.name, value)
                          }}
                          min={0}
                        />
                      </td>
                      <td>
                        <Input
                          name={`${name}.${index}.comments`}
                          as="textarea"
                          maxLength={191}
                          value={cab.comments}
                          placeholder="Regarding pricing difference or any other"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = e.target.value
                            const flattenValues = {
                              cabs: values.cabs.map((cab, i) =>
                                i !== index
                                  ? cab
                                  : {
                                      ...cab,
                                      comments: value,
                                    }
                              ),
                            }
                            notifyOnChange(flattenValues)
                            setFieldValue(e.target.name, value)
                          }}
                        />
                      </td>
                      <td>
                        {values.cabs.length > 1 ? (
                          <Button onClick={e => remove(index)}>Remove</Button>
                        ) : null}
                        <Button onClick={e => push(cab)}>Duplicate</Button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <Button onClick={e => push(initialValues.cabs[0])}>
                        Add More
                      </Button>
                    </td>
                  </tr>
                </tbody>
              )}
            />
          </table>
        </Form>
      )}
    />
  )
})

export default function CalculatePrice(props: RouteComponentProps) {
  const [price, setPrice] = useState<number>(0)
  return (
    <div>
      <Link to="..">Back</Link>
      <CalculatePriceForm onChange={price => setPrice(price)} />
      Price is: {price}
    </div>
  )
}
