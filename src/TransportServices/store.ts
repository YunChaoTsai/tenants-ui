import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IModelState,
  IMeta,
  createReducer,
} from "./../model"
import { store as locationStore } from "./../Locations"

export const key = "TRANSPORT_SERVICES_STATE"

export interface ITransportService extends IBaseItem {
  id: number
  distance: number
  name: string
  locations: locationStore.ILocation[]
}

export interface ITransportServices extends IBaseState<ITransportService> {}

export interface IState extends IModelState<ITransportService> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ITransportService>(),
}

export const actions = {
  list: createAsyncAction(
    "@TRANSPORT_SERVICES/LIST_FETCH_REQUEST",
    "@TRANSPORT_SERVICES/LIST_FETCH_SUCCESS",
    "@TRANSPORT_SERVICES/LIST_FETCH_FAILED"
  )<any, { data: ITransportService[]; meta: IMeta }, Error>(),
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
