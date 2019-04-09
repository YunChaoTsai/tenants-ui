import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import { IBaseItem, IBaseState, init, model } from "./../model"
import { store as locationStore } from "./../Locations"

export const key = "CAB_TYPES_STATE"

export interface ICabType extends IBaseItem {
  id: number
  name: string
  capacity: number
}

export interface ICabPrice {
  id: number
  start_date: string
  end_date: string
  cab_type_id: number
  cab_type: ICabType
  location_service_id: number
  location_service: locationStore.IService
  price?: number
  per_km_charges?: number
  minimum_km_per_day?: number
  other_charges: number
}

export interface ICabTypes extends IBaseState<ICabType> {}

export interface IState {
  readonly isFetching: boolean
  readonly cabTypes: ICabTypes
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  cabTypes: init<ICabType>(),
}

export const actions = {
  list: createAsyncAction(
    "@CAB_TYPES/LIST_FETCH_REQUEST",
    "@CAB_TYPES/LIST_FETCH_SUCCESS",
    "@CAB_TYPES/LIST_FETCH_FAILED"
  )<any, ICabType[], Error>(),
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
        cabTypes: model(state.cabTypes).insert(action.payload),
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
    get cabTypes(): ICabType[] {
      return model<ICabType>(this.state.cabTypes).get()
    },
    getCabType(id?: string | number): ICabType | undefined {
      if (!id) return
      return model<ICabType>(this.state.cabTypes).getItem(id)
    },
  }
}
