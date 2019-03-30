import React, { useEffect, Fragment } from "react"
import { connect } from "react-redux"
import { Redirect, Location } from "@reach/router"
import { AxiosInstance } from "axios"

import { selectors, actions, IUser, IStateWithKey } from "./store"
import { ThunkDispatch, ThunkAction } from "./../types"

function XHR(xhr: AxiosInstance) {
  return {
    getUser(): Promise<IUser> {
      return xhr.get("/me").then(({ data }: { data: { user: IUser } }) => {
        const { user } = data
        return user
      })
    },
  }
}
export const getUser = (): ThunkAction<Promise<IUser>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.checkAuth.request())
  return XHR(xhr)
    .getUser()
    .then(user => {
      dispatch(actions.checkAuth.success(user))
      return user
    })
    .catch(error => {
      dispatch(actions.checkAuth.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  user?: IUser
  isAuthenticating: boolean
  isAuthenticated: boolean
  noRequestYet: boolean
}
interface DispatchProps {
  getUser: () => Promise<IUser>
}
interface OwnProps {}
export interface AuthProps extends StateProps, DispatchProps, OwnProps {}
export const connectWithAuth = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const userSelector = selectors(state)
    return {
      user: userSelector.user,
      isAuthenticating: userSelector.isAuthenticating,
      isAuthenticated: userSelector.isAuthenticated,
      noRequestYet: userSelector.noRequestYet,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getUser: () => dispatch(getUser()),
  })
)

// get the authenticated user's data
interface AuthUserProviderProps extends AuthProps {
  children: (props: { wait: boolean; user?: IUser }) => React.ReactNode
}
function _AuthUserProvider({
  getUser,
  user,
  isAuthenticating,
  noRequestYet,
  children,
}: AuthUserProviderProps) {
  useEffect(() => {
    if (!user && !isAuthenticating) {
      getUser()
    }
  }, [])
  return (
    <Fragment>
      {children({ wait: isAuthenticating || noRequestYet, user })}
    </Fragment>
  )
}
export const AuthUserProvider = connectWithAuth(_AuthUserProvider)

export function RedirectUnlessAuthenticated({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <AuthUserProvider>
      {({ wait, user }) =>
        wait ? null : !user ? (
          <Location>
            {({ location }) => (
              <Redirect to={`/login?next=${location.pathname}`} noThrow />
            )}
          </Location>
        ) : (
          children || null
        )
      }
    </AuthUserProvider>
  )
}

export function RedirectIfAuthenticated({
  children,
  to = "/",
}: {
  children?: React.ReactNode
  to?: string
}) {
  return (
    <AuthUserProvider>
      {({ wait, user }) =>
        wait ? null : user ? <Redirect to={to} noThrow /> : children || null
      }
    </AuthUserProvider>
  )
}
