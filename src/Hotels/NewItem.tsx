import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldArray,
  FieldProps,
} from "formik"
import * as Validator from "yup"
import Helmet from "react-helmet-async"
import { Button } from "@tourepedia/ui"

import { InputField, FormikFormGroup } from "./../Shared/InputField"
import { withXHR, XHRProps } from "./../xhr"
import { store as mealPlanStore, SelectMealPlans } from "./../MealPlans"
import { store as roomTypeStore, SelectRoomTypes } from "./../RoomTypes"
import { store as locationStore, SelectLocations } from "./../Locations"
import {
  store as hotelPaymentPreferenceStore,
  SelectHotelPaymentPreferences,
} from "../HotelPaymentPreferences"
import { Grid, Col } from "../Shared/Layout"

const validationSchema = Validator.object().shape({
  name: Validator.string().required("Name field is required"),
  stars: Validator.number()
    .positive("Star rating field should a positive integer.")
    .integer("Star rating field should be positive integer")
    .required("Stars rating field is required"),
  extra_bed_child_age_start: Validator.number()
    .positive("Child start age should be a positive number")
    .integer("Child start age should be an integer")
    .required("Child start age is required"),
  extra_bed_child_age_end: Validator.number()
    .positive("Child end age should be a positive number")
    .integer("Child end age should be an integer")
    .required("Child end age is required"),
  meal_plans: Validator.array().min(1, "Please select atleast one meal plan"),
  room_types: Validator.array()
    .of(
      Validator.object().shape({
        room_types: Validator.array()
          .min(1, "Please select atleast one room type")
          .required("Please select a room type"),
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
  extra_bed_child_age_start: number
  extra_bed_child_age_end: number
  meal_plans: mealPlanStore.IMealPlan[]
  room_types: {
    room_types: roomTypeStore.IRoomType[]
    allowed_extra_beds: number
  }[]
  location?: locationStore.ILocation
  payment_preference?: hotelPaymentPreferenceStore.IHotelPaymentPreference
}
const initialValues: NewItemCredentials = {
  name: "",
  stars: 1,
  extra_bed_child_age_start: 6,
  extra_bed_child_age_end: 12,
  meal_plans: [],
  room_types: [{ room_types: [], allowed_extra_beds: 1 }],
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
          xhr
            .post("/hotels", {
              ...values,
              meal_plans: values.meal_plans.map(mealPlan => mealPlan.id),
              room_types: values.room_types.reduce(
                (
                  rooms: Array<{
                    room_type_id: number
                    allowed_extra_beds: number
                  }>,
                  { room_types, allowed_extra_beds }
                ) =>
                  rooms.concat(
                    room_types.map(room_type => ({
                      room_type_id: room_type.id,
                      allowed_extra_beds: allowed_extra_beds,
                    }))
                  ),
                []
              ),
              location_id: values.location ? values.location.id : undefined,
              payment_preference_id: values.payment_preference
                ? values.payment_preference.id
                : undefined,
            })
            .then(({ data }) => {
              const { data: hotel } = data
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
          status,
        }: FormikProps<NewItemCredentials>) => {
          return (
            <Form noValidate>
              {status ? <div>{status}</div> : null}
              <fieldset>
                <legend>Add Hotel</legend>
                <Grid>
                  <Col lg md={4} sm={6} xs={12}>
                    <InputField
                      label="Name"
                      name="name"
                      placeholder="Taj Hotel"
                      required
                    />
                  </Col>
                  <Col lg md={4} sm={6} xs={12}>
                    <FormikFormGroup
                      name="location"
                      render={({ field }: FieldProps<NewItemCredentials>) => (
                        <SelectLocations
                          {...field}
                          label="Location"
                          multiple={false}
                          onChange={(value, name) => setFieldValue(name, value)}
                        />
                      )}
                    />
                  </Col>
                  <Col lg md={4} sm={6}>
                    <FormikFormGroup
                      name="payment_preference"
                      render={({ field }: FieldProps<NewItemCredentials>) => (
                        <SelectHotelPaymentPreferences
                          {...field}
                          label="Payment Preference"
                          multiple={false}
                          onChange={(value, name) => setFieldValue(name, value)}
                          fetchOnMount
                        />
                      )}
                    />
                  </Col>
                  <Col lg md={4} sm={4} xs={8}>
                    <FormikFormGroup
                      name="meal_plans"
                      render={({ field }) => (
                        <SelectMealPlans
                          {...field}
                          label="Meal Plan(s) served"
                          onChange={(values, name) =>
                            setFieldValue(name, values)
                          }
                          fetchOnMount
                        />
                      )}
                    />
                  </Col>
                  <Col lg={1} md={4} sm={2} xs={4}>
                    <InputField
                      label="Stars"
                      name="stars"
                      type="number"
                      required
                      max={5}
                      min={1}
                    />
                  </Col>
                </Grid>
                <FieldArray
                  name="room_types"
                  render={({ name, push, remove }) => (
                    <fieldset>
                      <legend>Room Type(s) Available</legend>
                      <ul className="list">
                        {values.room_types.map(
                          (room_type, index, room_types) => (
                            <li key={index}>
                              <Grid>
                                <Col xs="auto">
                                  <FormikFormGroup
                                    name={`${name}.${index}.room_types`}
                                    render={({ field }) => (
                                      <SelectRoomTypes
                                        {...field}
                                        label="Room Types"
                                        fetchOnMount
                                        onChange={(value, name) =>
                                          setFieldValue(name, value)
                                        }
                                      />
                                    )}
                                  />
                                </Col>
                                <Col xs="auto">
                                  <InputField
                                    label="Allowed extra bed(s)"
                                    type="number"
                                    name={`${name}.${index}.allowed_extra_beds`}
                                    value={room_type.allowed_extra_beds}
                                    min={0}
                                  />
                                </Col>
                                <Col
                                  xs="auto"
                                  className="d-flex align-items-center"
                                >
                                  {room_types.length > 1 ? (
                                    <Button
                                      onClick={_ => remove(index)}
                                      className="btn--secondary"
                                    >
                                      &times; Remove
                                    </Button>
                                  ) : null}
                                </Col>
                              </Grid>
                            </li>
                          )
                        )}
                        <li>
                          <Button onClick={_ => push(values.room_types[0])}>
                            + Add More Room Types
                          </Button>
                        </li>
                      </ul>
                    </fieldset>
                  )}
                />
                <Grid>
                  <Col sm="auto">
                    <InputField
                      label="Extra bed child start age"
                      name="extra_bed_child_age_start"
                      required
                      type="number"
                      min={1}
                    />
                  </Col>
                  <Col sm="auto">
                    <InputField
                      label="Extra bed child end age"
                      name="extra_bed_child_age_end"
                      required
                      type="number"
                      min={1}
                    />
                  </Col>
                </Grid>
                <footer>
                  <Button type="submit" disabled={isSubmitting}>
                    Save Hotel Details
                  </Button>
                  <Link to=".." className="btn">
                    Cancel
                  </Link>
                </footer>
              </fieldset>
            </Form>
          )
        }}
      />
    </Fragment>
  )
}

export default withXHR<NewItemProps>(NewItem)
