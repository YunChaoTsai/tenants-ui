import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import { IBaseItem, IBaseState, init, model } from "./../model"

export const key = "ROOM_TYPES_STATE"

export interface IRoomType extends IBaseItem {
  id: number
  name: string
  description: string
}

export interface IRoomTypes extends IBaseState<IRoomType> {}

export interface IState {
  readonly isFetching: boolean
  readonly roomTypes: IRoomTypes
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  roomTypes: init<IRoomType>(),
}

export const actions = {
  list: createAsyncAction(
    "@ROOM_TYPES/LIST_FETCH_REQUEST",
    "@ROOM_TYPES/LIST_FETCH_SUCCESS",
    "@ROOM_TYPES/LIST_FETCH_FAILED"
  )<any, IRoomType[], Error>(),
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
        roomTypes: model(state.roomTypes).insert(action.payload),
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
    get roomTypes(): IRoomType[] {
      return model<IRoomType>(this.state.roomTypes).get()
    },
    getRoomType(id?: string | number): IRoomType | undefined {
      if (!id) return
      return model<IRoomType>(this.state.roomTypes).getItem(id)
    },
  }
}
