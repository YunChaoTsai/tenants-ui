import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps, Link } from "@reach/router"
import { Omit } from "utility-types"

import { IRoomType, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"

export function XHR(xhr: AxiosInstance) {
  return {
    getRoomTypes(params?: any): Promise<IRoomType[]> {
      return xhr.get("/room-types").then(({ data }) => data.room_types)
    },
  }
}

export const getRoomTypes = (
  params?: any
): ThunkAction<Promise<IRoomType[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getRoomTypes(params)
    .then(roomTypes => {
      dispatch(actions.list.success(roomTypes))
      return roomTypes
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
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
      isFetching: roomTypesSelector.isFetching,
      roomTypes: roomTypesSelector.roomTypes,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getRoomTypes: (params?: any) => dispatch(getRoomTypes(params)),
  })
)

interface ListProps extends OwnProps, StateProps, DispatchProps, RouteComponentProps {}
function List({ getRoomTypes, roomTypes, isFetching }: ListProps) {
  useEffect(() => {
    getRoomTypes()
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Room Types</title>
      </Helmet>
      {!isFetching ? `Total: ${roomTypes.length}` : ""}
      <ul>
        {isFetching
          ? "Loading..."
          : roomTypes.map(roomType => (
              <li key={roomType.id}>
                {roomType.name} - {roomType.description}
                {/* <Link to={`${roomType.id.toString()}/edit`}>Edit</Link> */}
              </li>
            ))}
      </ul>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectRoomTypesProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectRoomTypes = withXHR<SelectRoomTypesProps>(
  function SelectPermissions({ xhr, ...otherProps }: SelectRoomTypesProps) {
    return (
      <Async multiple fetch={q => XHR(xhr).getRoomTypes()} {...otherProps} />
    )
  }
)
