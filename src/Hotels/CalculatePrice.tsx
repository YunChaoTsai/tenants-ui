import React, { useState } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldArray,
  FieldProps,
} from "formik"
import Button from "@tourepedia/button"
import moment from "moment"
import * as Validator from "yup"
import { AxiosInstance } from "axios"

import {
  InputField,
  Input,
  FormikFormGroup,
  FormGroup,
} from "./../Shared/InputField"
import { SelectHotels } from "./List"
import { IHotel, IHotelMealPlan, IHotelRoomType } from "./store"
import { SelectMealPlans } from "./../MealPlans"
import { SelectRoomTypes } from "./../RoomTypes"
import { withXHR, XHRProps } from "./../xhr"
import { Table } from "../Shared/Table"
import { Grid, Col } from "../Shared/Layout"

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
      }: FormikProps<CalculatePriceParams>) => {
        return (
          <Form noValidate>
            <fieldset style={{ minInlineSize: "auto" }}>
              <legend>Calculate Price for hotels</legend>
              <FieldArray
                name="hotels"
                render={({ name, push, remove }) => (
                  <div>
                    {values.hotels.map((hotel, index) => (
                      <fieldset key={index}>
                        <Grid>
                          <Col md={3} sm={6}>
                            <InputField
                              label="Checkin Date"
                              name={`${name}.${index}.start_date`}
                              type="date"
                            />
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
                                <ol className="list">
                                  {hotel.room_details.map(
                                    (roomDetail, index) => (
                                      <li>
                                        <Grid
                                          key={index}
                                          style={{ marginTop: "15px" }}
                                        >
                                          <Col md="auto" sm={6}>
                                            <FormikFormGroup
                                              name={`${name}.${index}.room_type`}
                                              render={({ field }) => (
                                                <SelectRoomTypes
                                                  {...field}
                                                  label="Room Type"
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
                                          <Col md="auto" sm={6}>
                                            <InputField
                                              name={`${name}.${index}.no_of_rooms`}
                                              label="Number of rooms"
                                              type="number"
                                              min={1}
                                              max={1000}
                                            />
                                          </Col>
                                          <Col>
                                            <InputField
                                              name={`${name}.${index}.adults_with_extra_bed`}
                                              label="Adults with extra bed"
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
                                              label="Children with extra bed"
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
                                              label="Children without extra bed"
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
                                                  push(
                                                    hotel.room_details[index]
                                                  )
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
                                    )
                                  )}
                                  <hr />
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
                        <FormGroup>
                          <b>Get the price for the above hotel query</b>
                          <br />
                          <br />
                          <div className="button-group">
                            <Button disabled={isSubmitting} type="submit">
                              Get Price
                            </Button>{" "}
                            {hotel.calculated_price !== undefined ? (
                              <Button disabled>
                                {hotel.calculated_price === null
                                  ? "NOT SET"
                                  : hotel.calculated_price}
                              </Button>
                            ) : null}
                          </div>
                        </FormGroup>
                        <Grid>
                          <Col sm="auto">
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
                          {values.hotels.length > 1 ? (
                            <Button
                              className="btn--secondary"
                              onClick={() => remove(index)}
                            >
                              &times; Remove This Query
                            </Button>
                          ) : null}
                        </div>
                      </fieldset>
                    ))}
                    <hr />
                    <div>
                      <Button onClick={e => push(initialValues.hotels[0])}>
                        + Add More Night and Hotels
                      </Button>
                    </div>
                  </div>
                )}
              />
            </fieldset>
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
