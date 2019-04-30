import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"

import { ITransportService, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"

export function XHR(xhr: AxiosInstance) {
  return {
    getTransportServices(
      params?: any
    ): Promise<{ data: ITransportService[]; meta: any }> {
      return xhr.get("/transport-services", { params }).then(resp => resp.data)
    },
  }
}

export const getTransportServices = (
  params?: any
): ThunkAction<Promise<ITransportService[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTransportServices(params)
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
  transportServices: ITransportService[]
}
interface DispatchProps {
  getTransportServices: (params?: any) => Promise<ITransportService[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const transportServicesSelector = selectors(state)
    return {
      ...transportServicesSelector.meta,
      isFetching: transportServicesSelector.isFetching,
      transportServices: transportServicesSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTransportServices: (params?: any) =>
      dispatch(getTransportServices(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({
  getTransportServices,
  transportServices,
  ...otherProps
}: ListProps) {
  const { isFetching, total, currentPage } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getTransportServices({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Transport Services List</title>
      </Helmet>
      <div className="display--flex justify-content--space-between">
        <Search
          onSearch={params => {
            setParams(params)
            getTransportServices({ ...params, page: 1 })
          }}
        />
        <Paginate
          {...otherProps}
          onChange={page => getTransportServices({ ...params, page })}
        />
      </div>
      <Listable total={total} isFetching={isFetching}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Distance(kms)</th>
            </tr>
          </thead>
          <tbody>
            {transportServices.map(transportService => (
              <tr key={transportService.id}>
                <td>{transportService.name}</td>
                <td>{transportService.distance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectTransportServicesProps
  extends XHRProps,
    Omit<AsyncProps, "fetch"> {}

export const SelectTransportServices = withXHR<SelectTransportServicesProps>(
  function SelectTransportServices({
    xhr,
    ...otherProps
  }: SelectTransportServicesProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getTransportServices({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
