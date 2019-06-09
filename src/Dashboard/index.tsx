import React, { useState, useEffect } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import moment from "moment"

import { RedirectUnlessAuthenticated } from "./../Auth"
import { withXHR, XHRProps } from "./../xhr"
import { store as tripStore } from "./../Trips"
import { Table } from "@tourepedia/ui"
import { Icons } from "@tourepedia/ui"

type IConvertedTripAnalytics = tripStore.ITrip[]
type IDuePayments = {
  due_amount: number
  due_date: string
  is_credit: boolean
}[]
type ITransactions = { amount: number; date: string; is_credited: boolean }[]

function XHR(xhr: AxiosInstance) {
  return {
    getConvertedTripAnalytics(): Promise<IConvertedTripAnalytics> {
      return xhr.get("/converted-trips").then(resp => resp.data.data)
    },
    getDuePayments(): Promise<IDuePayments> {
      return xhr.get("/instalments").then(resp => resp.data.data)
    },
    getTransactions(): Promise<{
      data: ITransactions
      meta: { debited: number; credited: number }
    }> {
      return xhr.get("/payment-transactions").then(resp => resp.data)
    },
  }
}

function ConvertedTrips({ xhr }: XHRProps) {
  const [trips, setConvertedTripAnalytics] = useState<IConvertedTripAnalytics>(
    []
  )
  useEffect(() => {
    XHR(xhr)
      .getConvertedTripAnalytics()
      .then(setConvertedTripAnalytics)
  }, [])
  return (
    <section>
      <h2>Converted trips over time</h2>
      <Table
        responsive
        bordered
        striped
        headers={["ID", "Dates", "Stages", "Destinations", "Traveler", "Pax"]}
        rows={trips.map(
          ({
            id,
            trip_source,
            trip_id,
            start_date,
            end_date,
            locations,
            no_of_adults,
            children,
            contact,
            latest_stage,
          }) => [
            <Link to={"/trips/" + id.toString()}>
              {trip_source.short_name}-{trip_id || id}
            </Link>,
            `${moment
              .utc(start_date)
              .local()
              .format("DD/MM/YYYY")} to ${moment
              .utc(end_date)
              .local()
              .format("DD/MM/YYYY")}`,
            latest_stage ? latest_stage.name : "Initiated",
            locations.map(l => l.short_name).join(" • "),
            contact ? (
              <div>
                {contact.name}
                <br />
                <a href={`tel:${contact.phone_number}`} className="btn--icon">
                  <Icons.PhoneIcon
                    title={`Call to ${contact.name} on ${contact.phone_number}`}
                  />
                </a>
                <a href={`mailto:${contact.email}`} className="btn--icon">
                  <Icons.MailIcon
                    title={`Send Email to ${contact.name} at ${contact.email}`}
                  />
                </a>
              </div>
            ) : null,
            `${no_of_adults} Adults${children ? " with " + children : ""}`,
          ]
        )}
      />
    </section>
  )
}

function DuePayments({ xhr }: XHRProps) {
  const [duePayments, setDuePayments] = useState<IDuePayments>([])
  useEffect(() => {
    XHR(xhr)
      .getDuePayments()
      .then(setDuePayments)
  }, [])
  return (
    <section>
      <h2>Due payments</h2>
      <Table bordered responsive>
        <thead>
          <tr>
            <th>Due Date</th>
            {duePayments.map((a, i) => (
              <th key={i}>
                {moment
                  .utc(a.due_date)
                  .local()
                  .format("DD/MM/YYYY")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Amount</th>
            {duePayments.map((a, i) => (
              <td key={i}>
                {a.is_credit ? "+" : "-"}
                {a.due_amount}
              </td>
            ))}
          </tr>
        </tbody>
      </Table>
    </section>
  )
}

function Transactions({ xhr }: XHRProps) {
  const [transactions, setTransactions] = useState<{
    data: ITransactions
    debited: number
    credited: number
  }>({ data: [], debited: 0, credited: 0 })
  useEffect(() => {
    XHR(xhr)
      .getTransactions()
      .then(({ data, meta }) => setTransactions({ data, ...meta }))
  }, [])
  return (
    <section>
      <h2>Transactions</h2>
      <div>
        Credited: {transactions.credited} • Debited: {transactions.debited}
      </div>
      <Table responsive bordered>
        <thead>
          <tr>
            <th>Date</th>
            {transactions.data.map((a, i) => (
              <th key={i}>
                {moment
                  .utc(a.date)
                  .local()
                  .format("DD/MM/YYYY")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Amount</th>
            {transactions.data.map((a, i) => (
              <td key={i}>
                {a.is_credited ? "+" : "-"}
                {a.amount}
              </td>
            ))}
          </tr>
        </tbody>
      </Table>
    </section>
  )
}

interface DashboardProps extends RouteComponentProps, XHRProps {}

function Dashboard({ xhr }: DashboardProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <ConvertedTrips xhr={xhr} />
      <DuePayments xhr={xhr} />
      <Transactions xhr={xhr} />
    </RedirectUnlessAuthenticated>
  )
}

export default withXHR<DashboardProps>(Dashboard)
