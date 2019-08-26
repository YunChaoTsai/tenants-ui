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
import { Button, Icons, Select, useDidMount, ButtonGroup } from "@tourepedia/ui"
import moment from "moment"
import * as Validator from "yup"
import { AxiosInstance } from "axios"

import {
  InputField,
  FormikFormGroup,
  OnFormChange,
} from "./../Shared/InputField"

import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"
import DatePicker from "../Shared/DatePicker"
import { EmptyNumberValidator } from "../utils"
import {
  SelectOtherExtraServices,
  store as extraServiceStore,
} from "./../ExtraServices"

export function XHR(xhr: AxiosInstance) {
  return {
    async getPrice(other_extras: any) {
      return Promise.resolve({ other_extras })
      // return xhr
      //   .get("/prices", { params: { other_extras } })
      //   .then(resp => resp.data)
    },
  }
}

export interface ExtraServicesParams {
  other_extras: {
    service?: extraServiceStore.IExtraService
    price?: number
    date?: string
    comments?: string
  }[]
}

export const validationSchema = Validator.object().shape({
  other_extras: Validator.array().of(
    Validator.object().shape({
      service: Validator.object()
        .typeError("Service field is required")
        .required("Service field is required"),
      date: Validator.string(),
      price: EmptyNumberValidator().positive("Price should be positive"),
      comments: Validator.string(),
    })
  ),
})

export const INITIAL_VALUES: ExtraServicesParams = {
  other_extras: [
    {
      service: undefined,
      date: "",
      price: undefined,
      comments: "",
    },
  ],
}

interface ExtraServicesFormProps extends XHRProps {
  initialValues?: ExtraServicesParams
  onChange?: (price: number, data: any) => void
  bookingFrom?: string
  bookingTo?: string
  shouldEmptyInitialValues?: boolean
}
export const ExtraServicesForm = withXHR(function ExtraServicesForm({
  initialValues: initialValuesProp,
  shouldEmptyInitialValues = true,
  xhr,
  onChange,
  bookingFrom,
  bookingTo,
}: ExtraServicesFormProps) {
  const initialValues =
    initialValuesProp ||
    (shouldEmptyInitialValues ? { other_extras: [] } : INITIAL_VALUES)
  const notifyOnChange = useCallback(
    (flattenValues: ExtraServicesParams) => {
      onChange &&
        onChange(
          flattenValues.other_extras.reduce(
            (price: number, cab) =>
              price + parseFloat((cab.price ? cab.price : 0).toString()),
            0
          ),
          flattenValues.other_extras.map(({ service, date, ...otherData }) => {
            return {
              ...otherData,
              date: date
                ? moment(date)
                    .hours(0)
                    .minutes(0)
                    .seconds(0)
                    .utc()
                    .format("YYYY-MM-DD HH:mm:ss")
                : "",
              service: service ? service.name : undefined,
            }
          })
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
      values: ExtraServicesParams,
      actions: FormikActions<ExtraServicesParams>
    ) => {
      actions.setStatus()
      const other_extras: any[] = []
      // flatten values so that we can show the prices for each row
      const flattenValues: ExtraServicesParams = {
        other_extras: [],
      }
      values.other_extras.forEach(values => {
        const { date, service, ...otherData } = values
        if (service) {
          flattenValues.other_extras.push({
            ...values,
            date: moment(date).format("YYYY-MM-DD"),
          })
          other_extras.push({
            ...otherData,
            date: date
              ? moment(date)
                  .hours(0)
                  .minutes(0)
                  .seconds(0)
                  .utc()
                  .format("YYYY-MM-DD HH:mm:ss")
              : "",
            service: service ? service.name : undefined,
          })
        }
      })
      return XHR(xhr)
        .getPrice(other_extras)
        .then(data => {
          flattenValues.other_extras = flattenValues.other_extras.map(
            (item, i) => ({
              ...item,
              price: data.other_extras[i].price,
            })
          )
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
      onSubmit={(value, actions) =>
        onSubmit(value, actions).then(() => {
          actions.setSubmitting(false)
        })
      }
      render={({
        isSubmitting,
        values,
        setFieldValue,
      }: FormikProps<ExtraServicesParams>) => {
        return (
          <Form noValidate>
            <FieldArray
              name="other_extras"
              render={({ name, push, remove }) => (
                <div>
                  {values.other_extras.map((quote_extra, index) => (
                    <div key={index} className="border-gray-300 border-b-4">
                      <Grid>
                        <Col>
                          <FormikFormGroup
                            name={`${name}.${index}.service`}
                            render={({
                              field,
                            }: FieldProps<ExtraServicesParams>) => (
                              <SelectOtherExtraServices
                                {...field}
                                label="Service"
                                placeholder="Select or add a service..."
                                required
                                creatable
                                fetchOnMount
                                onChange={(value, name) => {
                                  setFieldValue(name, value)
                                }}
                              />
                            )}
                          />
                        </Col>
                        <Col>
                          <InputField
                            label="Price"
                            name={`${name}.${index}.price`}
                            type="number"
                            placeholder="3000"
                            min={0}
                          />
                        </Col>
                        <Col>
                          {bookingFrom && bookingTo ? (
                            <FormikFormGroup
                              name={`${name}.${index}.date`}
                              render={({
                                field,
                              }: FieldProps<ExtraServicesParams>) => (
                                <Select
                                  {...field}
                                  label="Date"
                                  options={bookingDates}
                                  searchable={false}
                                  placeholder="Select a date..."
                                  required
                                  value={bookingDates.find(
                                    d => d.name === quote_extra.date
                                  )}
                                  onChange={(startDate, name) => {
                                    setFieldValue(name, startDate.name)
                                  }}
                                />
                              )}
                            />
                          ) : (
                            <DatePicker
                              label="Date"
                              name={`${name}.${index}.date`}
                              required
                            />
                          )}
                        </Col>
                        <Col>
                          <InputField
                            name={`${name}.${index}.comments`}
                            label="Comments"
                            placeholder="Any comments regarding service"
                          />
                        </Col>
                        <Col className="pt-4 border-l text-right">
                          <ButtonGroup>
                            <Button
                              className="btn--secondary"
                              onClick={() => push(quote_extra)}
                            >
                              + Duplicate
                            </Button>
                            <Button
                              className="btn--secondary"
                              onClick={() => remove(index)}
                            >
                              &times; Remove
                            </Button>
                          </ButtonGroup>
                        </Col>
                      </Grid>
                    </div>
                  ))}
                  <div className="mt-4">
                    <Button
                      onClick={() => push(INITIAL_VALUES.other_extras[0])}
                    >
                      + Add {values.other_extras.length ? "Another" : ""} Quote
                      Extra Service
                    </Button>
                  </div>
                </div>
              )}
            />
            <OnFormChange
              onChange={(formik: FormikProps<ExtraServicesParams>) => {
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
            <button type="submit" className="invisible">
              Get Price
            </button>
          </Form>
        )
      }}
    />
  )
})

export default function ExtraServices({  }: RouteComponentProps) {
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
        <h3 className="m-0">Calculate Quote Extra Service Prices</h3>
      </div>
      <p>
        Add any extra services like off road dinner, side tracking etc that are
        with overall trip package
      </p>
      <ExtraServicesForm onChange={price => setPrice(price)} />
      <footer className="mt-8 pb-8">
        <h4>
          <mark>Total Cost Price: {price}</mark>
        </h4>
      </footer>
    </div>
  )
}
