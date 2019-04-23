import React, { Fragment } from "react"
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
import * as Validator from "yup"
import Helmet from "react-helmet-async"
import Button from "@tourepedia/button"

import { InputField } from "./../Shared/InputField"
import { withXHR, XHRProps } from "./../xhr"
import { store as mealPlanStore, SelectMealPlans } from "./../MealPlans"
import { store as roomTypeStore, SelectRoomTypes } from "./../RoomTypes"
import { store as locationStore, SelectLocations } from "./../Locations"

const validationSchema = Validator.object().shape({
  name: Validator.string().required("Name field is required"),
  eb_child_age_start: Validator.number()
    .positive("Child start age should be a positive number")
    .integer("Child start age should be an integer")
    .required("Child start age is required"),
  eb_child_age_end: Validator.number()
    .positive("Child end age should be a positive number")
    .integer("Child end age should be an integer")
    .required("Child end age is required"),
  meal_plans: Validator.array().min(1, "Please select atleast one meal plan"),
  room_types: Validator.array().min(1, "Please select atleast one room type"),
  location: Validator.object().required("Location field is required"),
})
interface NewItemCredentials {
  name: string
  eb_child_age_start: number
  eb_child_age_end: number
  meal_plans: mealPlanStore.IMealPlan[]
  room_types: roomTypeStore.IRoomType[]
  location?: locationStore.ILocation
}
const initialValues: NewItemCredentials = {
  name: "",
  eb_child_age_start: 6,
  eb_child_age_end: 12,
  meal_plans: [],
  room_types: [],
  location: undefined,
}

interface NewItemProps extends RouteComponentProps, XHRProps {}
function NewItem({ xhr, navigate }: NewItemProps) {
  return (
    <Fragment>
      <Helmet>
        <title>New Hotel</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: NewItemCredentials,
          actions: FormikActions<NewItemCredentials>
        ) => {
          actions.setStatus()
          return xhr
            .post("/hotels", {
              ...values,
              meal_plans: values.meal_plans.map(mealPlan => mealPlan.id),
              room_types: values.room_types.map(roomType => roomType.id),
              location_id: values.location ? values.location.id : undefined,
            })
            .then(({ data }) => {
              const { hotel } = data
              navigate && navigate(`../${hotel.id}`)
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
        }: FormikProps<NewItemCredentials>) => {
          return (
            <Form noValidate>
              <InputField
                label="Name"
                name="name"
                placeholder="Taj Hotel"
                required
              />
              <InputField
                label="Extra bed child start age"
                name="eb_child_age_start"
                required
                type="number"
                min={1}
              />
              <InputField
                label="Extra bed child end age"
                name="eb_child_age_end"
                required
                type="number"
                min={1}
              />
              <FieldArray
                name="meal_plans"
                render={({ name }) => (
                  <div>
                    <SelectMealPlans
                      label="Meal Plan(s) served"
                      name={name}
                      value={values.meal_plans}
                      onChange={values => setFieldValue("meal_plans", values)}
                    />
                    <ErrorMessage name={name} />
                  </div>
                )}
              />
              <FieldArray
                name="room_types"
                render={({ name }) => (
                  <div>
                    <SelectRoomTypes
                      label="Room Types available"
                      name="room_types"
                      value={values.room_types}
                      onChange={values => setFieldValue("room_types", values)}
                    />
                    <ErrorMessage name={name} />
                  </div>
                )}
              />
              <Field
                name="location"
                render={({
                  field: { name, value },
                }: FieldProps<NewItemCredentials>) => (
                  <div>
                    <SelectLocations
                      label="Location"
                      name="location"
                      multiple={false}
                      value={value}
                      onChange={value => setFieldValue(name, value)}
                    />
                    <ErrorMessage name={name} />
                  </div>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                Save
              </Button>{" "}
              <Link to="..">Cancel</Link>
            </Form>
          )
        }}
      />
    </Fragment>
  )
}

export default withXHR<NewItemProps>(NewItem)
