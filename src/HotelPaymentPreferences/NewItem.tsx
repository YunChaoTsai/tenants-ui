import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  Form,
  FormikProps,
  FormikActions,
  FieldArray,
  ErrorMessage,
} from "formik"
import Button from "@tourepedia/button"
import Helmet from "react-helmet-async"
import * as Validator from "yup"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"
import { SelectHotelPaymentReferences } from "./List"

interface NewItemCredentials {
  breakdowns: {
    reference?: { id: number; name: string }
    day_offset: number
    amount_share: number
  }[]
}
const validationSchema = Validator.object().shape({
  breakdowns: Validator.array()
    .of(
      Validator.object().shape({
        reference: Validator.object().required("Reference field is required"),
        day_offset: Validator.number()
          .integer()
          .required("Day offset field is required"),
        amount_share: Validator.number()
          .integer()
          .positive("Amount share should be positive integer")
          .max(100, "Amount share can not be greater then 100")
          .required("Amount share field is required"),
      })
    )
    .min(1, "Atleast on breakdown is required."),
})
const initialValues: NewItemCredentials = {
  breakdowns: [
    {
      reference: undefined,
      day_offset: 0,
      amount_share: 100,
    },
  ],
}

interface NewItemProps extends RouteComponentProps, XHRProps {}

function NewItem({ xhr, navigate }: NewItemProps) {
  return (
    <Fragment>
      <Helmet>
        <title>New Trip Stage</title>
      </Helmet>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          values: NewItemCredentials,
          actions: FormikActions<NewItemCredentials>
        ) => {
          actions.setStatus()
          // check for sum
          const totalAmountShare = values.breakdowns.reduce(
            (total, { amount_share }) => total + amount_share,
            0
          )
          if (totalAmountShare !== 100) {
            actions.setStatus(
              `Total amount share(${totalAmountShare}) should be 100%`
            )
            actions.setSubmitting(false)
            return
          }
          return xhr
            .post("/hotel-payment-preferences", {
              breakdowns: values.breakdowns.map(breakdown => ({
                ...breakdown,
                reference: breakdown.reference ? breakdown.reference.id : null,
              })),
            })
            .then(({ data }) => {
              navigate && navigate(`..`)
              actions.setSubmitting(false)
            })
            .catch(error => {
              actions.setSubmitting(false)
              actions.setStatus(error.message)
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
            })
        }}
        render={({
          isSubmitting,
          status,
          values,
          setFieldValue,
        }: FormikProps<NewItemCredentials>) => (
          <Form noValidate>
            <fieldset>
              <legend>Add new Hotel Payment Preferences</legend>
              <FieldArray
                name="breakdowns"
                render={({ name, push, remove }) => (
                  <ul>
                    {values.breakdowns.map((breakdown, index, breakdowns) => (
                      <li key={index}>
                        <SelectHotelPaymentReferences
                          label="Reference Event"
                          name={`${name}.${index}.reference`}
                          required
                          value={breakdown.reference}
                          fetchOnMount
                          multiple={false}
                          onChange={value =>
                            setFieldValue(`${name}.${index}.reference`, value)
                          }
                        />
                        <ErrorMessage
                          name={`${name}.${index}.reference`}
                          component="span"
                          className="text--error"
                        />
                        <InputField
                          label="Day offset from reference"
                          name={`${name}.${index}.day_offset`}
                          required
                          type="number"
                        />
                        <InputField
                          label="Amount share from total amount"
                          name={`${name}.${index}.amount_share`}
                          required
                          type="number"
                          min={1}
                          max={100}
                        />
                        {breakdowns.length > 1 ? (
                          <Button onClick={() => remove(index)}>Remove</Button>
                        ) : null}
                      </li>
                    ))}
                    <Button onClick={() => push(values.breakdowns[0])}>
                      Add More
                    </Button>
                  </ul>
                )}
              />
              {status ? <div className="text--error">{status}</div> : null}
              <Button type="submit" disabled={isSubmitting}>
                Save
              </Button>
            </fieldset>
            <Link to="..">Cancel</Link>
          </Form>
        )}
      />
    </Fragment>
  )
}

export default withXHR<NewItemProps>(NewItem)
