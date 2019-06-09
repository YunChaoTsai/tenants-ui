import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"

import { IRoomType, actions, IStateWithKey, selectors } from "./store"
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

interface StateProps extends PaginateProps {
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
function List({ getRoomTypes, roomTypes, ...otherProps }: ListProps) {
  const { isFetching, total, currentPage } = otherProps
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
            {...otherProps}
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
