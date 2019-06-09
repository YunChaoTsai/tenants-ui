import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { IRoomType, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"

export function XHR(xhr: AxiosInstance) {
  return {
    getRoomTypes(params?: any): Promise<{ data: IRoomType[]; meta: any }> {
      return xhr.get("/room-types", { params }).then(resp => resp.data)
    },
  }
}

export const getRoomTypes = (
  params?: any
): ThunkAction<Promise<IRoomType[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getRoomTypes(params)
    .then(data => {
      dispatch(actions.list.success(data))
      return data.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends IPaginate {
  roomTypes: IRoomType[]
}
interface DispatchProps {
  getRoomTypes: (params?: any) => Promise<IRoomType[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const roomTypesSelector = selectors(state)
    return {
      ...roomTypesSelector.meta,
      isFetching: roomTypesSelector.isFetching,
      roomTypes: roomTypesSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getRoomTypes: (params?: any) => dispatch(getRoomTypes(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({
  getRoomTypes,
  roomTypes,
  total,
  from,
  to,
  currentPage,
  lastPage,
  isFetching,
}: ListProps) {
  const [params, setParams] = useSearch()
  useEffect(() => {
    getRoomTypes({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Room Types</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getRoomTypes({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            from={from}
            to={to}
            isFetching={isFetching}
            currentPage={currentPage}
            lastPage={lastPage}
            onChange={page => getRoomTypes({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          bordered
          striped
          headers={["Name", "Description"]}
          rows={roomTypes.map(roomType => [
            roomType.name,
            roomType.description,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectRoomTypesProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectRoomTypes = withXHR<SelectRoomTypesProps>(
  function SelectRoomTypes({ xhr, ...otherProps }: SelectRoomTypesProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getRoomTypes({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
