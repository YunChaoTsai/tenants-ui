import React, { Fragment } from "react"
import moment from "moment"
import classNames from "classnames"
import { Badge, Table, Dialog, Button, useDialog } from "@tourepedia/ui"
import { Formik, Form } from "formik"
import { AxiosInstance } from "axios"

import { store as paymentStore } from "./../Payments"
import { ITrip } from "./store"
import { $PropertyType } from "utility-types"
import { numberToLocalString } from "./../utils"
import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"
import { RouteComponentProps } from "@reach/router"

function XHR(xhr: AxiosInstance) {
  return {
    async logTransaction(data: any): Promise<paymentStore.IPayment<any>> {
      return xhr
        .post("/payment-transactions", data)
        .then(resp => resp.data.data)
    },
  }
}

export default function Payments({
  trip,
}: { trip: ITrip } & RouteComponentProps) {
  const { customer_payments, hotel_payments, cab_payments } = trip
  return (
    <section className="bg-white p-4">
      {customer_payments ? (
        <CustomerPayments payments={customer_payments} />
      ) : null}
      {hotel_payments ? <HotelPayments payments={hotel_payments} /> : null}
      {cab_payments ? <CabPayments payments={cab_payments} /> : null}
    </section>
  )
}

function InstalmentStatus({
  dueAmount,
  dueDate,
}: {
  dueAmount: number
  dueDate: string
}) {
  let state: "Due" | "Paid" | "Overdue" = "Due"
  if (dueAmount <= 0) {
    state = "Paid"
  } else {
    const due_date = moment.utc(dueDate).local()
    const today = moment()
    if (due_date.isBefore(today)) {
      state = "Overdue"
    }
  }
  if (state === "Due") {
    return null
  }
  return (
    <Badge
      className={classNames(
        state === "Paid" &&
          "bg-green-200 text-green-800 border border-green-300",
        state === "Overdue" && "bg-red-200 text-red-800 border border-red-300"
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
      <DateString date={date} />
      <br />
      <InstalmentStatus dueAmount={amount} dueDate={date} />
    </div>
  )
}

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
      alignCols={{ 2: "right", 3: "right" }}
      bordered
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
          <Due date={instalment.due_date} amount={instalment.due_amount} />,
          <Amount amount={instalment.due_amount} />,
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
                  actions.setSubmitting(false)
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
