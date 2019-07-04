import React, { Fragment, useEffect, useCallback } from "react"
import Helmet from "react-helmet-async"
import { useSelector } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import {
  IHotelPaymentPreference,
  actions,
  IStateWithKey,
  selectors,
} from "./store"
import { ThunkAction } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "./../model"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getHotelPaymentPreferences(
      params?: any
    ): Promise<{ data: IHotelPaymentPreference[]; meta: any }> {
      return xhr
        .get("/hotel-payment-preferences", { params })
        .then(resp => resp.data)
    },
    async getHotelPaymentReferences(
      params?: any
    ): Promise<{ data: { id: number; name: string }[]; meta: any }> {
      return xhr
        .get("/hotel-payment-preferences/references", { params })
        .then(resp => resp.data)
    },
  }
}

export const getHotelPaymentPreferencesAction = (
  params?: any
): ThunkAction<Promise<IHotelPaymentPreference[]>> => async (
  dispatch,
  _,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getHotelPaymentPreferences(params)
    .then(hotelPaymentPreferences => {
      dispatch(actions.list.success(hotelPaymentPreferences))
      return hotelPaymentPreferences.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

export function useHotelPaymentPreferencesState() {
  interface StateProps extends IPaginate {
    hotelPaymentPreferences: IHotelPaymentPreference[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const hotelPaymentPreferencesSelector = selectors(state)
    return {
      ...hotelPaymentPreferencesSelector.meta,
      isFetching: hotelPaymentPreferencesSelector.isFetching,
      hotelPaymentPreferences: hotelPaymentPreferencesSelector.get(),
    }
  })
}

function useHotelPaymentPreferencesFetch() {
  const dispatch = useThunkDispatch()
  return useCallback(
    (params?: any) => dispatch(getHotelPaymentPreferencesAction(params)),
    [dispatch]
  )
}

function useHotelPaymentPreferences() {
  return {
    ...useHotelPaymentPreferencesState(),
    fetchHotelPaymentPreferences: useHotelPaymentPreferencesFetch(),
  }
}

export default function List(_: RouteComponentProps) {
  const [params, setParams] = useSearch()
  const {
    hotelPaymentPreferences,
    fetchHotelPaymentPreferences: getHotelPaymentPreferences,
    total,
    from,
    to,
    isFetching,
    currentPage,
    lastPage,
  } = useHotelPaymentPreferences()
  useEffect(() => {
    getHotelPaymentPreferences({ page: currentPage })
  }, [getHotelPaymentPreferences])
  return (
    <Fragment>
      <Helmet>
        <title>Hotel Payment Preferences List</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getHotelPaymentPreferences({ ...params, page: 1 })
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
            onChange={page => getHotelPaymentPreferences({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          headers={["Description"]}
          bordered
          striped
          rows={hotelPaymentPreferences.map(hotelPaymentPreference => [
            hotelPaymentPreference.name,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

interface SelectHotelPaymentPreferencesProps
  extends XHRProps,
    Omit<AsyncProps, "fetch"> {}

export const SelectHotelPaymentPreferences = withXHR<
  SelectHotelPaymentPreferencesProps
>(function SelectHotelPaymentPreferences({
  xhr,
  ...otherProps
}: SelectHotelPaymentPreferencesProps) {
  return (
    <Async
      multiple
      {...otherProps}
      fetch={q =>
        XHR(xhr)
          .getHotelPaymentPreferences({ q })
          .then(resp => resp.data)
      }
    />
  )
})

export const SelectHotelPaymentReferences = withXHR<
  SelectHotelPaymentPreferencesProps
>(function SelectHotelPaymentReferences({
  xhr,
  ...otherProps
}: SelectHotelPaymentPreferencesProps) {
  return (
    <Async
      multiple
      {...otherProps}
      fetch={q =>
        XHR(xhr)
          .getHotelPaymentReferences({ q })
          .then(resp => resp.data)
      }
    />
  )
})
