import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, FormikActions, FormikProps, Form, FieldArray } from "formik"
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
  eb_child_age_start: Validator.number().required(
    "Child start age is required"
  ),
  eb_child_age_end: Validator.number().required("Child end age is required"),
})
interface NewItemCredentials {
  name: string
  eb_child_age_start: number
  eb_child_age_end: number
  meal_plans: mealPlanStore.IMealPlan[]
  room_types: roomTypeStore.IRoomType[]
  locations: locationStore.ILocation[]
}
const initialValues: NewItemCredentials = {
  name: "",
  eb_child_age_start: 6,
  eb_child_age_end: 12,
  meal_plans: [],
  room_types: [],
  locations: [],
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
              locations: values.locations.map(location => location.id),
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
              />
              <InputField
                label="Extra bed child end age"
                name="eb_child_age_end"
                required
              />
              <SelectMealPlans
                label="Meal Plan(s) served"
                name="meal_plans"
                value={values.meal_plans}
                onChange={values => setFieldValue("meal_plans", values)}
              />
              <SelectRoomTypes
                label="Room Types available"
                name="room_types"
                value={values.room_types}
                onChange={values => setFieldValue("room_types", values)}
              />
              <SelectLocations
                label="Locations"
                name="locations"
                value={values.locations}
                onChange={values => setFieldValue("locations", values)}
              />
              <Button type="submit">Save</Button> <Link to="..">Cancel</Link>
            </Form>
          )
        }}
      />
    </Fragment>
  )
}

export default withXHR<NewItemProps>(NewItem)
