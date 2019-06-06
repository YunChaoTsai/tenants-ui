import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link, Redirect } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import moment from "moment"

import { ThunkAction, ThunkDispatch } from "./../types"
import { IUser, actions, IStateWithKey, selectors } from "./store"

function XHR(xhr: AxiosInstance) {
  return {
    getUser(id: string): Promise<IUser> {
      return xhr.get(`/users/${id}`).then(({ data }) => data.data)
    },
  }
}

export const getUser = (id: string): ThunkAction<Promise<IUser>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getUser(id)
    .then(user => {
      dispatch(actions.item.success(user))
      return user
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  user?: IUser
}
interface DispatchProps {
  getUser: (id: string) => Promise<IUser>
}
interface OwnProps {
  userId?: string
  render: (props: StateProps & { userId?: string }) => React.ReactNode
}
interface UsersProps extends OwnProps, StateProps, DispatchProps {}

export const withUserData = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  (state, ownProps) => {
    const usersSelector = selectors(state)
    return {
      isFetching: usersSelector.isFetching,
      user: usersSelector.getItem(ownProps.userId),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getUser: (id: string) => dispatch(getUser(id)),
  })
)

export const UserDataProvider = withUserData(function UserDataProvider({
  getUser,
  user,
  isFetching,
  userId,
  render,
}: UsersProps) {
  useEffect(() => {
    if (userId) getUser(userId)
  }, [])
  return (
    <Fragment>
      {render({
        user,
        isFetching,
        userId,
      })}
    </Fragment>
  )
})

export default function User({
  navigate,
  userId,
}: RouteComponentProps<{ userId: string }>) {
  return (
    <UserDataProvider
      userId={userId}
      render={({ user, isFetching }) => {
        if (!userId) {
          navigate && navigate("/users")
          return null
        }
        return (
          <Fragment>
            <Helmet>
              <title>{user ? user.name : ""} | User</title>
            </Helmet>
            <Link to="..">Back to list</Link>
            {isFetching ? (
              "Loading..."
            ) : user ? (
              <div>
                <h3>
                  {user.name}{" "}
                  <Link to="edit" title="Edit Name">
                    &#9998;
                  </Link>
                </h3>
                <p>
                  Roles:{" "}
                  {(user.roles || []).map((r, i, arr) => (
                    <span key={r.id}>
                      {r.name}
                      {i !== arr.length - 1 ? " • " : ""}
                    </span>
                  ))}
                  <Link to="edit-roles" title="Edit Roles">
                    &#9998;
                  </Link>
                </p>
                Email Verified on:{" "}
                {user.email_verified_at
                  ? moment
                      .utc(user.email_verified_at)
                      .local()
                      .format("Do MMM, YYYY \\at hh:mm A")
                  : "Not verified yet"}
                <br />
                Invited on:{" "}
                {moment
                  .utc(user.created_at)
                  .local()
                  .format("Do MMM, YYYY \\at hh:mm A")}
              </div>
            ) : (
              <Redirect noThrow to="/users" />
            )}
          </Fragment>
        )
      }}
    />
  )
}
