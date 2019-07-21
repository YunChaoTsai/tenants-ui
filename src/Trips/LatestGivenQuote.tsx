import React, { useEffect } from "react"
import { AxiosInstance } from "axios"
import moment from "moment"
import { Icons, Button, useFetchState, Dialog, useDialog } from "@tourepedia/ui"
import {
  Formik,
  Form,
  FormikProps,
  FormikActions,
  FieldArray,
  Field,
  FieldProps,
} from "formik"
import * as Validator from "yup"

import { InputField, Input, FormGroup } from "./../Shared/InputField"
import { ITrip } from "./store"
import { Quote } from "./Quotes"
import { GivenQuote, XHR as GiveQuotesXHR, IInstalment } from "./GivenQuotes"
import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"
import Spinner from "../Shared/Spinner"
import { numberToLocalString } from "./../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async convertTrip(data: any): Promise<ITrip> {
      return xhr.post("/converted-trips", data).then(resp => resp.data.data)
    },
  }
}

const LatestGivenQuote = withXHR(function LatestGivenQuote({
  trip,
  xhr,
}: XHRProps & { trip: ITrip }) {
  const [isConvertVisible, showConvert, hideConvert] = useDialog()
  const { latest_given_quote, converted_at } = trip
  return latest_given_quote ? (
    <fieldset>
      <legend>
        <h4>
          {converted_at ? "Quote used for conversion" : "Latest Given Quote"}
        </h4>
      </legend>
      <GivenQuote
        givenQuote={latest_given_quote}
        readOnly={!!converted_at}
        showHotelBookingStatus={!!converted_at}
      />
      <ConvertTrip
        trip={trip}
        isConvertVisible={isConvertVisible}
        hideConvert={hideConvert}
        onConvert={(data: any) => XHR(xhr).convertTrip(data)}
      />
      {converted_at ? null : (
        <footer>
          <Button onClick={showConvert} primary>
            Mark as converted
          </Button>
        </footer>
      )}
    </fieldset>
  ) : null
})

const tripConversionValidationSchema = Validator.object()
  .shape({
    instalments: Validator.array()
      .of(
        Validator.object().shape({
          due_date: Validator.string().required(
            "Instalment due date is required"
          ),
          amount: Validator.number()
            .positive("Instalment amount should a positive number")
            .required("Instalment amount is required"),
          percentage: Validator.number()
            .positive("Percentage should be a positive number")
            .required("Percentage field is required"),
        })
      )
      .min(1, "Atleast one instalment should is required"),
    comments: Validator.string(),
    details_verified: Validator.boolean().required(
      "Please verify the details before conversion"
    ),
  })
  .required("Conversion fields are required")

interface ITripConversionSchema {
  details_verified: boolean
  instalments: { percentage: number; amount: number; due_date: string }[]
  comments: string
}

export const ConvertTrip = withXHR(function ConvertTrip({
  trip,
  isConvertVisible,
  hideConvert,
  onConvert,
  xhr,
}: XHRProps & {
  trip: ITrip
  isConvertVisible: boolean
  hideConvert: () => void
  onConvert: (data: any) => Promise<any>
}) {
  const {
    id,
    locations,
    latest_given_quote,
    start_date,
    end_date,
    no_of_adults,
    children,
  } = trip
  const [
    instalments,
    fetchInstalments,
    { isFetching: isFetchingInstalments },
  ] = useFetchState<IInstalment[]>(
    async () => {
      if (!latest_given_quote) {
        return Promise.reject("No given quote for the trip")
      }
      return GiveQuotesXHR(xhr)
        .getInstalments(latest_given_quote.id)
        .then(resp => resp.data)
    },
    {
      isFetching: true,
    }
  )
  useEffect(() => {
    if (isConvertVisible) {
      fetchInstalments()
    }
  }, [isConvertVisible])
  if (!latest_given_quote) return null
  return (
    <Dialog open={isConvertVisible} onClose={hideConvert}>
      <Dialog.Header>
        <Dialog.Title>Trip Conversion</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        {isFetchingInstalments ? (
          <Spinner />
        ) : (
          <Formik
            initialValues={{
              comments: "",
              details_verified: false,
              instalments: (instalments || []).map(({ amount, due_date }) => ({
                amount: parseFloat(amount.toFixed(2)),
                due_date: moment
                  .utc(due_date)
                  .local()
                  .format("YYYY-MM-DD"),
                percentage: parseFloat(
                  ((amount * 100) / latest_given_quote.given_price).toFixed(2)
                ),
              })),
            }}
            validationSchema={tripConversionValidationSchema}
            onSubmit={(
              {
                details_verified,
                instalments,
                comments,
              }: ITripConversionSchema,
              actions: FormikActions<ITripConversionSchema>
            ) => {
              const { given_price } = latest_given_quote
              actions.setStatus()
              if (!details_verified) {
                actions.setStatus(
                  "Please verify the details and select the checkbox when done."
                )
                actions.setSubmitting(false)
                return
              }
              const totalInstalmentAmount = instalments.reduce(
                (totalAmount, { amount }) => totalAmount + amount,
                0
              )
              if (totalInstalmentAmount < given_price) {
                actions.setStatus(
                  `Instalments doesn't sumup(Rs: ${totalInstalmentAmount} /-) with given quote's price (Rs: ${given_price}) /-`
                )
                actions.setSubmitting(false)
                return
              }
              if (
                window.confirm(
                  `${
                    totalInstalmentAmount > given_price
                      ? "Total instalment is greater then given quote's amount. "
                      : ""
                  }Are you sure you want to mark this trip as converted ?`
                )
              ) {
                onConvert({
                  instalments: instalments.map(
                    ({ percentage, ...otherData }) => otherData
                  ),
                  comments,
                  trip_id: id,
                })
                  .then(() => {
                    actions.setSubmitting(false)
                    hideConvert()
                  })
                  .catch(error => {
                    actions.setStatus(error.message)
                    if (error.formikErrors) {
                      actions.setErrors(error.formikErrors)
                    }
                    return Promise.reject(error)
                  })
              } else {
                actions.setSubmitting(false)
              }
            }}
            render={({
              isSubmitting,
              values,
              setFieldValue,
              status,
            }: FormikProps<ITripConversionSchema>) => (
              <Form noValidate>
                <fieldset>
                  <legend>
                    <b>Please verify following details with the customer</b>
                  </legend>
                  <p>
                    <b>
                      Trip to{" "}
                      <mark>{locations.map(l => l.short_name).join(", ")}</mark>{" "}
                      from{" "}
                      <mark>
                        {moment
                          .utc(start_date)
                          .local()
                          .format("DD MMM, YYYY")}
                      </mark>{" "}
                      to{" "}
                      <mark>
                        {moment
                          .utc(end_date)
                          .local()
                          .format("DD MMM, YYYY")}
                      </mark>{" "}
                      with{" "}
                      <mark>
                        {no_of_adults} Adults
                        {children ? ` and ${children} children` : ""}
                      </mark>{" "}
                      where the package cost is{" "}
                      <mark>
                        <Icons.RupeeIcon />{" "}
                        {numberToLocalString(latest_given_quote.given_price)} /-
                      </mark>
                      .
                    </b>
                  </p>
                  <h5>Quote Details</h5>
                  <hr />
                  <Quote quote={latest_given_quote.quote} readOnly />
                </fieldset>
                <hr />
                <fieldset>
                  <legend>Customer Instalments</legend>
                  <FieldArray
                    name="instalments"
                    render={({ name, push, remove }) => (
                      <>
                        <ul className="list">
                          {values.instalments.map(
                            (instalment, index, instalments) => (
                              <li key={index}>
                                <Grid>
                                  <Col>
                                    <InputField
                                      name={`${name}.${index}.due_date`}
                                      label="Date"
                                      type="date"
                                    />
                                  </Col>
                                  <Col>
                                    <FormGroup>
                                      <label
                                        htmlFor={`${name}.${index}.percentage`}
                                      >
                                        Percentage
                                      </label>
                                      <Field
                                        name={`${name}.${index}.percentage`}
                                        render={({
                                          field,
                                        }: FieldProps<
                                          ITripConversionSchema
                                        >) => (
                                          <Input
                                            {...field}
                                            onChange={(
                                              e: React.ChangeEvent<
                                                HTMLInputElement
                                              >
                                            ) => {
                                              setFieldValue(
                                                `${name}.${index}.amount`,
                                                (latest_given_quote.given_price *
                                                  parseFloat(
                                                    e.target.value || "0"
                                                  )) /
                                                  100
                                              )
                                              field.onChange(e)
                                            }}
                                            type="number"
                                          />
                                        )}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col>
                                    <FormGroup>
                                      <label
                                        htmlFor={`${name}.${index}.amount`}
                                      >
                                        Amount
                                      </label>
                                      <Field
                                        name={`${name}.${index}.amount`}
                                        render={({
                                          field,
                                        }: FieldProps<
                                          ITripConversionSchema
                                        >) => (
                                          <Input
                                            {...field}
                                            onChange={(
                                              e: React.ChangeEvent<
                                                HTMLInputElement
                                              >
                                            ) => {
                                              setFieldValue(
                                                `${name}.${index}.percentage`,
                                                (100 *
                                                  parseFloat(
                                                    e.target.value || "0"
                                                  )) /
                                                  latest_given_quote.given_price
                                              )
                                              field.onChange(e)
                                            }}
                                            type="number"
                                          />
                                        )}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col className="d-flex align-items-center">
                                    <div className="button-group">
                                      <Button
                                        className="btn--secondary"
                                        onClick={() => push(instalment)}
                                      >
                                        + Duplicate
                                      </Button>
                                      {instalments.length > 1 ? (
                                        <Button
                                          className="btn--secondary"
                                          onClick={() => remove(index)}
                                        >
                                          &times; Remove
                                        </Button>
                                      ) : null}
                                    </div>
                                  </Col>
                                </Grid>
                              </li>
                            )
                          )}
                        </ul>
                        <footer>
                          <Button
                            className="btn--secondary"
                            onClick={() => {
                              const remainingPercentage = Math.max(
                                100 -
                                  values.instalments.reduce(
                                    (totalPercentage, { percentage }) =>
                                      totalPercentage + percentage,
                                    0
                                  ),
                                0
                              )
                              push({
                                due_date: "",
                                amount:
                                  (latest_given_quote.given_price *
                                    remainingPercentage) /
                                  100,
                                percentage: remainingPercentage,
                              })
                            }}
                          >
                            + Add More Instalments
                          </Button>
                        </footer>
                      </>
                    )}
                  />
                </fieldset>
                <InputField
                  name="comments"
                  label="Comments"
                  as="textarea"
                  placeholder="Any comments regarding verification or prices etc.."
                />
                <InputField
                  name="details_verified"
                  type="checkbox"
                  label="Verified travel details with customer ?"
                />
                {status ? <p className="error">{status}</p> : null}
                <Dialog.Footer>
                  <Button primary type="submit" disabled={isSubmitting}>
                    Mark as converted
                  </Button>
                  <Button onClick={hideConvert}>Cancel</Button>
                </Dialog.Footer>
              </Form>
            )}
          />
        )}
      </Dialog.Body>
    </Dialog>
  )
})

export default LatestGivenQuote
