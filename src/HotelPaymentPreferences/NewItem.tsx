import React, { Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, Form, FormikProps, FormikActions, FieldArray } from "formik"
import { Button } from "@tourepedia/ui"
import Helmet from "react-helmet-async"
import * as Validator from "yup"

import { withXHR, XHRProps } from "./../xhr"
import { InputField, FormikFormGroup } from "./../Shared/InputField"
import { SelectHotelPaymentReferences } from "./List"
import { Grid, Col } from "../Shared/Layout"

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
                  <ul className="list">
                    {values.breakdowns.map((_, index, breakdowns) => (
                      <Grid as="li" key={index}>
                        <Col md={3}>
                          <FormikFormGroup
                            name={`${name}.${index}.reference`}
                            render={({ field }) => (
                              <SelectHotelPaymentReferences
                                {...field}
                                label="Reference Event"
                                required
                                fetchOnMount
                                multiple={false}
                                onChange={(value, name) =>
                                  setFieldValue(name, value)
                                }
                              />
                            )}
                          />
                        </Col>
                        <Col md={3}>
                          <InputField
                            label="Day offset from reference"
                            name={`${name}.${index}.day_offset`}
                            required
                            type="number"
                          />
                        </Col>
                        <Col md={3}>
                          <InputField
                            label={
                              <span className="whitespace-pre">
                                Amount share from total amount
                              </span>
                            }
                            name={`${name}.${index}.amount_share`}
                            required
                            type="number"
                            min={1}
                            max={100}
                          />
                        </Col>
                        <Col md={3} className="d-flex align-items-center">
                          {breakdowns.length > 1 ? (
                            <Button
                              className="btn--secondary"
                              onClick={() => remove(index)}
                            >
                              &times; Remove
                            </Button>
                          ) : null}
                        </Col>
                      </Grid>
                    ))}
                    <li key="add_more">
                      <Button
                        onClick={() =>
                          push({
                            amount_share:
                              100 - values.breakdowns[0].amount_share,
                          })
                        }
                      >
                        + Add More
                      </Button>
                    </li>
                  </ul>
                )}
              />
              {status ? <div className="text--error">{status}</div> : null}
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

export default withXHR<NewItemProps>(NewItem)
