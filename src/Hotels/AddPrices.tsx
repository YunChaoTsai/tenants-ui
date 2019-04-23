import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldArray,
  ErrorMessage,
  Field,
} from "formik"
import Button from "@tourepedia/button"
import * as Validator from "yup"
import moment from "moment"

import { InputField } from "./../Shared/InputField"
import { IHotel, IHotelMealPlan, IHotelRoomType } from "./store"
import { SelectMealPlans } from "./../MealPlans"
import { SelectRoomTypes } from "./../RoomTypes"
import { withXHR, XHRProps } from "./../xhr"

type NewPriceCredentials = {
  prices: {
    start_date: string
    end_date: string
    base_price: number
    adult_with_extra_bed_price: number
    child_with_extra_bed_price: number
    child_without_extra_bed_price: number
    meal_plan?: IHotelMealPlan
    room_type?: IHotelRoomType
    persons: number
  }[]
}
const initialValues: NewPriceCredentials = {
  prices: [
    {
      start_date: "",
      end_date: "",
      base_price: 0,
      persons: 2,
      adult_with_extra_bed_price: 0,
      child_with_extra_bed_price: 0,
      child_without_extra_bed_price: 0,
      meal_plan: undefined,
      room_type: undefined,
    },
  ],
}

const validationSchema = Validator.object().shape({
  prices: Validator.array().of(
    Validator.object().shape({
      start_date: Validator.string().required("Start date field is required"),
      end_date: Validator.string().required("End date field is required"),
      base_price: Validator.number()
        .required("Base price field is required")
        .positive("Price should be positive"),
      persons: Validator.number()
        .required("Persons field is required")
        .integer()
        .positive("Persons should be positive number"),
      adult_with_extra_bed_price: Validator.number()
        .required("Price for adult with extra bed is required")
        .min(0, "Price should not be negative"),
      child_with_extra_bed_price: Validator.number()
        .required("Price for child with extra bed is required")
        .min(0, "Price should not be negative"),
      child_without_extra_bed_price: Validator.number()
        .nullable(true)
        .min(0, "Price should not be negative")
        .required("Price for child without extra bed is required"),
      meal_plan: Validator.object().required("Meal plan should be selected"),
      room_type: Validator.object().required("Room type should be selected"),
    })
  ),
})

interface AddPricesProps extends RouteComponentProps, XHRProps {
  hotel: IHotel
}
function AddPrices({ hotel, xhr, navigate }: AddPricesProps) {
  return (
    <Fragment>
      <Helmet>
        <title>Add Prices</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: NewPriceCredentials,
          actions: FormikActions<NewPriceCredentials>
        ) => {
          actions.setStatus()
          return xhr
            .post(`/hotels/${hotel.id}/prices`, {
              prices: values.prices.reduce(
                (
                  carry,
                  {
                    meal_plan: mealPlan,
                    room_type: roomType,
                    start_date,
                    end_date,
                    ...otherValues
                  }
                ) => {
                  const prices: any = []
                  prices.push({
                    ...otherValues,
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
                    meal_plan_id: mealPlan && mealPlan.id,
                    room_type_id: roomType && roomType.id,
                  })
                  return carry.concat(prices)
                },
                []
              ),
            })
            .then(resp => {
              navigate && navigate("..")
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
          setFieldValue,
          values,
        }: FormikProps<NewPriceCredentials>) => (
          <Form noValidate>
            <FieldArray
              name="prices"
              render={({ name, remove, push }) => (
                <table>
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Meal Plans</th>
                      <th>Room Types</th>
                      <th>Base Price</th>
                      <th title="Number of persons this base price is applicable to">
                        Persons
                      </th>
                      <th title="Adult with extra bed price">A.W.E.B. Price</th>
                      <th title="Child with extra bed price">C.W.E.B. Price</th>
                      <th title="Child without extra bed price">
                        C.Wo.E.B. Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {values.prices.map((price, index) => (
                      <tr key={index}>
                        <td>
                          <InputField
                            name={`${name}.${index}.start_date`}
                            type="date"
                          />
                        </td>
                        <td>
                          <InputField
                            name={`${name}.${index}.end_date`}
                            type="date"
                          />
                        </td>
                        <td>
                          <FieldArray
                            name={`prices.${index}.meal_plan`}
                            render={({ name }) => (
                              <div>
                                <SelectMealPlans
                                  name={name}
                                  searchable={false}
                                  multiple={false}
                                  options={hotel.meal_plans}
                                  onChange={value => setFieldValue(name, value)}
                                  value={price.meal_plan}
                                />
                                <ErrorMessage name={name} />
                              </div>
                            )}
                          />
                        </td>
                        <td>
                          <FieldArray
                            name={`prices.${index}.room_type`}
                            render={({ name }) => (
                              <div>
                                <SelectRoomTypes
                                  searchable={false}
                                  multiple={false}
                                  options={hotel.room_types}
                                  onChange={(value?: IHotelRoomType) => {
                                    setFieldValue(name, value)
                                    if (!value || !value.allowed_extra_beds) {
                                      setFieldValue(
                                        `prices.${index}.adult_with_extra_bed_price`,
                                        0
                                      )
                                      setFieldValue(
                                        `prices.${index}.child_with_extra_bed_price`,
                                        0
                                      )
                                    }
                                  }}
                                  value={price.room_type}
                                />
                                <ErrorMessage name={name} />
                              </div>
                            )}
                          />
                        </td>
                        <td>
                          <InputField
                            name={`${name}.${index}.base_price`}
                            type="number"
                          />
                        </td>
                        <td>
                          <InputField
                            name={`${name}.${index}.persons`}
                            type="number"
                          />
                        </td>
                        <td>
                          <InputField
                            name={`${name}.${index}.adult_with_extra_bed_price`}
                            type="number"
                            title={
                              !price.room_type
                                ? "Please select a room type"
                                : !price.room_type.allowed_extra_beds
                                ? "No extra bed allowed"
                                : undefined
                            }
                            disabled={
                              !price.room_type ||
                              !price.room_type.allowed_extra_beds
                            }
                          />
                        </td>
                        <td>
                          <InputField
                            name={`${name}.${index}.child_with_extra_bed_price`}
                            type="number"
                            title={
                              !price.room_type
                                ? "Please select a room type"
                                : !price.room_type.allowed_extra_beds
                                ? "No extra bed allowed"
                                : undefined
                            }
                            disabled={
                              !price.room_type ||
                              !price.room_type.allowed_extra_beds
                            }
                          />
                        </td>
                        <td>
                          <InputField
                            name={`${name}.${index}.child_without_extra_bed_price`}
                            type="number"
                          />
                        </td>
                        <td>
                          {values.prices.length > 1 ? (
                            <Button onClick={_ => remove(index)}>Remove</Button>
                          ) : null}
                          <Button onClick={_ => push(price)}>Duplicate</Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <Button onClick={_ => push(initialValues.prices[0])}>
                          Add More
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>{" "}
            <Link to="..">Cancel</Link>
          </Form>
        )}
      />
    </Fragment>
  )
}

export default withXHR(AddPrices)
