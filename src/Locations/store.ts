import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import { IBaseItem, IBaseState, init, model } from "./../model"

export const key = "LOCATIONS_STATE"

export interface ICountry {
  id: number
  name: string
  short_name: string
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
}

export interface IService {
  id: number
  distance: number
  name: string
  locations: ILocation[]
}

export interface ILocations extends IBaseState<ILocation> {}

export interface IState {
  readonly isFetching: boolean
  readonly locations: ILocations
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  locations: init<ILocation>(),
}

export const actions = {
  list: createAsyncAction(
    "@LOCATIONS/LIST_FETCH_REQUEST",
    "@LOCATIONS/LIST_FETCH_SUCCESS",
    "@LOCATIONS/LIST_FETCH_FAILED"
  )<any, ILocation[], Error>(),
}

export type TActions = ActionType<typeof actions>

export function reducer(
  state: IState = INITIAL_STATE,
  action: TActions
): IState {
  switch (action.type) {
    case getType(actions.list.request):
      return { ...state, isFetching: true }
    case getType(actions.list.success):
      return {
        ...state,
        locations: model(state.locations).insert(action.payload),
        isFetching: false,
      }
    case getType(actions.list.failure):
      return { ...state, isFetching: false }
    default:
      return state
  }
}

export function selectors<State extends IStateWithKey>(state: State) {
  return {
    get state(): IState {
      return state[key]
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
    get locations(): ILocation[] {
      return model<ILocation>(this.state.locations).get()
    },
    getLocation(id?: string | number): ILocation | undefined {
      if (!id) return
      return model<ILocation>(this.state.locations).getItem(id)
    },
  }
}
