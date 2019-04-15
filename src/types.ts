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
import { store as cabTypeStore } from "./CabTypes"
import { store as cabStore } from "./Cabs"
import { store as tripStore } from "./Trips"
import { store as tripSourceStore } from "./TripSources"

export interface IAppState
  extends authStore.IStateWithKey,
    roleStore.IStateWithKey,
    userStore.IStateWithKey,
    mealPlanStore.IStateWithKey,
    roomTypeStore.IStateWithKey,
    locationStore.IStateWithKey,
    hotelStore.IStateWithKey,
    cabTypeStore.IStateWithKey,
    cabStore.IStateWithKey,
    tripStore.IStateWithKey,
    tripSourceStore.IStateWithKey {}

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
  | cabTypeStore.TActions
  | cabStore.TActions
  | tripStore.TActions
  | tripSourceStore.TActions

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
