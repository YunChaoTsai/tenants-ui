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

import { InputField } from "./../Shared/InputField"
import { SelectHotels } from "./List"
import { IHotel } from "./store"
import { SelectLocations, store as locationStore } from "./../Locations"
import { SelectMealPlans, store as mealPlanStore } from "./../MealPlans"
import { SelectRoomTypes, store as roomTypeStore } from "./../RoomTypes"
import { withXHR, XHRProps } from "./../xhr"

interface CalculatePriceParams {
  hotels: {
    start_date: string
    no_of_nights: number
    hotel?: IHotel
    location?: locationStore.ILocation
    meal_plan?: mealPlanStore.IMealPlan
    room_details: {
      room_type?: roomTypeStore.IRoomType
      a_w_e_b: number
      c_w_e_b: number
      c_wo_e_b: number
      no_of_rooms: number
    }[]
  }[]
}

const validationSchema = Validator.object().shape({
  hotels: Validator.array().of(
    Validator.object().shape({
      start_date: Validator.string().required("Start Date field is required."),
      no_of_nights: Validator.number()
        .required("Number of nights field is required")
        .integer("Number of nights should be an integer")
        .positive("Number of nights should be a positive number"),
      hotel: Validator.object().required("Hotel field is required"),
      location: Validator.object().required("Location field is required"),
      meal_plan: Validator.object().required("Meal Plan field is required"),
      room_details: Validator.array()
        .of(
          Validator.object().shape({
            room_type: Validator.object().required(
              "Room type field is required"
            ),
            a_w_e_b: Validator.number()
              .integer("Adult with extra bed should be an interger")
              .required("Adult with extra bed is required"),
            c_w_e_b: Validator.number()
              .integer("Child with extra bed should be an integer")
              .required("Child with extra bed is required"),
            c_wo_e_b: Validator.number()
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

const initialValues: CalculatePriceParams = {
  hotels: [
    {
      start_date: "",
      no_of_nights: 1,
      hotel: undefined,
      location: undefined,
      meal_plan: undefined,
      room_details: [
        {
          room_type: undefined,
          a_w_e_b: 0,
          c_w_e_b: 0,
          c_wo_e_b: 0,
          no_of_rooms: 1,
        },
      ],
    },
  ],
}

interface CalculatePriceProps extends RouteComponentProps, XHRProps {}
function CalculatePrice({ xhr }: CalculatePriceProps) {
  const [price, setPrice] = useState<number>(0)
  return (
    <div>
      <Link to="..">Back</Link>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: CalculatePriceParams,
          actions: FormikActions<CalculatePriceParams>
        ) => {
          const hotels: any[] = []
          values.hotels.forEach(values => {
            const {
              start_date,
              no_of_nights,
              hotel,
              location,
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
                    a_w_e_b,
                    c_w_e_b,
                    c_wo_e_b,
                    no_of_rooms,
                  } = room_detail
                  hotels.push({
                    start_date: moment(start_date)
                      .hours(12)
                      .minutes(0)
                      .seconds(1)
                      .utc()
                      .format("YYYY-MM-DD HH:mm:ss"),
                    end_date: moment(start_date)
                      .add(no_of_nights, "days")
                      .hours(12)
                      .minutes(0)
                      .seconds(0)
                      .utc()
                      .format("YYYY-MM-DD HH:mm:ss"),
                    hotel_id: hotel.id,
                    location_id: location.id,
                    meal_plan_id: meal_plan.id,
                    room_type_id: room_type.id,
                    a_w_e_b,
                    c_w_e_b,
                    c_wo_e_b,
                    no_of_rooms,
                  })
                }
              })
            }
          })
          xhr
            .get("/prices", { params: { hotels } })
            .then(({ data }) => {
              setPrice(data.price)
              // we get the prices
              actions.setSubmitting(false)
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
              <FieldArray
                name="hotels"
                render={({ name, push, remove }) => (
                  <ul>
                    {values.hotels.map((hotel, index) => (
                      <li key={index}>
                        <InputField
                          name={`${name}.${index}.start_date`}
                          label="Start Date"
                          type="date"
                        />
                        <InputField
                          name={`${name}.${index}.no_of_nights`}
                          label="Number of nights"
                          type="number"
                        />
                        <Field
                          name={`${name}.${index}.hotel`}
                          render={({
                            field,
                          }: FieldProps<CalculatePriceParams>) => {
                            return (
                              <div>
                                <SelectHotels
                                  label="Hotel"
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
                        <Field
                          name={`${name}.${index}.location`}
                          render={({
                            field,
                          }: FieldProps<CalculatePriceParams>) => (
                            <div>
                              <SelectLocations
                                searchable={false}
                                multiple={false}
                                value={field.value}
                                onChange={value =>
                                  setFieldValue(field.name, value)
                                }
                                options={
                                  hotel.hotel ? hotel.hotel.locations : []
                                }
                                name={field.name}
                                label="Location"
                              />
                              <ErrorMessage name={field.name} />
                            </div>
                          )}
                        />
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
                                label="Meal Plan"
                              />
                              <ErrorMessage name={field.name} />
                            </div>
                          )}
                        />
                        <FieldArray
                          name={`${name}.${index}.room_details`}
                          render={({ name, push, remove }) => (
                            <div>
                              Room Details
                              <ul>
                                {hotel.room_details.map((roomDetail, index) => (
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
                                      name={`${name}.${index}.a_w_e_b`}
                                      label="Adult with extra bed"
                                      type="number"
                                    />
                                    <InputField
                                      name={`${name}.${index}.c_w_e_b`}
                                      label="Child with extra bed"
                                      type="number"
                                    />
                                    <InputField
                                      name={`${name}.${index}.c_wo_e_b`}
                                      label="Child without extra bed"
                                      type="number"
                                    />
                                    {hotel.room_details.length > 1 ? (
                                      <Button onClick={e => remove(index)}>
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
                                ))}
                                <Button
                                  onClick={e =>
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
                        {values.hotels.length > 1 ? (
                          <Button onClick={e => remove(index)}>Remove</Button>
                        ) : null}
                        <Button onClick={e => push(hotel)}>Duplicate</Button>
                      </li>
                    ))}
                    <Button onClick={e => push(initialValues.hotels[0])}>
                      Add More Hotel
                    </Button>
                  </ul>
                )}
              />
              <Button disabled={isSubmitting} type="submit">
                Get Price
              </Button>
              <h4>Calculate price: {price}</h4>
            </Form>
          )
        }}
      />
    </div>
  )
}

export default withXHR(CalculatePrice)
