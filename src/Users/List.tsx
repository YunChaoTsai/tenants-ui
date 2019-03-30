import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"

import { ThunkAction, ThunkDispatch } from "./../types"
import { RedirectUnlessAuthenticated } from "./../Auth"
import { IUser, actions, IStateWithKey, selectors } from "./store"

export function XHR(xhr: AxiosInstance) {
  return {
    getUsers(params?: any): Promise<IUser[]> {
      return xhr.get("/users", { params }).then(({ data }) => data.users)
    },
  }
}

export const getUsers = (params?: any): ThunkAction<Promise<IUser[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getUsers(params)
    .then(users => {
      dispatch(actions.list.success(users))
      return users
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  users: IUser[]
}
interface DispatchProps {
  getUsers: (params?: any) => Promise<IUser[]>
}
interface OwnProps extends RouteComponentProps {}
interface UsersProps extends OwnProps, StateProps, DispatchProps {}
export function Users({ getUsers, users, isFetching }: UsersProps) {
  useEffect(() => {
    getUsers()
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Users</title>
      </Helmet>
      {!isFetching ? `Total: ${users.length}` : ""}
      <ul>
        {isFetching ? (
          <li>Loading...</li>
        ) : (
          users.map(r => (
            <li key={r.id}>
              <Link to={r.id.toString()}>{r.name}</Link>
            </li>
          ))
        )}
      </ul>
    </Fragment>
  )
}

export default connect<StateProps, DispatchProps, OwnProps, IStateWithKey>(
  state => {
    const usersSelector = selectors(state)
    return {
      isFetching: usersSelector.isFetching,
      users: usersSelector.users,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getUsers: (params?: any) => dispatch(getUsers(params)),
  })
)(Users)
