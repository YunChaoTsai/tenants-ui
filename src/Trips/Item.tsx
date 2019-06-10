import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Router } from "@reach/router"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import moment from "moment"
import Helmet from "react-helmet-async"
import {
  Table,
  Icons,
  Button,
  useFetchState,
  Badge,
  Dialog,
  useDialog,
  BadgeList,
} from "@tourepedia/ui"
import { $PropertyType } from "utility-types"
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
import classNames from "classnames"

import { InputField, Input, FormGroup } from "./../Shared/InputField"
import { ITrip, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import Quotes, { Quote } from "./Quotes"
import GivenQuotes, {
  GivenQuote,
  XHR as GiveQuotesXHR,
  IInstalment,
} from "./GivenQuotes"
import NewQuote from "./NewQuote"
import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"
import Spinner from "../Shared/Spinner"
import { store as paymentStore } from "./../Payments"
import { numberToLocalString } from "./../utils"
import NavLink from "../Shared/NavLink"
import Component from "../Shared/Component"
import EditTags from "../Tags/EditTags"

export function XHR(xhr: AxiosInstance) {
  return {
    async getTrip(tripId: string): Promise<ITrip> {
      return xhr.get(`/trips/${tripId}`).then(resp => resp.data.data)
    },
    async convertTrip(data: any): Promise<ITrip> {
      return xhr.post("/converted-trips", data).then(resp => resp.data.data)
    },
    async logTransaction(data: any): Promise<paymentStore.IPayment<any>> {
      return xhr
        .post("/payment-transactions", data)
        .then(resp => resp.data.data)
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

const LogTransaction = withXHR(function LogTransaction({
  instalment,
  xhr,
}: XHRProps & { instalment: paymentStore.IInstalment }) {
  const [dialogOpen, open, close] = useDialog()
  return (
    <>
      <Button onClick={open}>Add</Button>
      <Dialog open={dialogOpen} onClose={close} closeButton>
        <Dialog.Header>
          <Dialog.Title>Log Transaction</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <p>
            <mark>INR {numberToLocalString(instalment.due_amount)}</mark> is due
            by
            <mark>
              {moment
                .utc(instalment.due_date)
                .local()
                .format("DD MMM, YYYY")}
            </mark>
          </p>
          <Formik
            initialValues={{
              amount: instalment.due_amount,
              payment_mode: "netbanking",
              comments: "",
            }}
            onSubmit={({ amount, comments, payment_mode }, actions) => {
              actions.setStatus()
              XHR(xhr)
                .logTransaction({
                  instalment_id: instalment.id,
                  amount,
                  payment_mode,
                  comments,
                })
                .then(() => {
                  actions.setSubmitting(false)
                  window.location = window.location
                })
                .catch(e => {
                  actions.setStatus(e.message)
                  if (e.formikErrors) {
                    actions.setErrors(e.formikErrors)
                  }
                  actions.setStatus(false)
                })
            }}
            render={({ isSubmitting, status }) => (
              <Form noValidate>
                {status ? <p className="error">{status}</p> : null}
                <InputField name="amount" label="Paid Amount (INR)" required />
                <InputField
                  as="select"
                  name="payment_mode"
                  label="Payment Mode"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="netbanking">Netbanking</option>
                  <option value="upi">UPI</option>
                  <option value="others">Others</option>
                </InputField>
                <InputField
                  name="comments"
                  as="textarea"
                  label="Comments"
                  placeholder="Any comments consisting reference id or payment details"
                />

                <Dialog.Footer>
                  <Button primary disabled={isSubmitting} type="submit">
                    Update
                  </Button>
                  <Button onClick={close}>Cancel</Button>
                </Dialog.Footer>
              </Form>
            )}
          />
        </Dialog.Body>
      </Dialog>
    </>
  )
})

function Transactions({
  instalment,
}: {
  instalment: paymentStore.IInstalment
}) {
  return (
    <div>
      {instalment.transactions && instalment.transactions.length ? (
        <div>
          {instalment.transactions.map(transaction => (
            <div key={transaction.id}>
              {moment
                .utc(transaction.date)
                .local()
                .format("DD MMM, YYYY [at] hh:mm A")}
              {" - "}
              {numberToLocalString(transaction.amount)} /-
              {transaction.comments ? (
                <blockquote>{transaction.comments}</blockquote>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p>Nothing yet</p>
      )}
      {instalment.due_amount > 0 ? (
        <LogTransaction instalment={instalment} />
      ) : null}
    </div>
  )
}

function InstalmentStatus({
  dueAmount,
  dueDate,
}: {
  dueAmount: number
  dueDate: string
}) {
  let state: string = "Due"
  if (dueAmount <= 0) {
    state = "Paid"
  } else {
    const due_date = moment.utc(dueDate).local()
    const today = moment()
    if (due_date.isBefore(today)) {
      state = "Overdue"
    }
  }
  return (
    <Badge
      className={classNames(
        state === "Paid" && "bg-green-300",
        state === "Overdue" && "bg-red-300",
        state === "Due" && "bg-yellow-300"
      )}
    >
      {state}
    </Badge>
  )
}

function DateString({ date }: { date: string }) {
  return (
    <span>
      {moment
        .utc(date)
        .local()
        .format("DD MMM, YYYY")}
    </span>
  )
}

function Amount({ amount }: { amount: number }) {
  return <span>{numberToLocalString(amount)}</span>
}

function Due({ date, amount }: { date: string; amount: number }) {
  return (
    <div>
      <Amount amount={amount} />
      <br />
      <InstalmentStatus dueAmount={amount} dueDate={date} />
    </div>
  )
}

function CustomerPayments({
  payments,
}: {
  payments: $PropertyType<ITrip, "customer_payments">
}) {
  return payments && payments.length ? (
    <Table
      autoWidth
      caption={"Payments towards customer"}
      headers={["Due Date", "Due", "Total", "Paid", "Transactions"]}
      alignCols={{ 0: "right", 2: "right", 3: "right" }}
      rows={payments
        .reduce(
          (
            instalments: Array<paymentStore.IInstalment>,
            payment
          ): Array<paymentStore.IInstalment> =>
            instalments.concat(payment.instalments),
          []
        )
        .map(instalment => [
          <DateString date={instalment.due_date} />,
          <Due date={instalment.due_date} amount={instalment.due_amount} />,
          <Amount amount={instalment.amount} />,
          <Amount amount={instalment.paid_amount} />,
          <Transactions instalment={instalment} />,
        ])}
    />
  ) : null
}
function HotelPayments({
  payments,
}: {
  payments: $PropertyType<ITrip, "hotel_payments">
}) {
  return payments && payments.length ? (
    <Table
      caption="Payments for accomodation"
      headers={[
        "Hotel",
        "Due Date",
        "Due Amount",
        "Total Amount",
        "Paid Amount",
        "Transactions",
      ]}
      striped={false}
      bordered
      autoWidth
    >
      <tbody>
        {payments.map(payment => {
          const hotel = payment.paymentable.hotel
          return (
            <Fragment key={payment.id}>
              {payment.instalments.map((instalment, i, instalments) => (
                <tr key={instalment.id}>
                  {i === 0 ? (
                    <td
                      rowSpan={instalments.length}
                      className="vertical-align-middle"
                    >
                      <b>{hotel.name}</b>
                      <br />
                      <small>
                        {hotel.location.short_name}, {hotel.stars} Star
                      </small>
                    </td>
                  ) : null}
                  <td>
                    <DateString date={instalment.due_date} />
                  </td>
                  <td>
                    <Due
                      date={instalment.due_date}
                      amount={instalment.due_amount}
                    />
                  </td>
                  <td>
                    <Amount amount={instalment.amount} />
                  </td>
                  <td>
                    <Amount amount={instalment.amount} />
                  </td>
                  <td>
                    <Transactions instalment={instalment} />
                  </td>
                </tr>
              ))}
            </Fragment>
          )
        })}
      </tbody>
    </Table>
  ) : null
}

function CabPayments({
  payments,
}: {
  payments: $PropertyType<ITrip, "cab_payments">
}) {
  return payments && payments.length ? (
    <Table
      caption="Payments for Transportation"
      headers={[
        "Transportation",
        "Due Date",
        "Due",
        "Total",
        "Paid",
        "Transactions",
      ]}
      striped={false}
      bordered
      autoWidth
    >
      <tbody>
        {payments.map(payment => {
          const cabType = payment.paymentable.cab_type
          const transportService = payment.paymentable.transport_service
          return (
            <Fragment key={payment.id}>
              {payment.instalments.map((instalment, i, instalments) => (
                <tr key={instalment.id}>
                  {i === 0 ? (
                    <td
                      rowSpan={instalments.length}
                      className="vertical-align-middle"
                    >
                      <b>{transportService.name}</b>
                      <br />
                      <small>{cabType.name}</small>
                    </td>
                  ) : null}
                  <td>
                    <Due
                      date={instalment.due_date}
                      amount={instalment.due_amount}
                    />
                  </td>
                  <td>
                    <Amount amount={instalment.due_amount} />
                  </td>
                  <td>
                    <Amount amount={instalment.amount} />
                  </td>
                  <td>
                    <Amount amount={instalment.paid_amount} />
                  </td>
                  <td>
                    <Transactions instalment={instalment} />
                  </td>
                </tr>
              ))}
            </Fragment>
          )
        })}
      </tbody>
    </Table>
  ) : null
}

function BasicDetails({ trip }: { trip: ITrip }) {
  const {
    id,
    start_date,
    end_date,
    locations,
    no_of_adults,
    children,
    trip_source,
    trip_id,
    contacts,
    tags,
  } = trip
  return (
    <div>
      <h3>
        {locations.map(l => l.short_name).join(" • ")}
        <small>
          ({trip_source.short_name}-{trip_id || id})
        </small>
      </h3>
      <dl>
        <Grid>
          <Col>
            <dt>Dates</dt>
            <dd className="white-space-pre">
              {moment
                .utc(start_date)
                .local()
                .format("DD MMM, YYYY")}{" "}
              to{" "}
              {moment
                .utc(end_date)
                .local()
                .format("DD MMM, YYYY")}
            </dd>
          </Col>
          <Col>
            <dt>
              <Icons.UsersIcon /> Pax
            </dt>
            <dd>
              {no_of_adults} Adults
              <br />
              {children ? (
                <span>
                  <Icons.ChildIcon />
                  {children} Children
                </span>
              ) : (
                ""
              )}
            </dd>
          </Col>
          <Col>
            <dt>
              <Icons.TagsIcon /> Tags
            </dt>
            <dd>
              <Component initialState={false}>
                {({ state: isEditing, setState: setIsEditing }) =>
                  isEditing ? (
                    <EditTags
                      type="trip"
                      tags={tags}
                      itemId={trip.id}
                      onSuccess={() => {
                        setIsEditing(false)
                      }}
                      onCancel={() => {
                        setIsEditing(false)
                      }}
                    />
                  ) : (
                    <div>
                      {tags && tags.length ? (
                        <BadgeList>
                          {tags.map(t => (
                            <Badge key={t.id}>{t.name}</Badge>
                          ))}
                        </BadgeList>
                      ) : null}
                      <Button
                        onClick={() => {
                          setIsEditing(true)
                        }}
                        className="p-0 w-8 h-8 ml-2 rounded-full"
                      >
                        <span className="rotate-90 inline-block">&#9998;</span>
                      </Button>
                    </div>
                  )
                }
              </Component>
            </dd>
          </Col>
          <Col>
            <dt>Travelers</dt>
            <dd>
              <ul className="list">
                {contacts.map(contact => (
                  <li key={contact.id}>
                    <b>{contact.name}</b>
                    <br />
                    <span>
                      <a href={`tel:${contact.phone_number}`}>
                        {contact.phone_number}
                      </a>
                      {contact.email ? (
                        <span>
                          {" "}
                          • 
                          <a href={`mailto:${contact.email}`}>
                            {contact.email}
                          </a>
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </Col>
        </Grid>
      </dl>
    </div>
  )
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

interface StateProps {
  isFetching: boolean
  trip?: ITrip
}
interface DispatchProps {
  getTrip: (tripId: string) => Promise<ITrip>
}
interface OwnProps extends RouteComponentProps<{ tripId: string }> {}

interface ItemProps extends StateProps, DispatchProps, OwnProps {}

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
      trip: tripSelector.getItem(ownProps.tripId),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTrip: (tripId: string) => dispatch(getTrip(tripId)),
  })
)

function Index({ trip }: RouteComponentProps & { trip: ITrip }) {
  const {
    id,
    locations,
    trip_source,
    trip_id,
    customer_payments,
    cab_payments,
    hotel_payments,
  } = trip
  return (
    <div>
      <Helmet>
        <title>
          {locations.map(l => l.short_name).join(" • ")} (
          {trip_source.short_name}-{trip_id || id.toString()})
        </title>
      </Helmet>
      <BasicDetails trip={trip} />
      {customer_payments ? (
        <CustomerPayments payments={customer_payments} />
      ) : null}
      {hotel_payments ? <HotelPayments payments={hotel_payments} /> : null}
      {cab_payments ? <CabPayments payments={cab_payments} /> : null}
      <LatestGivenQuote trip={trip} />
    </div>
  )
}

function Item({ tripId, isFetching, getTrip, navigate, trip }: ItemProps) {
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
  return (
    <div>
      <ul className="border-b flex mb-4 tabs">
        <NavLink to=".." className="border">
          <Icons.ChevronDownIcon className="rotate-90" />
        </NavLink>
        <NavLink to="" className="border">
          Trip Details
        </NavLink>
        <NavLink to="given-quotes" className="border">
          Given Quotes
        </NavLink>
        <NavLink to="quotes" className="border">
          Quotes
        </NavLink>
        <NavLink to="new-quote" className="border">
          New Quote
        </NavLink>
      </ul>
      <Router>
        <Index path="/" trip={trip} />
        <GivenQuotes path="given-quotes" trip={trip} />
        <Quotes path="quotes" trip={trip} />
        <NewQuote path="new-quote" trip={trip} />
      </Router>
    </div>
  )
}

export default connectWithItem(Item)

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
    () => {
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
