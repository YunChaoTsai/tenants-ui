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
  stars: Validator.number()
    .positive("Star rating field should a positive integer.")
    .integer("Star rating field should be positive integer")
    .required("Stars rating field is required"),
  eb_child_age_start: Validator.number()
    .positive("Child start age should be a positive number")
    .integer("Child start age should be an integer")
    .required("Child start age is required"),
  eb_child_age_end: Validator.number()
    .positive("Child end age should be a positive number")
    .integer("Child end age should be an integer")
    .required("Child end age is required"),
  meal_plans: Validator.array().min(1, "Please select atleast one meal plan"),
  room_types: Validator.array()
    .of(
      Validator.object().shape({
        room_type: Validator.object().required("Please select a room type"),
        allowed_extra_beds: Validator.number()
          .typeError("Allowed extra bed must be a number")
          .integer("Allowed extra beds should be an integer")
          .min(0, "Allowed extra beds should not be negative")
          .required("Allowed extra beds field is required"),
      })
    )
    .min(1, "Please select atleast one room type"),
  location: Validator.object().required("Location field is required"),
})
interface NewItemCredentials {
  name: string
  stars: number
  eb_child_age_start: number
  eb_child_age_end: number
  meal_plans: mealPlanStore.IMealPlan[]
  room_types: {
    room_type?: roomTypeStore.IRoomType
    allowed_extra_beds: number
  }[]
  location?: locationStore.ILocation
}
const initialValues: NewItemCredentials = {
  name: "",
  stars: 1,
  eb_child_age_start: 6,
  eb_child_age_end: 12,
  meal_plans: [],
  room_types: [{ room_type: undefined, allowed_extra_beds: 1 }],
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
              room_types: values.room_types.map(
                ({ room_type, allowed_extra_beds }) => ({
                  room_type_id: room_type && room_type.id,
                  allowed_extra_beds: allowed_extra_beds,
                })
              ),
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
              <InputField
                label="Stars"
                name="stars"
                type="number"
                required
                max={5}
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
                render={({ name, push, remove }) => (
                  <div>
                    <label>Room Type(s) Available</label>
                    <ul>
                      {values.room_types.map((room_type, index, room_types) => (
                        <li key={index}>
                          <SelectRoomTypes
                            multiple={false}
                            label="Room Type"
                            name={`${name}.${index}.room_type`}
                            value={room_type.room_type}
                            onChange={value =>
                              setFieldValue(`${name}.${index}.room_type`, value)
                            }
                          />
                          <ErrorMessage name={`${name}.${index}.room_type`} />
                          <InputField
                            label="Allowed extra bed(s)"
                            type="number"
                            name={`${name}.${index}.allowed_extra_beds`}
                            value={room_type.allowed_extra_beds}
                            min={0}
                          />
                          {room_types.length > 1 ? (
                            <Button onClick={_ => remove(index)}>Remove</Button>
                          ) : null}
                        </li>
                      ))}
                      <li>
                        <Button onClick={_ => push(values.room_types[0])}>
                          Add More
                        </Button>
                      </li>
                    </ul>
                  </div>
                )}
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
