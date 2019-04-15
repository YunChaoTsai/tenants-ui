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
import { IHotel } from "./store"
import { SelectMealPlans, store as mealPlanStore } from "./../MealPlans"
import { SelectRoomTypes, store as roomTypeStore } from "./../RoomTypes"
import { SelectLocations, store as locationStore } from "./../Locations"
import { withXHR, XHRProps } from "./../xhr"

type NewPriceCredentials = {
  prices: {
    start_date: string
    end_date: string
    base_price: number
    a_w_e_b: number
    c_w_e_b: number
    c_wo_e_b: number
    meal_plans: mealPlanStore.IMealPlan[]
    room_types: roomTypeStore.IRoomType[]
    persons: number
    locations: locationStore.ILocation[]
  }[]
}
const initialValues: NewPriceCredentials = {
  prices: [
    {
      start_date: "",
      end_date: "",
      base_price: 0,
      persons: 2,
      a_w_e_b: 0,
      c_w_e_b: 0,
      c_wo_e_b: 0,
      meal_plans: [],
      room_types: [],
      locations: [],
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
      a_w_e_b: Validator.number()
        .required("Price for adult with extra bed is required")
        .positive("Price should be positive"),
      c_w_e_b: Validator.number()
        .required("Price for child with extra bed is required")
        .positive("Price should be positive"),
      c_wo_e_b: Validator.number()
        .required("Price for child without extra bed is required")
        .positive("Price should be positive"),
      meal_plans: Validator.array().min(
        1,
        "Atleast one meal plan should be selected"
      ),
      room_types: Validator.array().min(
        1,
        "Atleast one room type should be selected"
      ),
      locations: Validator.array().min(
        1,
        "Atleast one locations should be selected"
      ),
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
                    locations,
                    meal_plans,
                    room_types,
                    start_date,
                    end_date,
                    ...otherValues
                  }
                ) => {
                  const prices: any = []
                  locations.forEach(location => {
                    meal_plans.forEach(mealPlan => {
                      room_types.forEach(roomType => {
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
                          location_id: location.id,
                          meal_plan_id: mealPlan.id,
                          room_type_id: roomType.id,
                        })
                      })
                    })
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
                      <th>Locations</th>
                      <th>Meal Plans</th>
                      <th>Room Types</th>
                      <th>Base Price</th>
                      <th title="Number of persons this base price is applicable to">
                        Persons
                      </th>
                      <th title="Adult with extra bed price">A.W.E.B.</th>
                      <th title="Child with extra bed price">C.W.E.B.</th>
                      <th title="Child without extra bed price">C.Wo.E.B.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {values.prices.map((value, index) => (
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
                            name={`prices.${index}.locations`}
                            render={({ name }) => (
                              <div>
                                <SelectLocations
                                  searchable={false}
                                  options={hotel.locations}
                                  onChange={values =>
                                    setFieldValue(name, values)
                                  }
                                  labelKey="short_name"
                                  value={values.prices[index].locations}
                                  name={name}
                                />
                                <ErrorMessage name={name} />
                              </div>
                            )}
                          />
                        </td>
                        <td>
                          <FieldArray
                            name={`prices.${index}.meal_plans`}
                            render={({ name }) => (
                              <div>
                                <SelectMealPlans
                                  name={name}
                                  searchable={false}
                                  options={hotel.meal_plans}
                                  onChange={values =>
                                    setFieldValue(name, values)
                                  }
                                  value={values.prices[index].meal_plans}
                                />
                                <ErrorMessage name={name} />
                              </div>
                            )}
                          />
                        </td>
                        <td>
                          <FieldArray
                            name={`prices.${index}.room_types`}
                            render={({ name }) => (
                              <div>
                                <SelectRoomTypes
                                  searchable={false}
                                  options={hotel.room_types}
                                  onChange={values =>
                                    setFieldValue(name, values)
                                  }
                                  value={values.prices[index].room_types}
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
                            name={`${name}.${index}.a_w_e_b`}
                            type="number"
                          />
                        </td>
                        <td>
                          <InputField
                            name={`${name}.${index}.c_w_e_b`}
                            type="number"
                          />
                        </td>
                        <td>
                          <InputField
                            name={`${name}.${index}.c_wo_e_b`}
                            type="number"
                          />
                        </td>
                        <td>
                          {values.prices.length > 1 ? (
                            <Button onClick={e => remove(index)}>Remove</Button>
                          ) : null}
                          <Button onClick={e => push(values.prices[index])}>
                            Duplicate
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <Button onClick={e => push(initialValues.prices[0])}>
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
