import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"

import {
  ILocation,
  ICountry,
  ICountryState,
  ICity,
  actions,
  IStateWithKey,
  selectors,
} from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { Async, AsyncProps } from "./../Shared/Select"
import { withXHR, XHRProps } from "./../xhr"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Table } from "../Shared/Table"

export function XHR(xhr: AxiosInstance) {
  return {
    getLocations(params?: any): Promise<{ data: ILocation[]; meta: any }> {
      return xhr.get("/locations", { params }).then(resp => resp.data)
    },
    getCountries(params?: any): Promise<ICountry[]> {
      return xhr
        .get("/locations/countries", { params })
        .then(({ data }) => data.data)
    },
    getStates(params?: any): Promise<ICountryState[]> {
      return xhr
        .get("/locations/states", { params })
        .then(({ data }) => data.data)
    },
    getCities(params?: any): Promise<ICity[]> {
      return xhr
        .get("/locations/cities", { params })
        .then(({ data }) => data.data)
    },
  }
}

export const getLocations = (
  params?: any
): ThunkAction<Promise<ILocation[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getLocations(params)
    .then(data => {
      dispatch(actions.list.success(data))
      return data.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends PaginateProps {
  isFetching: boolean
  locations: ILocation[]
}
interface DispatchProps {
  getLocations: (params?: any) => Promise<ILocation[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const locationsSelector = selectors(state)
    return {
      ...locationsSelector.meta,
      isFetching: locationsSelector.isFetching,
      locations: locationsSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getLocations: (params?: any) => dispatch(getLocations(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({ getLocations, locations, ...otherProps }: ListProps) {
  const { total, isFetching, currentPage } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getLocations({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Locations</title>
      </Helmet>
      <div className="display--flex justify-content--space-between">
        <Search
          onSearch={params => {
            setParams(params)
            getLocations({ ...params, page: 1 })
          }}
        />
        <Paginate
          {...otherProps}
          onChange={page => getLocations({ ...params, page })}
        />
      </div>
      <Listable total={total} isFetching={isFetching}>
        <Table
          headers={["Name", "Latitude", "Longitude"]}
          rows={locations.map(location => [
            location.name,
            location.latitude,
            location.longitude,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectLocations = withXHR<SelectProps>(function SelectLocations({
  xhr,
  ...otherProps
}: SelectProps) {
  return (
    <Async
      multiple
      {...otherProps}
      fetch={q =>
        XHR(xhr)
          .getLocations({ q })
          .then(resp => resp.data)
      }
    />
  )
})

export const SelectCountries = withXHR<SelectProps>(function SelectCountries({
  xhr,
  ...otherProps
}: SelectProps) {
  return (
    <Async multiple {...otherProps} fetch={q => XHR(xhr).getCountries({ q })} />
  )
})

export const SelectStates = withXHR<SelectProps>(function SelectStates({
  xhr,
  ...otherProps
}: SelectProps) {
  return (
    <Async multiple {...otherProps} fetch={q => XHR(xhr).getStates({ q })} />
  )
})

export const SelectCities = withXHR<SelectProps>(function SelectCities({
  xhr,
  ...otherProps
}: SelectProps) {
  return (
    <Async multiple {...otherProps} fetch={q => XHR(xhr).getCities({ q })} />
  )
})
