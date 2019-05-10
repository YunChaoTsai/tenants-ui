import React, { useState, useEffect, Fragment } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import moment from "moment"
import { connect } from "react-redux"

import {
  ITransportServicePrice,
  actions,
  selectors,
  IStateWithKey,
} from "./store"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import { ThunkAction, ThunkDispatch } from "../types"
import Helmet from "react-helmet-async"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Table } from "../Shared/Table"

export function XHR(xhr: AxiosInstance) {
  return {
    getTransportServicePrices(
      params?: any
    ): Promise<{ data: ITransportServicePrice[]; meta: any }> {
      return xhr.get("/cab-prices", { params }).then(resp => resp.data)
    },
  }
}

export const getTransportServicePrices = (
  params?: any
): ThunkAction<Promise<ITransportServicePrice[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTransportServicePrices(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends PaginateProps {
  transportServicePrices: ITransportServicePrice[]
}
interface DispatchProps {
  getTransportServicePrices: (params?: any) => Promise<ITransportServicePrice[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const transportServicePricesSelector = selectors(state)
    return {
      ...transportServicePricesSelector.meta,
      isFetching: transportServicePricesSelector.isFetching,
      transportServicePrices: transportServicePricesSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTransportServicePrices: (params?: any) =>
      dispatch(getTransportServicePrices(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}

function List({
  getTransportServicePrices,
  transportServicePrices,
  ...otherProps
}: ListProps) {
  const { isFetching, total, currentPage } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getTransportServicePrices({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Transport Service Prices Listing</title>
      </Helmet>
      <div className="display--flex justify-content--space-between">
        <Search
          onSearch={params => {
            setParams(params)
            getTransportServicePrices({ ...params, page: 1 })
          }}
        />
        <Paginate
          {...otherProps}
          onChange={page => {
            getTransportServicePrices({ ...params, page })
          }}
        />
      </div>
      <Listable total={total} isFetching={isFetching}>
        <Table
          responsive
          headers={[
            "Start Date",
            "End Date",
            "Cab Type",
            "Service",
            "Price",
            "/km",
            "Toll",
            "Parking",
            "Night",
            "Min Km/Day",
          ]}
          rows={transportServicePrices.map(
            ({
              start_date,
              end_date,
              cab_type,
              transport_service,
              price,
              per_km_charges,
              minimum_km_per_day,
              night_charges,
              parking_charges,
              toll_charges,
            }) => [
              moment
                .utc(start_date)
                .local()
                .format("DD/MM/YYYY"),
              moment
                .utc(end_date)
                .local()
                .format("DD/MM/YYYY"),
              cab_type.name,
              transport_service.name,
              price,
              per_km_charges,
              toll_charges,
              parking_charges,
              night_charges,
              minimum_km_per_day,
            ]
          )}
          alignCols={{
            4: "right",
            5: "right",
            6: "right",
            7: "right",
            8: "right",
            9: "right",
          }}
        />
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)
