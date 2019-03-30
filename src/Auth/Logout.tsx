import React, { useEffect } from "react"
import { RouteComponentProps } from "@reach/router"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"

import { ThunkAction, ThunkDispatch } from "./../types"
import { actions } from "./store"
import { searchToQuery } from "./../utils"

// actions
function XHR(xhr: AxiosInstance) {
  return {
    logout(): Promise<any> {
      return xhr.delete("/logout").then(resp => {
        localStorage.removeItem("access_token")
        return resp
      })
    },
  }
}
export const logout = (): ThunkAction<Promise<any>> => (
  dispatch,
  getState,
  { xhr }
) =>
  XHR(xhr)
    .logout()
    .then(() => {
      dispatch(actions.logout.success())
    })

// component
interface OwnProps extends RouteComponentProps {}
interface DispatchProps {
  logout: () => Promise<any>
}
interface LogoutProps extends OwnProps, DispatchProps {}

function Logout({ logout, navigate, location }: LogoutProps) {
  // get the `from` query parameter from the logout props
  // and redirect back to `from` if present
  const query = searchToQuery(location && location.search)
  const from = query["from"]
  useEffect(() => {
    logout().then(() => {
      navigate && navigate(from || "/")
    })
  }, [])
  return <div>Logging out</div>
}
export default connect<{}, DispatchProps, OwnProps>(
  null,
  (dispatch: ThunkDispatch) => ({
    logout: () => dispatch(logout()),
  })
)(Logout)
