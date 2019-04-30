import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"

import { ThunkAction, ThunkDispatch } from "./../types"
import { IUser, actions, IStateWithKey, selectors } from "./store"
import { List } from "./../Shared/List"
import { Paginate, PaginateProps } from "./../Shared/Paginate"
import { Search, useSearch } from "./../Shared/Search"

export function XHR(xhr: AxiosInstance) {
  return {
    getUsers(params?: any): Promise<{ data: IUser[]; meta: any }> {
      return xhr.get("/users", { params }).then(resp => resp.data)
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
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends PaginateProps {
  users: IUser[]
}
interface DispatchProps {
  getUsers: (params?: any) => Promise<any>
}
interface OwnProps extends RouteComponentProps {}
interface UsersProps extends OwnProps, StateProps, DispatchProps {}
export function Users({ getUsers, users, ...otherProps }: UsersProps) {
  const [params, setParams] = useSearch()
  const { currentPage, total, isFetching } = otherProps
  useEffect(() => {
    getUsers({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <div className="display--flex justify-content--space-between">
        <Search
          onSearch={params => {
            setParams(params)
            getUsers({ ...params, page: 1 })
          }}
        />
        <Paginate
          {...otherProps}
          onChange={page => getUsers({ ...params, page })}
        />
      </div>
      <List isFetching={isFetching} total={total}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Email Verified At</th>
            </tr>
          </thead>
          <tbody>
            {users.map(r => (
              <tr key={r.id}>
                <td>
                  <Link to={r.id.toString()}>{r.name}</Link>
                  <br />
                  {r.roles.map(r => r.name).join(" • ")}
                </td>
                <td>{r.email}</td>
                <td>{r.email_verified_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </List>
    </Fragment>
  )
}

export default connect<StateProps, DispatchProps, OwnProps, IStateWithKey>(
  state => {
    const usersSelector = selectors(state)
    return {
      ...usersSelector.meta,
      isFetching: usersSelector.isFetching,
      users: usersSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getUsers: (params?: any) => dispatch(getUsers(params)),
  })
)(Users)
