import React, { useState, useEffect } from "react"
import { RouteComponentProps } from "@reach/router"
import {
  Formik,
  FormikProps,
  FormikActions,
  Form,
  FieldArray,
  ErrorMessage,
} from "formik"
import Button from "@tourepedia/button"
import * as Validator from "yup"

import { InputField } from "./../Shared/InputField"
import { ILocation, IService } from "./store"
import { SelectLocations } from "./List"
import { withXHR, XHRProps } from "./../xhr"

const validationSchema = Validator.object().shape({
  via: Validator.array()
    .min(2, "Atleast two locations required")
    .required("Via field is required"),
  distance: Validator.number()
    .positive("Distance should be a positive number")
    .integer("Distance should be an integer")
    .required("Distance field is required"),
})

interface NewServiceCredentials {
  via: ILocation[]
  distance: number
}

const initialValues: NewServiceCredentials = {
  via: [undefined as any],
  distance: 0,
}

interface NewServicesProps extends RouteComponentProps, XHRProps {}
function NewServices({ xhr, navigate }: NewServicesProps) {
  return (
    <div>
      <h4>Add new service</h4>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: NewServiceCredentials,
          actions: FormikActions<NewServiceCredentials>
        ) => {
          actions.setStatus()
          const { distance, via } = values
          return xhr
            .post("/location-services", {
              distance,
              via: via.map(location => location.id),
            })
            .then(({ data }) => {
              const { service } = data
              navigate && navigate("../services")
              actions.setSubmitting(false)
            })
            .catch(error => {
              actions.setStatus(error.message)
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
              actions.setSubmitting(false)
              return Promise.reject(error)
            })
        }}
        render={({
          isSubmitting,
          values,
          status,
          setFieldValue,
        }: FormikProps<NewServiceCredentials>) => (
          <Form noValidate>
            <FieldArray
              name="via"
              render={({ name, remove, push }) => (
                <div>
                  <label>Locations</label>
                  {values.via.map((location, index) => (
                    <div key={index}>
                      <SelectLocations
                        name={`${name}.${index}`}
                        multiple={false}
                        value={values.via[index]}
                        onChange={value =>
                          setFieldValue(`${name}.${index}`, value)
                        }
                      />
                      <Button onClick={_ => remove(index)}>Remove</Button>
                    </div>
                  ))}
                  <Button onClick={_ => push(undefined)}>Add More</Button>
                  <ErrorMessage name={name} />
                </div>
              )}
            />
            <InputField
              name="distance"
              type="number"
              label="Distance (in kms)"
              placeholder="420"
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </Form>
        )}
      />
    </div>
  )
}

export default withXHR(NewServices)
