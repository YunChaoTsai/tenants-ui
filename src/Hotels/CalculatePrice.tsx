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
import { Button, Icons, Select, useDidMount } from "@tourepedia/ui"
import moment from "moment"
import * as Validator from "yup"
import { AxiosInstance } from "axios"

import {
  InputField,
  Input,
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
    room_details: {
      room_type?: IHotelRoomType
      adults_with_extra_bed: number
      children_with_extra_bed: number
      children_without_extra_bed: number
      no_of_rooms: number
    }[]
    calculated_price?: number
    given_price?: number
    edited_given_price?: boolean
    no_price_for_dates?: Array<string>
    comments?: string
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
      room_details: Validator.array()
        .of(
          Validator.object().shape({
            room_type: Validator.object().required(
              "Room type field is required"
            ),
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
          })
        )
        .min(1),
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
      room_details: [
        {
          room_type: undefined,
          adults_with_extra_bed: 0,
          children_with_extra_bed: 0,
          children_without_extra_bed: 0,
          no_of_rooms: 1,
        },
      ],
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
              room_details,
              hotel,
              meal_plan,
              ...otherData
            }) => {
              const room =
                room_details && room_details.length > 0
                  ? room_details[0]
                  : { room_type: undefined }
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
          room_details,
        } = values
        if (
          hotel &&
          start_date &&
          no_of_nights &&
          meal_plan &&
          room_details &&
          room_details.length > 0
        ) {
          room_details.forEach(room_detail => {
            if (room_detail.room_type) {
              const {
                room_type,
                adults_with_extra_bed,
                children_with_extra_bed,
                children_without_extra_bed,
                no_of_rooms,
              } = room_detail
              flattenValues.hotels.push({
                ...values,
                start_date: moment(start_date).format("YYYY-MM-DD"),
                no_of_nights,
                room_details: [room_detail],
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
          })
        }
      })
      return XHR(xhr)
        .getPrice(hotels)
        .then(data => {
          flattenValues.hotels = flattenValues.hotels.map((hotel, i) => ({
            ...hotel,
            calculated_price: data.hotels[i].price,
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
                <div>
                  {values.hotels.map((hotel, index) => (
                    <fieldset key={index}>
                      <Grid>
                        <Col md={3} sm={6}>
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
                        <Col md={3} sm={6}>
                          <InputField
                            label="Number of nights"
                            name={`${name}.${index}.no_of_nights`}
                            type="number"
                            min={1}
                            max={1000}
                          />
                        </Col>
                        <Col md={3} sm={6}>
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
                        <Col md={3} sm={6}>
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
                                  hotel.hotel ? hotel.hotel.meal_plans : []
                                }
                                onChange={(value, name) =>
                                  setFieldValue(name, value)
                                }
                              />
                            )}
                          />
                        </Col>
                      </Grid>
                      <div>
                        <FieldArray
                          name={`${name}.${index}.room_details`}
                          render={({ name, push, remove }) => (
                            <fieldset>
                              <legend>Room Details</legend>
                              <ol>
                                {hotel.room_details.map((roomDetail, index) => (
                                  <li
                                    key={index}
                                    className="border-b pb-2 mb-2"
                                  >
                                    <Grid key={index}>
                                      <Col md="auto" sm={6}>
                                        <FormikFormGroup
                                          name={`${name}.${index}.room_type`}
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
                                                    `${name}.${index}.adults_with_extra_bed`,
                                                    0
                                                  )
                                                  setFieldValue(
                                                    `${name}.${index}.children_with_extra_bed`,
                                                    0
                                                  )
                                                }
                                              }}
                                            />
                                          )}
                                        />
                                      </Col>
                                      <Col md sm={6}>
                                        <InputField
                                          name={`${name}.${index}.no_of_rooms`}
                                          label="No. of rooms"
                                          type="number"
                                          min={1}
                                          max={1000}
                                        />
                                      </Col>
                                      <Col>
                                        <InputField
                                          name={`${name}.${index}.adults_with_extra_bed`}
                                          label="Adults w/ eb"
                                          type="number"
                                          min={0}
                                          max={10}
                                          disabled={
                                            !roomDetail.room_type ||
                                            !roomDetail.room_type
                                              .allowed_extra_beds
                                          }
                                        />
                                      </Col>
                                      <Col>
                                        <InputField
                                          name={`${name}.${index}.children_with_extra_bed`}
                                          label="Children w/ eb"
                                          type="number"
                                          min={0}
                                          max={10}
                                          disabled={
                                            !roomDetail.room_type ||
                                            !roomDetail.room_type
                                              .allowed_extra_beds
                                          }
                                        />
                                      </Col>
                                      <Col>
                                        <InputField
                                          name={`${name}.${index}.children_without_extra_bed`}
                                          label="Children w/o eb"
                                          min={0}
                                          max={10}
                                          type="number"
                                        />
                                      </Col>
                                      <Col sm={12}>
                                        <div className="button-group">
                                          <Button
                                            className="btn--secondary"
                                            onClick={() =>
                                              push(hotel.room_details[index])
                                            }
                                          >
                                            + Duplicate
                                          </Button>
                                          {hotel.room_details.length > 1 ? (
                                            <Button
                                              className="btn--secondary"
                                              onClick={() => remove(index)}
                                            >
                                              &times; Remove
                                            </Button>
                                          ) : null}
                                        </div>
                                      </Col>
                                    </Grid>
                                  </li>
                                ))}
                                <Button
                                  className="btn--secondary"
                                  onClick={_ =>
                                    push(
                                      initialValues.hotels[0].room_details[0]
                                    )
                                  }
                                >
                                  + Add More Room Types
                                </Button>
                              </ol>
                            </fieldset>
                          )}
                        />
                      </div>
                      <Grid>
                        <Col>
                          <FormGroup>
                            <div className="mb-1 white-space-pre">
                              Calculated Price
                            </div>
                            {hotel.calculated_price !== undefined ? (
                              <mark className="inline-block mb-2 text-lg font-semibold">
                                {hotel.calculated_price}
                              </mark>
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
                          <FormGroup>
                            <label>Given Price</label>
                            <Input
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
                          </FormGroup>
                        </Col>
                        <Col>
                          <FormGroup>
                            <label>Comments</label>
                            <Input
                              name={`${name}.${index}.comments`}
                              as="textarea"
                              maxLength={191}
                              value={hotel.comments}
                              placeholder="Regarding pricing difference or any other"
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                const value = e.target.value
                                shouldFetchPricesOnChange.current = false
                                setFieldValue(e.target.name, value)
                              }}
                            />
                          </FormGroup>
                        </Col>
                      </Grid>
                      <hr />
                      <div className="button-group form-group">
                        <Button
                          className="btn--secondary"
                          onClick={() => push(hotel)}
                        >
                          + Duplicate This Query
                        </Button>
                        <Button
                          className="btn--secondary"
                          onClick={() => remove(index)}
                        >
                          &times; Remove This Query
                        </Button>
                      </div>
                    </fieldset>
                  ))}
                  <div>
                    <Button onClick={() => push(initialValues.hotels[0])}>
                      + Add More Night and Hotels
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
