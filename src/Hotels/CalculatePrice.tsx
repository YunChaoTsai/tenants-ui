import React, { useState, useMemo, useCallback, useRef } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldArray,
  FieldProps,
  Field,
} from "formik"
import { Button, Icons, Select, useDidMount, Badge } from "@tourepedia/ui"
import moment from "moment"
import * as Validator from "yup"
import { AxiosInstance } from "axios"

import {
  InputField,
  FormikFormGroup,
  FormGroup,
  OnFormChange,
} from "./../Shared/InputField"
import { SelectHotels } from "./List"
import { IHotel, IHotelMealPlan, IHotelRoomType } from "./store"
import { SelectMealPlans } from "./../MealPlans"
import { SelectRoomTypes } from "./../RoomTypes"
import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"
import DatePicker from "../Shared/DatePicker"
import { EmptyNumberValidator } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getPrice(hotels: any) {
      return xhr.get("/prices", { params: { hotels } }).then(resp => resp.data)
    },
  }
}

export interface CalculatePriceParams {
  hotels: {
    start_date: string
    no_of_nights: number
    hotel?: IHotel
    meal_plan?: IHotelMealPlan
    rooms_detail: {
      room_type?: IHotelRoomType
      adults_with_extra_bed: number
      children_with_extra_bed: number
      children_without_extra_bed: number
      no_of_rooms: number
    }
    calculated_price?: number
    given_price?: number
    edited_given_price?: boolean
    no_price_for_dates?: Array<string>
    comments?: string
    price_calculation_string?: Array<{
      date: string
      price: number
      how: string
    }>
  }[]
}

export const validationSchema = Validator.object().shape({
  hotels: Validator.array().of(
    Validator.object().shape({
      start_date: Validator.string().required("Start Date field is required."),
      no_of_nights: EmptyNumberValidator()
        .required("Number of nights field is required")
        .integer("Number of nights should be an integer")
        .positive("Number of nights should be a positive number"),
      hotel: Validator.object().required("Hotel field is required"),
      meal_plan: Validator.object().required("Meal Plan field is required"),
      rooms_detail: Validator.object().shape({
        room_type: Validator.object().required("Room type field is required"),
        adults_with_extra_bed: EmptyNumberValidator()
          .integer("Adult with extra bed should be an interger")
          .required("Adult with extra bed is required"),
        children_with_extra_bed: EmptyNumberValidator()
          .integer("Child with extra bed should be an integer")
          .required("Child with extra bed is required"),
        children_without_extra_bed: EmptyNumberValidator()
          .integer("Child without extra bed should be an integer")
          .required("Child without extra bed is required"),
        no_of_rooms: EmptyNumberValidator()
          .positive("Number of rooms should be a positive number")
          .integer("Number of room should be an integer")
          .required("Number of rooms is required"),
      }),
    })
  ),
})

export const INITIAL_VALUES: CalculatePriceParams = {
  hotels: [
    {
      start_date: "",
      no_of_nights: 1,
      hotel: undefined,
      meal_plan: undefined,
      rooms_detail: {
        room_type: undefined,
        adults_with_extra_bed: 0,
        children_with_extra_bed: 0,
        children_without_extra_bed: 0,
        no_of_rooms: 1,
      },
      calculated_price: undefined,
      given_price: 0,
      edited_given_price: false,
      comments: "",
    },
  ],
}

interface CalculatePriceFormProps extends XHRProps {
  initialValues?: CalculatePriceParams
  onChange?: (price: number, hotels: any) => void
  bookingFrom?: string
  bookingTo?: string
}
export const CalculatePriceForm = withXHR(function CalculatePriceForm({
  initialValues = INITIAL_VALUES,
  xhr,
  onChange,
  bookingFrom,
  bookingTo,
}: CalculatePriceFormProps) {
  const notifyOnChange = useCallback(
    (flattenValues: CalculatePriceParams) => {
      onChange &&
        onChange(
          flattenValues.hotels.reduce(
            (price: number, hotel) =>
              price +
              parseFloat(
                (hotel.given_price ? hotel.given_price : 0).toString()
              ),
            0
          ),
          flattenValues.hotels.map(
            ({
              start_date,
              no_of_nights,
              rooms_detail,
              hotel,
              meal_plan,
              ...otherData
            }) => {
              const room = rooms_detail || { room_type: undefined }
              const { room_type, ...otherRoomDetails } = room
              return {
                ...otherData,
                checkin: moment(start_date)
                  .hours(0)
                  .minutes(0)
                  .seconds(0)
                  .utc()
                  .format("YYYY-MM-DD HH:mm:ss"),
                checkout: moment(start_date)
                  .add(no_of_nights - 1, "days")
                  .hours(23)
                  .minutes(59)
                  .seconds(59)
                  .utc()
                  .format("YYYY-MM-DD HH:mm:ss"),
                hotel_id: hotel && hotel.id,
                meal_plan_id: meal_plan && meal_plan.id,
                ...otherRoomDetails,
                room_type_id: room_type && room_type.id,
              }
            }
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
      values: CalculatePriceParams,
      actions: FormikActions<CalculatePriceParams>
    ) => {
      actions.setStatus()
      const hotels: any[] = []
      // flatten values so that we can show the prices for each row
      const flattenValues: CalculatePriceParams = {
        hotels: [],
      }
      values.hotels.forEach(values => {
        const {
          start_date,
          no_of_nights,
          hotel,
          meal_plan,
          rooms_detail,
        } = values
        if (hotel && start_date && no_of_nights && meal_plan && rooms_detail) {
          if (rooms_detail.room_type) {
            const {
              room_type,
              adults_with_extra_bed,
              children_with_extra_bed,
              children_without_extra_bed,
              no_of_rooms,
            } = rooms_detail
            flattenValues.hotels.push({
              ...values,
              start_date: moment(start_date).format("YYYY-MM-DD"),
              no_of_nights,
            })
            hotels.push({
              checkin: moment(start_date)
                .hours(0)
                .minutes(0)
                .seconds(0)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss"),
              checkout: moment(start_date)
                .add(no_of_nights - 1, "days")
                .hours(23)
                .minutes(59)
                .seconds(59)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss"),
              hotel_id: hotel.id,
              meal_plan_id: meal_plan.id,
              room_type_id: room_type.id,
              adults_with_extra_bed,
              children_with_extra_bed,
              children_without_extra_bed,
              no_of_rooms,
            })
          }
        }
      })
      return XHR(xhr)
        .getPrice(hotels)
        .then(data => {
          flattenValues.hotels = flattenValues.hotels.map((hotel, i) => ({
            ...hotel,
            calculated_price: data.hotels[i].price,
            price_calculation_string: data.hotels[i].price_calculation_string,
            given_price: hotel.edited_given_price
              ? hotel.given_price
              : data.hotels[i].price,
            no_price_for_dates: data.hotels[i].no_price_for_dates,
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
      onSubmit={(value, actions) =>
        onSubmit(value, actions).then(() => {
          actions.setSubmitting(false)
        })
      }
      render={({
        isSubmitting,
        values,
        setFieldValue,
      }: FormikProps<CalculatePriceParams>) => {
        return (
          <Form noValidate>
            <FieldArray
              name="hotels"
              render={({ name, push, remove }) => (
                <div className="border-gray-300 border-t-4">
                  {values.hotels.map((hotel, index) => (
                    <div key={index} className="border-gray-300 border-b-4">
                      <Grid>
                        <Col md={7} className="py-3">
                          <Grid>
                            <Col md={12}>
                              <Grid>
                                <Col>
                                  {bookingFrom && bookingTo ? (
                                    <FormikFormGroup
                                      name={`${name}.${index}.start_date`}
                                      render={({
                                        field,
                                      }: FieldProps<CalculatePriceParams>) => (
                                        <Select
                                          {...field}
                                          label="Checkin Date"
                                          options={bookingDates}
                                          searchable={false}
                                          placeholder="Select a date..."
                                          required
                                          onQuery={() => {}}
                                          value={bookingDates.find(
                                            d => d.name === hotel.start_date
                                          )}
                                          onChange={(startDate, name) => {
                                            setFieldValue(name, startDate.name)
                                          }}
                                        />
                                      )}
                                    />
                                  ) : (
                                    <DatePicker
                                      label="Checkin Date"
                                      name={`${name}.${index}.start_date`}
                                      required
                                    />
                                  )}
                                </Col>
                                <Col>
                                  <InputField
                                    label="Stay Nights"
                                    name={`${name}.${index}.no_of_nights`}
                                    type="number"
                                    min={1}
                                    max={1000}
                                  />
                                </Col>
                                <Col>
                                  <FormikFormGroup
                                    name={`${name}.${index}.hotel`}
                                    render={({
                                      field,
                                    }: FieldProps<CalculatePriceParams>) => (
                                      <SelectHotels
                                        {...field}
                                        label="Hotel"
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
                                    name={`${name}.${index}.meal_plan`}
                                    render={({
                                      field,
                                    }: FieldProps<CalculatePriceParams>) => (
                                      <SelectMealPlans
                                        {...field}
                                        label="Meal Plan"
                                        multiple={false}
                                        searchable={false}
                                        options={
                                          hotel.hotel
                                            ? hotel.hotel.meal_plans
                                            : []
                                        }
                                        onChange={(value, name) =>
                                          setFieldValue(name, value)
                                        }
                                      />
                                    )}
                                  />
                                </Col>
                              </Grid>
                            </Col>
                            <Col md={12}>
                              <div>
                                <Field
                                  name={`${name}.${index}.rooms_detail`}
                                  render={({
                                    field: { name, value: roomDetail },
                                  }: FieldProps<CalculatePriceParams>) => (
                                    <Grid key={index}>
                                      <Col>
                                        <FormikFormGroup
                                          name={`${name}.room_type`}
                                          render={({ field }) => (
                                            <SelectRoomTypes
                                              {...field}
                                              label="Room Type"
                                              options={
                                                hotel.hotel
                                                  ? hotel.hotel.room_types
                                                  : []
                                              }
                                              searchable={false}
                                              multiple={false}
                                              onChange={(
                                                value: IHotelRoomType,
                                                n
                                              ) => {
                                                setFieldValue(n, value)
                                                if (
                                                  !value ||
                                                  !value.allowed_extra_beds
                                                ) {
                                                  setFieldValue(
                                                    `${name}.adults_with_extra_bed`,
                                                    0
                                                  )
                                                  setFieldValue(
                                                    `${name}.children_with_extra_bed`,
                                                    0
                                                  )
                                                }
                                              }}
                                            />
                                          )}
                                        />
                                      </Col>
                                      <Col>
                                        <InputField
                                          name={`${name}.no_of_rooms`}
                                          label="No. of rooms"
                                          type="number"
                                          min={1}
                                          max={1000}
                                          onChange={e => {
                                            const value = parseInt(
                                              e.currentTarget.value,
                                              10
                                            )
                                            const {
                                              room_type,
                                              adults_with_extra_bed,
                                              children_with_extra_bed,
                                            } = roomDetail
                                            if (isNaN(value) || !room_type)
                                              return
                                            setFieldValue(
                                              e.currentTarget.name,
                                              value
                                            )
                                            const {
                                              allowed_extra_beds,
                                            } = room_type
                                            // make sure that only valid extra beds are present
                                            const validExtraBeds =
                                              allowed_extra_beds * value
                                            if (
                                              adults_with_extra_bed +
                                                children_with_extra_bed >
                                              validExtraBeds
                                            ) {
                                              // we need to remove the extra beds
                                              // first give adults with extra beds
                                              setFieldValue(
                                                `${name}.adults_with_extra_bed`,
                                                Math.min(
                                                  validExtraBeds,
                                                  adults_with_extra_bed
                                                )
                                              )
                                              // now give remaining extra beds to children
                                              setFieldValue(
                                                `${name}.children_with_extra_bed`,
                                                Math.min(
                                                  validExtraBeds -
                                                    Math.min(
                                                      validExtraBeds,
                                                      adults_with_extra_bed
                                                    ),
                                                  children_with_extra_bed
                                                )
                                              )
                                            }
                                          }}
                                        />
                                      </Col>
                                      <Col>
                                        <InputField
                                          name={`${name}.adults_with_extra_bed`}
                                          label="AWEB"
                                          type="number"
                                          min={0}
                                          max={100}
                                          disabled={
                                            !roomDetail.room_type ||
                                            !roomDetail.room_type
                                              .allowed_extra_beds
                                          }
                                          onChange={e => {
                                            const { name } = e.currentTarget
                                            const value = parseInt(
                                              e.currentTarget.value,
                                              10
                                            )
                                            const {
                                              room_type,
                                              no_of_rooms,
                                              children_with_extra_bed,
                                            } = roomDetail
                                            if (isNaN(value) || !room_type) {
                                              return
                                            }
                                            const {
                                              allowed_extra_beds,
                                            } = room_type
                                            setFieldValue(
                                              name,
                                              Math.min(
                                                allowed_extra_beds *
                                                  no_of_rooms -
                                                  children_with_extra_bed,
                                                value
                                              )
                                            )
                                          }}
                                        />
                                      </Col>
                                      <Col>
                                        <InputField
                                          name={`${name}.children_with_extra_bed`}
                                          label="CWEB"
                                          type="number"
                                          min={0}
                                          max={100}
                                          disabled={
                                            !roomDetail.room_type ||
                                            !roomDetail.room_type
                                              .allowed_extra_beds
                                          }
                                          onChange={e => {
                                            const { name } = e.currentTarget
                                            const value = parseInt(
                                              e.currentTarget.value,
                                              10
                                            )
                                            const {
                                              room_type,
                                              no_of_rooms,
                                              adults_with_extra_bed,
                                            } = roomDetail
                                            if (isNaN(value) || !room_type) {
                                              return
                                            }
                                            const {
                                              allowed_extra_beds,
                                            } = room_type
                                            setFieldValue(
                                              name,
                                              Math.min(
                                                allowed_extra_beds *
                                                  no_of_rooms -
                                                  adults_with_extra_bed,
                                                value
                                              )
                                            )
                                          }}
                                        />
                                      </Col>
                                      <Col>
                                        <InputField
                                          name={`${name}.children_without_extra_bed`}
                                          label="CWoEB"
                                          min={0}
                                          max={100}
                                          type="number"
                                        />
                                      </Col>
                                    </Grid>
                                  )}
                                />
                              </div>
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
                                {hotel.calculated_price !== undefined ? (
                                  <Badge primary>
                                    <Icons.RupeeIcon /> {hotel.calculated_price}
                                  </Badge>
                                ) : (
                                  <Button type="submit" disabled={isSubmitting}>
                                    Get Price
                                  </Button>
                                )}
                                {hotel.no_price_for_dates &&
                                hotel.no_price_for_dates.length ? (
                                  <p className="text-yellow-800">
                                    No prices available for{" "}
                                    {hotel.no_price_for_dates
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
                              <InputField
                                label="Given Price"
                                name={`${name}.${index}.given_price`}
                                type="number"
                                value={hotel.given_price}
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
                                  shouldFetchPricesOnChange.current = false
                                  setFieldValue(
                                    `${name}.${index}.edited_given_price`,
                                    true
                                  )
                                  setFieldValue(e.target.name, value)
                                }}
                                min={0}
                              />
                            </Col>
                            {hotel.price_calculation_string &&
                            hotel.price_calculation_string.length ? (
                              <Col sm={12} className="mb-2">
                                {hotel.price_calculation_string.map(
                                  ({ date, price, how }, i) => (
                                    <div key={i}>
                                      <Badge>
                                        <Icons.RupeeIcon /> {price}
                                      </Badge>
                                      <b>
                                        {moment
                                          .utc(date)
                                          .local()
                                          .format(" DD/MM/YYYY ")}
                                      </b>
                                      ({how})
                                    </div>
                                  )
                                )}
                              </Col>
                            ) : null}
                            <Col sm={12}>
                              <InputField
                                label="Comments"
                                name={`${name}.${index}.comments`}
                                maxLength={191}
                                value={hotel.comments}
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
                            onClick={() => push(hotel)}
                          >
                            + Duplicate
                          </Button>
                          <br />
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
                  <div className="mt-4">
                    <Button onClick={() => push(initialValues.hotels[0])}>
                      + Add {values.hotels.length ? "Another" : ""} Hotel Query
                    </Button>
                  </div>
                </div>
              )}
            />
            <OnFormChange
              onChange={(formik: FormikProps<CalculatePriceParams>) => {
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
        )
      }}
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
        <h3 className="m-0">Calculate Hotel Prices</h3>
      </div>
      <p>
        Please enter the desired hotel configuration query and press get price
        to get the prices.
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
