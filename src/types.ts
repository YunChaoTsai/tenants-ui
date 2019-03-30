import {
  ThunkAction as ThunkActionWithExtraAgrument,
  ThunkDispatch as ThunkDispatchWithExtraAgrument,
} from "redux-thunk"
import { AxiosInstance } from "axios"

import { store as authStore } from "./Auth"
import { store as roleStore } from "./Roles"
import { store as userStore } from "./Users"

export interface IAppState
  extends authStore.IStateWithKey,
    roleStore.IStateWithKey,
    userStore.IStateWithKey {}

export interface IExtraThunkArgument {
  xhr: AxiosInstance
}

export type TRootAction =
  | authStore.TActions
  | roleStore.TActions
  | userStore.TActions

export type ThunkAction<Response> = ThunkActionWithExtraAgrument<
  Response,
  IAppState,
  IExtraThunkArgument,
  TRootAction
>

export type ThunkDispatch = ThunkDispatchWithExtraAgrument<
  IAppState,
  IExtraThunkArgument,
  TRootAction
>
