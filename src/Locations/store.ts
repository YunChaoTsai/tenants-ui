import { createAsyncAction, ActionType } from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IMeta,
  IModelState,
  createReducer,
} from "./../model"

export const key = "LOCATIONS_STATE"

export interface ICountry {
  id: number
  name: string
  short_name: string
  dial_code: string
  flag: string
}

export interface ICountryState {
  id: number
  name: string
  country_id: number
}

export interface ICity {
  id: number
  name: string
  state_id: number
}

export interface ILocation extends IBaseItem {
  id: number
  name: string
  short_name: string
  city_id: number
  state_id: number
  country_id: number
  city?: ICity
  state?: ICountryState
  country?: ICountry
  latitude: string
  longitude: string
}

export interface ILocations extends IBaseState<ILocation> {}

export interface IState extends IModelState<ILocation> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ILocation>(),
}

export const actions = {
  list: createAsyncAction(
    "@LOCATIONS/LIST_FETCH_REQUEST",
    "@LOCATIONS/LIST_FETCH_SUCCESS",
    "@LOCATIONS/LIST_FETCH_FAILED"
  )<undefined, { data: ILocation[]; meta: IMeta }, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer(INITIAL_STATE, actions as any)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
