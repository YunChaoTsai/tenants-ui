import { createAsyncAction, ActionType, getType } from "typesafe-actions"

export const key = "AUTHENTICATED_USER_STATE"

export enum AuthUserStatus {
  DEFAULT = "DEFAULT",
  CHECKING = "CHECKING",
  UN_AUTHENTICATED = "UN_AUTHENTICATED",
  AUTHENTICATING = "AUTHENTICATING",
  AUTHENTICATED = "AUTHENTICATED",
}

export interface IUser {
  id: number
  name: string
  email: string
}

export interface IState {
  readonly data?: IUser
  readonly status: AuthUserStatus
}

export interface IStateWithKey {
  readonly [key]: IState
}

export interface IAuthToken {
  access_token: string
  expires_in: number
}

/**
 * ================ State ======================== *
 */
// Initial state
const INITIAL_STATE: IState = {
  data: undefined,
  status: AuthUserStatus.DEFAULT,
}
// Redux actions
export const actions = {
  checkAuth: createAsyncAction(
    "@AUTH/CHECK_AUTH_REQUEST",
    "@AUTH/CHECK_AUTH_SUCCESS",
    "@AUTH/CHECK_AUTH_FAILED"
  )<undefined, IUser, Error>(),
  login: createAsyncAction(
    "@AUTH/LOGIN_REQUEST",
    "@AUTH/LOGIN_SUCCESS",
    "@AUTH/LOGIN_FAILED"
  )<undefined, IUser, Error>(),
  logout: createAsyncAction(
    "@AUTH/LOGOUT_REQUEST",
    "@AUTH/LOGOUT_SUCCESS",
    "@AUTH/LOGOUT_FAILED"
  )<undefined, undefined, Error>(),
}

export type TActions = ActionType<typeof actions>

// state reducer
export function reducer(
  state: IState = INITIAL_STATE,
  action: TActions
): IState {
  switch (action.type) {
    case getType(actions.checkAuth.request):
      return { ...state, status: AuthUserStatus.CHECKING }
    case getType(actions.login.request):
      return { ...state, status: AuthUserStatus.AUTHENTICATING }
    case getType(actions.checkAuth.success):
    case getType(actions.login.success):
      return {
        ...state,
        status: AuthUserStatus.AUTHENTICATED,
        data: action.payload,
      }
    case getType(actions.checkAuth.failure):
    case getType(actions.login.failure):
      return { ...state, status: AuthUserStatus.UN_AUTHENTICATED }
    case getType(actions.logout.success):
      return {
        ...state,
        status: AuthUserStatus.UN_AUTHENTICATED,
        data: undefined,
      }
    default:
      return state
  }
}

/**
 * ====================== Selector for State ======================== *
 */
export function selectors<IAppState extends IStateWithKey>(state: IAppState) {
  return {
    get state(): IState {
      return state[key]
    },
    get user() {
      return this.state.data
    },
    get status() {
      return this.state.status
    },
    get noRequestYet() {
      return this.status === AuthUserStatus.DEFAULT
    },
    get isAuthenticated(): boolean {
      return this.status === AuthUserStatus.AUTHENTICATED
    },
    get isAuthenticating(): boolean {
      return (
        this.status === AuthUserStatus.AUTHENTICATING ||
        this.status === AuthUserStatus.CHECKING
      )
    },
    get wait(): boolean {
      return this.isAuthenticating || this.noRequestYet
    },
  }
}
