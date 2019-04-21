import React, { useEffect, useState } from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"
import Button from "@tourepedia/button"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import moment from "moment"
import Helmet from "react-helmet-async"
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

import { InputField, Input } from "./../Shared/InputField"
import { ITrip, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import Quotes, { Quote } from "./Quotes"
import NewQuote from "./NewQuote"
import { Dialog, useDialog } from "./../Shared/Dialog"
import { withXHR, XHRProps } from "./../xhr"

export function XHR(xhr: AxiosInstance) {
  return {
    getTrip(tripId: string): Promise<ITrip> {
      return xhr.get(`/trips/${tripId}`).then(resp => resp.data.trip)
    },
    convertTrip(data: any): Promise<ITrip> {
      return xhr.post("/converted-trips", data).then(resp => resp.data.trip)
    },
  }
}

export const getTrip = (tripId: string): ThunkAction<Promise<ITrip>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getTrip(tripId)
    .then(trip => {
      dispatch(actions.item.success(trip))
      return trip
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  trip?: ITrip
}
interface DispatchProps {
  getTrip: (tripId: string) => Promise<ITrip>
}
interface OwnProps extends RouteComponentProps<{ tripId: string }> {}

interface ItemProps extends StateProps, DispatchProps, OwnProps, XHRProps {}

const connectWithItem = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  (state, ownProps) => {
    const tripSelector = selectors(state)
    return {
      isFetching: tripSelector.isFetching,
      trip: tripSelector.getTrip(ownProps.tripId),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTrip: (tripId: string) => dispatch(getTrip(tripId)),
  })
)

const tripConversionValidationSchema = Validator.object()
  .shape({
    instalments: Validator.array()
      .of(
        Validator.object().shape({
          due_date: Validator.string().required("Instalment date is required"),
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

function Item({ tripId, isFetching, getTrip, navigate, trip, xhr }: ItemProps) {
  const [isConvertVisible, showConvert, hideConvert] = useDialog()
  useEffect(() => {
    tripId && getTrip(tripId)
  }, [])
  if (!tripId) {
    navigate && navigate("..")
    return null
  }
  if (isFetching) return <span>Loading...</span>
  if (!trip) {
    navigate && navigate("..")
    return null
  }
  const {
    id,
    start_date,
    end_date,
    locations,
    no_of_adults,
    children,
    trip_source,
    trip_id,
    latest_given_quote,
  } = trip
  return (
    <div>
      <Link to="..">Back</Link>
      <Helmet>
        <title>
          {locations.map(l => l.short_name).join(" • ")} (
          {trip_source.short_name}-{trip_id})
        </title>
      </Helmet>
      <h3>
        {locations.map(l => l.short_name).join(" • ")} ({trip_source.short_name}
        -{trip_id}) from{" "}
        {moment
          .utc(start_date)
          .local()
          .format("DD MMM, YYYY")}{" "}
        to{" "}
        {moment
          .utc(end_date)
          .local()
          .format("DD MMM, YYYY")}{" "}
        with {no_of_adults} Adults{children ? ` and ${children} children` : ""}
      </h3>
      {latest_given_quote ? (
        <div>
          <h3>Latest given quote </h3>
          <p>Given Price: {latest_given_quote.given_price}</p>
          <p>
            Given By: {latest_given_quote.created_by.name} on{" "}
            {latest_given_quote.created_at}
          </p>
          <Button onClick={showConvert}>Mark as converted</Button>
          <Quote quote={latest_given_quote.quote} />
          <Dialog open={isConvertVisible} onClose={hideConvert}>
            <div style={{ padding: "10px" }}>
              <h3>Trip Conversion</h3>
              <Formik
                initialValues={{
                  comments: "",
                  details_verified: false,
                  instalments: [
                    {
                      due_date: "",
                      amount: latest_given_quote.given_price,
                      percentage: 100,
                    },
                  ],
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
                    confirm(
                      `${
                        totalInstalmentAmount > given_price
                          ? "Total instalment is greater then given quote's amount. "
                          : ""
                      }Are you sure you want to mark this trip as converted ?`
                    )
                  ) {
                    XHR(xhr)
                      .convertTrip({
                        instalments,
                        comments,
                        trip_id: id,
                      })
                      .then(trip => {
                        actions.setSubmitting(false)
                        hideConvert()
                      })
                    console.log(instalments)
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
                    {status ? (
                      <div>
                        {status} <hr />
                      </div>
                    ) : null}
                    <div>
                      <p>
                        <b>Please verify following details with the customer</b>
                      </p>
                      <p>
                        Destination:{" "}
                        {locations.map(l => l.short_name).join(" • ")}
                      </p>
                      <p>
                        Start Date:
                        {moment
                          .utc(start_date)
                          .local()
                          .format("DD MMM, YYYY")}{" "}
                      </p>
                      <p>
                        End Date:
                        {moment
                          .utc(end_date)
                          .local()
                          .format("DD MMM, YYYY")}
                      </p>
                      <p>
                        Adults: {no_of_adults} and Children:{" "}
                        {children || <em>None</em>}
                      </p>
                      <p>
                        Total Amount: Rs: {latest_given_quote.given_price} /-
                      </p>
                      <InputField
                        name="details_verified"
                        type="checkbox"
                        label="Verified Details?"
                      />
                    </div>
                    <hr />
                    <div>Instalments</div>
                    <FieldArray
                      name="instalments"
                      render={({ name, push, remove }) => (
                        <ul>
                          {values.instalments.map(
                            (instalment, index, instalments) => (
                              <li key={index}>
                                <InputField
                                  name={`${name}.${index}.due_date`}
                                  label="Date"
                                  type="date"
                                />
                                <div>
                                  <label>Percentage</label>
                                  <Field
                                    name={`${name}.${index}.percentage`}
                                    render={({
                                      field,
                                    }: FieldProps<ITripConversionSchema>) => (
                                      <Input
                                        {...field}
                                        onChange={(
                                          e: React.ChangeEvent<HTMLInputElement>
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
                                </div>
                                <div>
                                  <label>Amount</label>
                                  <Field
                                    name={`${name}.${index}.amount`}
                                    render={({
                                      field,
                                    }: FieldProps<ITripConversionSchema>) => (
                                      <Input
                                        {...field}
                                        onChange={(
                                          e: React.ChangeEvent<HTMLInputElement>
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
                                </div>
                                {instalments.length > 1 ? (
                                  <Button onClick={e => remove(index)}>
                                    Remove
                                  </Button>
                                ) : null}
                                <Button onClick={e => push(instalment)}>
                                  Duplicate
                                </Button>
                              </li>
                            )
                          )}
                          <Button
                            onClick={e => {
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
                            Add More
                          </Button>
                        </ul>
                      )}
                    />
                    <InputField name="comments" label="Comments" />
                    <Button type="submit" disabled={isSubmitting}>
                      Mark as converted
                    </Button>
                    <Button onClick={hideConvert}>Cancel</Button>
                  </Form>
                )}
              />
            </div>
          </Dialog>
          <hr />
        </div>
      ) : null}
      <Link to="quotes">Quotes</Link> • <Link to="new-quote">New Quote</Link>
      <Router>
        <Quotes path="quotes" trip={trip} />
        <NewQuote path="new-quote" trip={trip} />
      </Router>
    </div>
  )
}

export default connectWithItem(withXHR(Item))
