import React, { useState, useEffect } from "react"
import { RouteComponentProps } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import moment from "moment"

import { RedirectUnlessAuthenticated } from "./../Auth"
import { withXHR, XHRProps } from "./../xhr"
import { store as tripStore } from "./../Trips"

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

interface DashboardProps extends RouteComponentProps, XHRProps {}

function Dashboard({ xhr }: DashboardProps) {
  const [convertedTripAnalytics, setConvertedTripAnalytics] = useState<
    IConvertedTripAnalytics
  >([])
  const [duePayments, setDuePayments] = useState<IDuePayments>([])
  const [transactions, setTransactions] = useState<{
    data: ITransactions
    debited: number
    credited: number
  }>({ data: [], debited: 0, credited: 0 })
  useEffect(() => {
    XHR(xhr)
      .getConvertedTripAnalytics()
      .then(setConvertedTripAnalytics)
    XHR(xhr)
      .getDuePayments()
      .then(setDuePayments)
    XHR(xhr)
      .getTransactions()
      .then(({ data, meta }) => setTransactions({ data, ...meta }))
  }, [])
  return (
    <RedirectUnlessAuthenticated>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <h2>Dashboard</h2>
      <h3>Converted trips over time</h3>
      {convertedTripAnalytics
        .map(a =>
          moment
            .utc(a.converted_at)
            .local()
            .format("DD/MM/YYYY")
        )
        .join(" • ")}
      <h3>Due payments</h3>
      <div style={{ maxWidth: "100%", overflow: "auto", whiteSpace: "nowrap" }}>
        <table>
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
        </table>
      </div>
      <h3>Transactions</h3>
      <div>
        Credited: {transactions.credited} • Debited: {transactions.debited}
      </div>
      <div style={{ maxWidth: "100%", overflow: "auto", whiteSpace: "nowrap" }}>
        <table>
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
        </table>
      </div>
    </RedirectUnlessAuthenticated>
  )
}

export default withXHR<DashboardProps>(Dashboard)
