import React, { useState, useMemo, useCallback, useRef } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldArray,
  FieldProps,
} from "formik"
import { Button, Icons, useDidMount, Select, Badge } from "@tourepedia/ui"
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
  OnFormChange,
} from "./../Shared/InputField"
import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"
import DatePicker from "../Shared/DatePicker"
import { EmptyNumberValidator, numberToLocalString } from "../utils"
import Spinner from "../Shared/Spinner"
import {
  SelectTransportLocations,
  store as locationStore,
} from "./../TransportLocations"

export function XHR(xhr: AxiosInstance) {
  return {
    async getPrice(cabs: any) {
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
      cab_locality: Validator.object().nullable(true),
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
    cab_locality?: locationStore.ITransportLocation
    no_of_cabs: number
    calculated_price?: number
    given_price?: number
    edited_given_price?: boolean
    comments?: string
    no_price_for_dates?: Array<string>
  }[]
}

const INITIAL_VALUES: CalculatePriceSchema = {
  cabs: [
    {
      start_date: "",
      no_of_days: 1,
      cab_type: undefined,
      transport_service: undefined,
      cab_locality: undefined,
      no_of_cabs: 1,
      calculated_price: undefined,
      edited_given_price: false,
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
  shouldEmptyInitialValues?: boolean
}
export const CalculatePriceForm = withXHR(function CalculatePriceForm({
  initialValues: initialValuesProp,
  shouldEmptyInitialValues = false,
  xhr,
  onChange,
  bookingFrom,
  bookingTo,
}: CalculatePriceFormProps) {
  const initialValues =
    initialValuesProp ||
    (shouldEmptyInitialValues ? { cabs: [] } : INITIAL_VALUES)
  const notifyOnChange = useCallback(
    (flattenValues: CalculatePriceSchema) => {
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
              cab_locality,
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
              cab_locality_id: cab_locality && cab_locality.id,
            })
          )
        )
    },
    [onChange]
  )
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
  const onSubmit = useCallback(
    async (
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
          cab_locality,
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
            cab_locality_id: cab_locality ? cab_locality.id : null,
            no_of_cabs,
          })
        }
      })
      return XHR(xhr)
        .getPrice(cabs)
        .then(data => {
          flattenValues.cabs = flattenValues.cabs.map((cab, i) => ({
            ...cab,
            calculated_price: data.cabs[i].price,
            given_price: cab.edited_given_price
              ? cab.given_price
              : data.cabs[i].price,
            no_price_for_dates: data.cabs[i].no_price_for_dates,
          }))
          actions.setValues(flattenValues)
          notifyOnChange(flattenValues)
        })
        .catch(error => {
          actions.setStatus(error.message)
          if (error.formikErrors) {
            actions.setErrors(error.formikErrors)
          }
        })
    },
    [xhr, notifyOnChange]
  )
  // this will help us identify if we should fetch the price for onChange or not
  // we need this because, changing the given price also triggers the fetch prices
  // and which onResolve, changes the given price back to calculated price
  const shouldFetchPricesOnChange = useRef(true)
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, actions) =>
        onSubmit(values, actions).then(() => {
          actions.setSubmitting(false)
        })
      }
      render={({
        isSubmitting,
        values,
        status,
        setFieldValue,
      }: FormikProps<CalculatePriceSchema>) => (
        <Form noValidate>
          {status ? <p className="text-red-700 mb-2">{status}</p> : null}
          <FieldArray
            name="cabs"
            render={({ name, push, remove }) => (
              <div>
                {values.cabs.map((cab, index) => (
                  <div key={index} className="border-gray-300 border-b-4">
                    <Grid>
                      <Col md={7} className="py-3">
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
                            <FormikFormGroup
                              name={`${name}.${index}.cab_locality`}
                              render={({
                                field,
                              }: FieldProps<CalculatePriceSchema>) => (
                                <SelectTransportLocations
                                  {...field}
                                  creatable={false}
                                  label="Cab Locality"
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
                              min={1}
                              max={1000}
                              type="number"
                              required
                            />
                          </Col>
                        </Grid>
                      </Col>
                      <Col md={4} className="md:border-l py-3">
                        <Grid>
                          <Col>
                            <FormGroup>
                              <div className="mb-1 white-space-pre">
                                Calculated Price
                              </div>
                              {isSubmitting ? (
                                <Spinner />
                              ) : cab.calculated_price !== undefined ? (
                                <Badge primary>
                                  <Icons.RupeeIcon /> {cab.calculated_price}
                                </Badge>
                              ) : (
                                <Button type="submit" disabled={isSubmitting}>
                                  Get Price
                                </Button>
                              )}
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
                          </Col>
                          <Col>
                            <FormGroup>
                              <label>Given Price</label>
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
                                  shouldFetchPricesOnChange.current = false
                                  setFieldValue(e.target.name, value)
                                  setFieldValue(
                                    `${name}.${index}.edited_given_price`,
                                    true
                                  )
                                }}
                                min={0}
                              />
                            </FormGroup>
                          </Col>
                          <Col sm={12}>
                            <InputField
                              label="Commets"
                              name={`${name}.${index}.comments`}
                              maxLength={191}
                              value={cab.comments}
                              placeholder="Regarding pricing difference or any other"
                              className="w-full"
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const value = e.target.value
                                shouldFetchPricesOnChange.current = false
                                setFieldValue(e.target.name, value)
                              }}
                            />
                          </Col>
                        </Grid>
                      </Col>
                      <Col md={1} className="text-right md:border-l py-3">
                        <Button
                          className="btn--secondary w-full"
                          onClick={() => push(cab)}
                        >
                          + Duplicate
                        </Button>
                        <Button
                          className="btn--secondary w-full"
                          onClick={() => remove(index)}
                        >
                          &times; Remove
                        </Button>
                      </Col>
                    </Grid>
                  </div>
                ))}
                <div className="pt-4">
                  <Button onClick={() => push(INITIAL_VALUES.cabs[0])}>
                    + Add More Price Queries
                  </Button>
                </div>
              </div>
            )}
          />
          <OnFormChange
            onChange={(formik: FormikProps<CalculatePriceSchema>) => {
              notifyOnChange(formik.values)
              if (!shouldFetchPricesOnChange.current) {
                shouldFetchPricesOnChange.current = true
                return
              }
              if (formik.isSubmitting) return
              validationSchema
                .validate(formik.values)
                .then(async () => {
                  if (formik.isSubmitting) return
                  formik.setSubmitting(true)
                  return onSubmit(formik.values, formik).then(() => {
                    formik.setSubmitting(false)
                  })
                })
                .catch(() => {})
            }}
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
      <div className="bg-white px-4 pb-4 rounded shadow">
        <CalculatePriceForm onChange={price => setPrice(price)} />
      </div>
      <footer className="mt-4">
        <mark className="inline-block text-2xl font-bold px-4 py-2 rounded">
          Total Price: {numberToLocalString(price)}
        </mark>
      </footer>
    </div>
  )
}
