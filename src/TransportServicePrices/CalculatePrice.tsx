import React, { useState, useMemo } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldArray,
  FieldProps,
} from "formik"
import { Button, Icons, useDidMount, Select } from "@tourepedia/ui"
import * as Validator from "yup"
import moment from "moment"
import { AxiosInstance } from "axios"

import { store as cabTypeStore, SelectCabTypes } from "./../CabTypes"
import {
  SelectTransportServices as SelectServices,
  store as transportServiceStore,
} from "./../TransportServices"
import {
  InputField,
  Input,
  FormikFormGroup,
  FormGroup,
} from "./../Shared/InputField"
import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"
import DatePicker from "../Shared/DatePicker"
import { EmptyNumberValidator } from "../utils"

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
      no_of_days: EmptyNumberValidator()
        .positive("Number of days should be a positive integer")
        .integer("Number of days should be a positive integer")
        .required("Number of days is required."),
      cab_type: Validator.object().required("Cab type field is required"),
      transport_service: Validator.object().required("Service is required"),
      no_of_cabs: EmptyNumberValidator()
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
    no_price_for_dates?: Array<string>
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
  bookingFrom?: string
  bookingTo?: string
}
export const CalculatePriceForm = withXHR(function CalculatePriceForm({
  initialValues = InitialValues,
  xhr,
  onChange,
  bookingFrom,
  bookingTo,
}: CalculatePriceFormProps) {
  function notifyOnChange(flattenValues: CalculatePriceSchema) {
    onChange &&
      onChange(
        flattenValues.cabs.reduce(
          (price: number, cab) =>
            price +
            parseFloat((cab.given_price ? cab.given_price : 0).toString()),
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
            from_date: moment(start_date)
              .hours(0)
              .minutes(0)
              .seconds(0)
              .utc()
              .format("YYYY-MM-DD HH:mm:ss"),
            to_date: moment(start_date)
              .add(no_of_days - 1, "days")
              .hours(23)
              .minutes(59)
              .seconds(59)
              .utc()
              .format("YYYY-MM-DD HH:mm:ss"),
            cab_type_id: cab_type && cab_type.id,
            transport_service_id: transport_service && transport_service.id,
          })
        )
      )
  }
  useDidMount(() => {
    notifyOnChange(initialValues)
  })
  const bookingDates: Array<{ id: number; name: string }> = useMemo(() => {
    const dates = []
    const days = moment(bookingTo).diff(moment(bookingFrom), "days")
    for (let i = 0; i <= days; i++) {
      dates.push({
        id: i,
        name: moment(bookingFrom)
          .add(i, "day")
          .format("YYYY-MM-DD"),
      })
    }
    return dates
  }, [bookingFrom, bookingTo])
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
            flattenValues.cabs.push({
              ...values,
              start_date: moment(start_date).format("YYYY-MM-DD"),
              no_of_days,
            })
            cabs.push({
              from_date: moment(start_date)
                .hours(0)
                .minutes(0)
                .seconds(0)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss"),
              to_date: moment(start_date)
                .add(no_of_days - 1, "days")
                .hours(23)
                .minutes(59)
                .seconds(59)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss"),
              cab_type_id: cab_type.id,
              transport_service_id: transport_service.id,
              no_of_cabs,
            })
          }
        })
        XHR(xhr)
          .getPrice(cabs)
          .then(data => {
            flattenValues.cabs = flattenValues.cabs.map((cab, i) => ({
              ...cab,
              calculated_price: data.cabs[i].price,
              given_price: data.cabs[i].price,
              no_price_for_dates: data.cabs[i].no_price_for_dates,
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
          <FieldArray
            name="cabs"
            render={({ name, push, remove }) => (
              <div>
                {values.cabs.map((cab, index) => (
                  <fieldset key={index}>
                    <Grid>
                      <Col>
                        {bookingFrom && bookingTo ? (
                          <FormikFormGroup
                            name={`${name}.${index}.start_date`}
                            render={({
                              field,
                            }: FieldProps<CalculatePriceSchema>) => (
                              <Select
                                {...field}
                                label="Start Date"
                                options={bookingDates}
                                searchable={false}
                                onQuery={() => {}}
                                value={bookingDates.find(
                                  d => d.name === cab.start_date
                                )}
                                placeholder="Select a date..."
                                required
                                onChange={(startDate, name) => {
                                  setFieldValue(name, startDate.name)
                                }}
                              />
                            )}
                          />
                        ) : (
                          <DatePicker
                            label="Start Date"
                            name={`${name}.${index}.start_date`}
                            required
                          />
                        )}
                      </Col>
                      <Col>
                        <InputField
                          label="No of days"
                          name={`${name}.${index}.no_of_days`}
                          type="number"
                          required
                          min={1}
                          max={10000}
                        />
                      </Col>
                      <Col>
                        <FormikFormGroup
                          name={`${name}.${index}.cab_type`}
                          render={({
                            field,
                          }: FieldProps<CalculatePriceSchema>) => (
                            <SelectCabTypes
                              {...field}
                              label="Cab Type"
                              multiple={false}
                              fetchOnMount
                              onChange={(value, name) =>
                                setFieldValue(name, value)
                              }
                            />
                          )}
                        />
                      </Col>
                      <Col>
                        <FormikFormGroup
                          name={`${name}.${index}.transport_service`}
                          render={({
                            field,
                          }: FieldProps<CalculatePriceSchema>) => (
                            <SelectServices
                              {...field}
                              label="Transport Service"
                              multiple={false}
                              onChange={(value, name) =>
                                setFieldValue(name, value)
                              }
                            />
                          )}
                        />
                      </Col>
                      <Col>
                        <InputField
                          label="No of cabs"
                          name={`${name}.${index}.no_of_cabs`}
                          type="number"
                          required
                        />
                      </Col>
                    </Grid>
                    <FormGroup>
                      <p>
                        <b>Get the price for this query</b>
                      </p>
                      <div className="button-group">
                        <Button type="submit" disabled={isSubmitting}>
                          Get Prices
                        </Button>
                        {cab.calculated_price !== undefined ? (
                          <span className="btn">{cab.calculated_price}</span>
                        ) : null}
                      </div>
                      {cab.no_price_for_dates &&
                      cab.no_price_for_dates.length ? (
                        <p className="text-yellow-800">
                          No prices available for{" "}
                          {cab.no_price_for_dates
                            .map(date =>
                              moment
                                .utc(date)
                                .local()
                                .format("Do MMM")
                            )
                            .join(", ")}
                        </p>
                      ) : null}
                    </FormGroup>
                    <Grid>
                      <Col sm="auto">
                        <FormGroup>
                          <label>Give Price</label>
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
                        </FormGroup>
                      </Col>
                      <Col>
                        <FormGroup>
                          <label>Comments</label>
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
                        </FormGroup>
                      </Col>
                    </Grid>
                    <hr />
                    <div>
                      <Button
                        className="btn--secondary"
                        onClick={() => push(cab)}
                      >
                        + Duplicate
                      </Button>
                      <Button
                        className="btn--secondary"
                        onClick={() => remove(index)}
                      >
                        &times; Remove
                      </Button>
                    </div>
                  </fieldset>
                ))}
                <div>
                  <div>
                    <Button onClick={() => push(initialValues.cabs[0])}>
                      + Add More Price Queries
                    </Button>
                  </div>
                </div>
              </div>
            )}
          />
        </Form>
      )}
    />
  )
})

export default function CalculatePrice(props: RouteComponentProps) {
  const [price, setPrice] = useState<number>(0)
  return (
    <div>
      <div className="flex align-items-center mb-8">
        <Link
          to=".."
          className="mr-4 text-blue-600 hover:text-blue-800 text-lg px-2 border rounded-full"
        >
          <Icons.ChevronDownIcon className="rotate-90" />
        </Link>
        <h3 className="m-0">Calculate Transportation Prices</h3>
      </div>
      <p>
        Please enter your transportation query and press get price to get the
        prices.
      </p>
      <CalculatePriceForm onChange={price => setPrice(price)} />
      <footer className="mt-8 pb-8">
        <h4>
          <mark>Total Cost Price: {price}</mark>
        </h4>
      </footer>
    </div>
  )
}
