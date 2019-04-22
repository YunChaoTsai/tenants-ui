import React, { useState, useEffect } from "react"
import { RouteComponentProps } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import moment from "moment"

import { RedirectUnlessAuthenticated } from "./../Auth"
import { withXHR, XHRProps } from "./../xhr"

type IConvertedTripAnalytics = { created_at: string }[]
type IDuePayments = { due_amount: number; due_date: string }[]
type ITransactions = { amount: number; date: string; is_credited: boolean }[]

function XHR(xhr: AxiosInstance) {
  return {
    getConvertedTripAnalytics(): Promise<IConvertedTripAnalytics> {
      return xhr
        .get("/converted-trips/analytics")
        .then(resp => resp.data.analytics)
    },
    getDuePayments(): Promise<IDuePayments> {
      return xhr
        .get("/payments/due-payments")
        .then(resp => resp.data.due_payments)
    },
    getTransactions(): Promise<ITransactions> {
      return xhr
        .get("/payments/transactions")
        .then(resp => resp.data.transactions)
    },
  }
}

interface DashboardProps extends RouteComponentProps, XHRProps {}

function Dashboard({ xhr }: DashboardProps) {
  const [convertedTripAnalytics, setConvertedTripAnalytics] = useState<
    IConvertedTripAnalytics
  >([])
  const [duePayments, setDuePayments] = useState<IDuePayments>([])
  const [transactions, setTransactions] = useState<ITransactions>([])
  useEffect(() => {
    XHR(xhr)
      .getConvertedTripAnalytics()
      .then(setConvertedTripAnalytics)
    XHR(xhr)
      .getDuePayments()
      .then(setDuePayments)
    XHR(xhr)
      .getTransactions()
      .then(setTransactions)
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
            .utc(a.created_at)
            .local()
            .format("DD MMM, YYYY")
        )
        .join(" • ")}
      <h3>Due payments</h3>
      {duePayments
        .map(
          a =>
            `${moment
              .utc(a.due_date)
              .local()
              .format("DD MMM, YYYY")} - ${a.due_amount}`
        )
        .join(" • ")}
      <h3>Transactions</h3>
      {transactions
        .map(
          a =>
            `${moment
              .utc(a.date)
              .local()
              .format("DD MMM, YYYY")} - ${a.amount} ${
              a.is_credited ? "Credited" : "Debited"
            }`
        )
        .join(" • ")}
    </RedirectUnlessAuthenticated>
  )
}

export default withXHR<DashboardProps>(Dashboard)
