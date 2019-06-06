import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { Formik, FormikActions, FormikProps, Form, FieldArray } from "formik"
import Button from "@tourepedia/button"
import * as Validator from "yup"
import moment from "moment"

import { InputField, FormikFormGroup } from "./../Shared/InputField"
import { IHotel, IHotelMealPlan, IHotelRoomType } from "./store"
import { SelectMealPlans } from "./../MealPlans"
import { SelectRoomTypes } from "./../RoomTypes"
import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"
import DatePicker from "../Shared/DatePicker"

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
            <fieldset style={{ minInlineSize: "auto" }}>
              <legend>Add Hotel Price</legend>
              <FieldArray
                name="prices"
                render={({ name, remove, push }) => (
                  <ol className="list">
                    {values.prices.map((price, index) => (
                      <li key={index}>
                        <Grid>
                          <Col>
                            <DatePicker
                              label="Start Date"
                              name={`${name}.${index}.start_date`}
                            />
                          </Col>
                          <Col>
                            <DatePicker
                              label="End Date"
                              name={`${name}.${index}.end_date`}
                            />
                          </Col>
                          <Col>
                            <FormikFormGroup
                              name={`prices.${index}.meal_plan`}
                              render={({ field }) => (
                                <SelectMealPlans
                                  label="Meal Plan"
                                  {...field}
                                  searchable={false}
                                  multiple={false}
                                  options={hotel.meal_plans}
                                  onChange={(value, name) =>
                                    setFieldValue(name, value)
                                  }
                                />
                              )}
                            />
                          </Col>
                          <Col>
                            <FormikFormGroup
                              name={`prices.${index}.room_type`}
                              render={({ field }) => (
                                <SelectRoomTypes
                                  {...field}
                                  label="Room Type"
                                  searchable={false}
                                  multiple={false}
                                  options={hotel.room_types}
                                  onChange={(value: IHotelRoomType, name) => {
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
                                />
                              )}
                            />
                          </Col>
                        </Grid>
                        <fieldset>
                          <legend>Prices</legend>
                          <Grid>
                            <Col>
                              <InputField
                                label="Number of persons"
                                name={`${name}.${index}.persons`}
                                type="number"
                              />
                            </Col>
                            <Col>
                              <InputField
                                label="Base Price"
                                name={`${name}.${index}.base_price`}
                                type="number"
                              />
                            </Col>
                            <Col>
                              <InputField
                                label="Adult with extra bed price"
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
                            </Col>
                            <Col>
                              <InputField
                                label="Child with extra bed price"
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
                            </Col>
                            <Col>
                              <InputField
                                label="Child without extra bed price"
                                name={`${name}.${index}.child_without_extra_bed_price`}
                                type="number"
                              />
                            </Col>
                          </Grid>
                        </fieldset>
                        <hr />
                        <div className="button-group form-group">
                          <Button
                            className="btn--secondary"
                            onClick={_ => push(price)}
                          >
                            + Duplicate
                          </Button>
                          {values.prices.length > 1 ? (
                            <Button
                              className="btn--secondary"
                              onClick={_ => remove(index)}
                            >
                              &times; Remove
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                    <div className="form-group">
                      <hr />
                      <Button onClick={_ => push(initialValues.prices[0])}>
                        + Add More
                      </Button>
                    </div>
                  </ol>
                )}
              />
              <footer>
                <Button primary type="submit" disabled={isSubmitting}>
                  Save
                </Button>
                <Link to=".." className="btn">
                  Cancel
                </Link>
              </footer>
            </fieldset>
          </Form>
        )}
      />
    </Fragment>
  )
}

export default withXHR(AddPrices)
