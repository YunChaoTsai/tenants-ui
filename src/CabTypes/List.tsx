import React, { Fragment, useEffect, useState } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps, Link } from "@reach/router"
import { Omit } from "utility-types"

import { ICabType, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"

export function XHR(xhr: AxiosInstance) {
  return {
    getCabTypes(params?: any): Promise<ICabType[]> {
      return xhr
        .get("/cab-types", { params })
        .then(({ data }) => data.cab_types)
    },
  }
}

export const getCabTypes = (params?: any): ThunkAction<Promise<ICabType[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getCabTypes(params)
    .then(cabTypes => {
      dispatch(actions.list.success(cabTypes))
      return cabTypes
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  cabTypes: ICabType[]
}
interface DispatchProps {
  getCabTypes: (params?: any) => Promise<ICabType[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const cabTypesSelector = selectors(state)
    return {
      isFetching: cabTypesSelector.isFetching,
      cabTypes: cabTypesSelector.cabTypes,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getCabTypes: (params?: any) => dispatch(getCabTypes(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({ getCabTypes, cabTypes, isFetching }: ListProps) {
  useEffect(() => {
    getCabTypes()
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Cab Types</title>
      </Helmet>
      {!isFetching ? `Total: ${cabTypes.length}` : ""}
      {isFetching ? (
        "Loading..."
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {cabTypes.map(cabType => (
              <tr key={cabType.id}>
                <td>{cabType.name}</td>
                <td className="text--right">{cabType.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectCabTypeProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectCabTypes = withXHR<SelectCabTypeProps>(
  function SelectCabTypes({ xhr, ...otherProps }: SelectCabTypeProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q => XHR(xhr).getCabTypes({ q })}
      />
    )
  }
)
