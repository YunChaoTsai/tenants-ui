import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"

import {
  IHotelPaymentPreference,
  actions,
  IStateWithKey,
  selectors,
} from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"
import { Table } from "@tourepedia/ui"
import { Grid, Col } from "../Shared/Layout"

export function XHR(xhr: AxiosInstance) {
  return {
    getHotelPaymentPreferences(
      params?: any
    ): Promise<{ data: IHotelPaymentPreference[]; meta: any }> {
      return xhr
        .get("/hotel-payment-preferences", { params })
        .then(resp => resp.data)
    },
    getHotelPaymentReferences(
      params?: any
    ): Promise<{ data: { id: number; name: string }[]; meta: any }> {
      return xhr
        .get("/hotel-payment-preferences/references", { params })
        .then(resp => resp.data)
    },
  }
}

export const getHotelPaymentPreferences = (
  params?: any
): ThunkAction<Promise<IHotelPaymentPreference[]>> => (
  dispatch,
  getState,
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

interface StateProps extends PaginateProps {
  hotelPaymentPreferences: IHotelPaymentPreference[]
}
interface DispatchProps {
  getHotelPaymentPreferences: (
    params?: any
  ) => Promise<IHotelPaymentPreference[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const hotelPaymentPreferencesSelector = selectors(state)
    return {
      ...hotelPaymentPreferencesSelector.meta,
      isFetching: hotelPaymentPreferencesSelector.isFetching,
      hotelPaymentPreferences: hotelPaymentPreferencesSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getHotelPaymentPreferences: (params?: any) =>
      dispatch(getHotelPaymentPreferences(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({
  getHotelPaymentPreferences,
  hotelPaymentPreferences,
  ...otherProps
}: ListProps) {
  const { total, isFetching, currentPage } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getHotelPaymentPreferences({ page: currentPage })
  }, [])
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
            {...otherProps}
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

export default connectWithList(List)

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
