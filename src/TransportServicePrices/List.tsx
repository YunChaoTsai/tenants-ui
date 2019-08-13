import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import moment from "moment"
import { Table, Paginate } from "@tourepedia/ui"

import {
  ITransportServicePrice,
  actions,
  selectors,
  IStateWithKey,
} from "./store"
import { ThunkAction } from "../types"
import Helmet from "react-helmet-async"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useSelector } from "react-redux"
import { useThunkDispatch, numberToLocalString } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getTransportServicePrices(
      params?: any
    ): Promise<{ data: ITransportServicePrice[]; meta: any }> {
      return xhr.get("/cab-prices", { params }).then(resp => resp.data)
    },
  }
}

export const getTransportServicePricesAction = (
  params?: any
): ThunkAction<Promise<ITransportServicePrice[]>> => async (
  dispatch,
  _,
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

function useTransportServicePricesState() {
  interface StateProps extends IPaginate {
    transportServicePrices: ITransportServicePrice[]
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const transportServicePricesSelector = selectors(state)
    return {
      ...transportServicePricesSelector.meta,
      isFetching: transportServicePricesSelector.isFetching,
      transportServicePrices: transportServicePricesSelector.get(),
    }
  })
}
function useTransportServicePricesFetch() {
  const dispatch = useThunkDispatch()
  return useCallback(
    (params?: any) => dispatch(getTransportServicePricesAction(params)),
    [dispatch]
  )
}

function useTransportServicePrices() {
  const state = useTransportServicePricesState()
  const fetchTransportServicePrices = useTransportServicePricesFetch()
  return {
    ...state,
    fetchTransportServicePrices,
  }
}
export default function List(_: RouteComponentProps) {
  const {
    fetchTransportServicePrices,
    transportServicePrices,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useTransportServicePrices()
  const [params, setParams] = useSearch()
  useEffect(() => {
    fetchTransportServicePrices({ page: currentPage })
  }, [fetchTransportServicePrices])
  return (
    <Fragment>
      <Helmet>
        <title>Transport Service Prices Listing</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              fetchTransportServicePrices({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            from={from}
            to={to}
            currentPage={currentPage}
            lastPage={lastPage}
            isFetching={isFetching}
            onChange={page => {
              fetchTransportServicePrices({ ...params, page })
            }}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          bordered
          striped
          responsive
          headers={[
            "Start Date",
            "End Date",
            "Cab Type",
            "Service",
            "Locality",
            "Per Day",
            "Per Day Parking",
            "Fixed",
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
              cab_locality,
              transport_service,
              per_day_charges,
              per_day_parking_charges,
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
              cab_locality ? cab_locality.short_name : "",
              numberToLocalString(per_day_charges),
              numberToLocalString(per_day_parking_charges),
              numberToLocalString(price),
              per_km_charges,
              toll_charges,
              parking_charges,
              night_charges,
              numberToLocalString(minimum_km_per_day),
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
