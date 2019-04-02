import {
  ThunkAction as ThunkActionWithExtraAgrument,
  ThunkDispatch as ThunkDispatchWithExtraAgrument,
} from "redux-thunk"
import { AxiosInstance } from "axios"

import { store as authStore } from "./Auth"
import { store as roleStore } from "./Roles"
import { store as userStore } from "./Users"
import { store as mealPlanStore } from "./MealPlans"
import { store as roomTypeStore } from "./RoomTypes"
import { store as locationStore } from "./Locations"
import { store as hotelStore } from "./Hotels"

export interface IAppState
  extends authStore.IStateWithKey,
    roleStore.IStateWithKey,
    userStore.IStateWithKey,
    mealPlanStore.IStateWithKey,
    roomTypeStore.IStateWithKey,
    locationStore.IStateWithKey,
    hotelStore.IStateWithKey {}

export interface IExtraThunkArgument {
  xhr: AxiosInstance
}

export type TRootAction =
  | authStore.TActions
  | roleStore.TActions
  | userStore.TActions
  | mealPlanStore.TActions
  | roomTypeStore.TActions
  | locationStore.TActions
  | hotelStore.TActions

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
