import React, { useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldArray,
  Field,
  FieldProps,
  ErrorMessage,
} from "formik"
import Button from "@tourepedia/button"
import moment from "moment"
import * as Validator from "yup"
import { AxiosInstance } from "axios"
import { $PropertyType } from "utility-types"

import { InputField, Input } from "./../Shared/InputField"
import { SelectHotels } from "./List"
import { IHotel } from "./store"
import { SelectLocations, store as locationStore } from "./../Locations"
import { SelectMealPlans, store as mealPlanStore } from "./../MealPlans"
import { SelectRoomTypes, store as roomTypeStore } from "./../RoomTypes"
import { withXHR, XHRProps } from "./../xhr"

export function XHR(xhr: AxiosInstance) {
  return {
    getPrice(hotels: any) {
      return xhr.get("/prices", { params: { hotels } }).then(resp => resp.data)
    },
  }
}

export interface CalculatePriceParams {
  hotels: {
    start_date: string
    no_of_nights: number
    hotel?: IHotel
    meal_plan?: mealPlanStore.IMealPlan
    room_details: {
      room_type?: roomTypeStore.IRoomType
      adults_with_extra_bed: number
      children_with_extra_bed: number
      children_without_extra_bed: number
      no_of_rooms: number
    }[]
    calculated_price?: number
    given_price?: number
    comments?: string
  }[]
}

export const validationSchema = Validator.object().shape({
  hotels: Validator.array().of(
    Validator.object().shape({
      start_date: Validator.string().required("Start Date field is required."),
      no_of_nights: Validator.number()
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
            adults_with_extra_bed: Validator.number()
              .integer("Adult with extra bed should be an interger")
              .required("Adult with extra bed is required"),
            children_with_extra_bed: Validator.number()
              .integer("Child with extra bed should be an integer")
              .required("Child with extra bed is required"),
            children_without_extra_bed: Validator.number()
              .integer("Child without extra bed should be an integer")
              .required("Child without extra bed is required"),
            no_of_rooms: Validator.number()
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
      comments: "",
    },
  ],
}

interface CalculatePriceFormProps extends XHRProps {
  initialValues?: CalculatePriceParams
  onChange?: (price: number, hotels: any) => void
}
export const CalculatePriceForm = withXHR(function CalculatePriceForm({
  initialValues = INITIAL_VALUES,
  xhr,
  onChange,
}: CalculatePriceFormProps) {
  function notifyOnChange(flattenValues: CalculatePriceParams) {
    onChange &&
      onChange(
        flattenValues.hotels.reduce(
          (price: number, hotel) =>
            price + (hotel.given_price ? hotel.given_price : 0),
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
              date: moment(start_date)
                .hours(12)
                .minutes(0)
                .seconds(0)
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
  }
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(
        values: CalculatePriceParams,
        actions: FormikActions<CalculatePriceParams>
      ) => {
        actions.setStatus()
        const hotels: any[] = []
        // flatten values so that we cab show the prices for each row
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
            location &&
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
                // create a entry for all the nights, one by one
                for (let i = 0; i < no_of_nights; i++) {
                  flattenValues.hotels.push({
                    ...values,
                    start_date: moment(start_date)
                      .add(i, "days")
                      .format("YYYY-MM-DD"),
                    no_of_nights: 1,
                    room_details: [room_detail],
                  })
                  hotels.push({
                    date: moment(start_date)
                      .add(i, "days")
                      .hours(12)
                      .minutes(0)
                      .seconds(0)
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
          }
        })
        XHR(xhr)
          .getPrice(hotels)
          .then(data => {
            flattenValues.hotels = flattenValues.hotels.map((hotel, i) => ({
              ...hotel,
              calculated_price: data.hotel_prices_per_row[i],
              given_price: hotel.given_price || data.hotel_prices_per_row[i],
            }))
            actions.setValues(flattenValues)
            // we get the prices
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
        setFieldValue,
        errors,
      }: FormikProps<CalculatePriceParams>) => {
        return (
          <Form noValidate>
            <table>
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>Number of nights</th>
                  <th>Hotel</th>
                  <th>Meal Plan</th>
                  <th>Room Details</th>
                  <th>Calculated Price</th>
                  <th>Given Price</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <FieldArray
                name="hotels"
                render={({ name, push, remove }) => (
                  <tbody>
                    {values.hotels.map((hotel, index) => (
                      <tr key={index}>
                        <td>
                          <InputField
                            name={`${name}.${index}.start_date`}
                            type="date"
                          />
                        </td>
                        <td>
                          <InputField
                            name={`${name}.${index}.no_of_nights`}
                            type="number"
                          />
                        </td>
                        <td>
                          <Field
                            name={`${name}.${index}.hotel`}
                            render={({
                              field,
                            }: FieldProps<CalculatePriceParams>) => {
                              return (
                                <div>
                                  <SelectHotels
                                    multiple={false}
                                    value={field.value}
                                    onChange={value =>
                                      setFieldValue(field.name, value)
                                    }
                                  />
                                  <ErrorMessage name={field.name} />
                                </div>
                              )
                            }}
                          />
                        </td>
                        <td>
                          <Field
                            name={`${name}.${index}.meal_plan`}
                            render={({
                              field,
                            }: FieldProps<CalculatePriceParams>) => (
                              <div>
                                <SelectMealPlans
                                  searchable={false}
                                  multiple={false}
                                  value={field.value}
                                  onChange={value =>
                                    setFieldValue(field.name, value)
                                  }
                                  options={
                                    hotel.hotel ? hotel.hotel.meal_plans : []
                                  }
                                  name={field.name}
                                />
                                <ErrorMessage name={field.name} />
                              </div>
                            )}
                          />
                        </td>
                        <td>
                          <FieldArray
                            name={`${name}.${index}.room_details`}
                            render={({ name, push, remove }) => (
                              <div>
                                <ul>
                                  {hotel.room_details.map(
                                    (roomDetail, index) => (
                                      <li key={index}>
                                        <SelectMealPlans
                                          name={`${name}.${index}.room_type`}
                                          searchable={false}
                                          multiple={false}
                                          value={roomDetail.room_type}
                                          onChange={value =>
                                            setFieldValue(
                                              `${name}.${index}.room_type`,
                                              value
                                            )
                                          }
                                          options={
                                            hotel.hotel
                                              ? hotel.hotel.room_types
                                              : []
                                          }
                                          label="Room Type"
                                        />
                                        <ErrorMessage
                                          name={`${name}.${index}.room_type`}
                                        />
                                        <InputField
                                          name={`${name}.${index}.no_of_rooms`}
                                          label="Number of rooms"
                                          type="number"
                                        />
                                        <InputField
                                          name={`${name}.${index}.adults_with_extra_bed`}
                                          label="Adults with extra bed"
                                          type="number"
                                        />
                                        <InputField
                                          name={`${name}.${index}.children_with_extra_bed`}
                                          label="Children with extra bed"
                                          type="number"
                                        />
                                        <InputField
                                          name={`${name}.${index}.children_without_extra_bed`}
                                          label="Children without extra bed"
                                          type="number"
                                        />
                                        {hotel.room_details.length > 1 ? (
                                          <Button onClick={_ => remove(index)}>
                                            Remove
                                          </Button>
                                        ) : null}
                                        <Button
                                          onClick={e =>
                                            push(hotel.room_details[index])
                                          }
                                        >
                                          Duplicate
                                        </Button>
                                      </li>
                                    )
                                  )}
                                  <Button
                                    onClick={_ =>
                                      push(
                                        initialValues.hotels[0].room_details[0]
                                      )
                                    }
                                  >
                                    Add More
                                  </Button>
                                </ul>
                              </div>
                            )}
                          />
                        </td>
                        <td>
                          <Button disabled={isSubmitting} type="submit">
                            Get Price
                          </Button>
                          <div>{hotel.calculated_price}</div>
                        </td>
                        <td>
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
                              const flattenValues = {
                                hotels: values.hotels.map((hotel, i) =>
                                  i !== index
                                    ? hotel
                                    : {
                                        ...hotel,
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
                            type="string"
                            maxLength={191}
                            value={hotel.comments}
                            placeholder="Regarding pricing difference or any other"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const value = e.target.value
                              const flattenValues = {
                                hotels: values.hotels.map((hotel, i) =>
                                  i !== index
                                    ? hotel
                                    : {
                                        ...hotel,
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
                          {values.hotels.length > 1 ? (
                            <Button onClick={e => remove(index)}>Remove</Button>
                          ) : null}
                          <Button onClick={e => push(hotel)}>Duplicate</Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <Button onClick={e => push(initialValues.hotels[0])}>
                          Add More Hotel
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                )}
              />
            </table>
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
      <Link to="..">Back</Link>
      <CalculatePriceForm onChange={price => setPrice(price)} />
      <h4>Price is: {price}</h4>
    </div>
  )
}
