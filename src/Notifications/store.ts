import {
  createAsyncAction,
  ActionType,
  getType,
  createStandardAction,
} from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IModelState,
  IMeta,
  createReducer,
} from "./../model"

export const key = "NOTIFICATIONS_STATE"

export interface INotification extends IBaseItem {
  type: "App\\Notifications\\TripConverted"
  data: { [key: string]: any }
  read_at: string | null
  created_at: string
}

export interface INotifications extends IBaseState<INotification> {}

export interface IState extends IModelState<INotification> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<INotification>(),
}

export const actions = {
  list: createAsyncAction(
    "@NOTIFICATIONS/LIST_FETCH_REQUEST",
    "@NOTIFICATIONS/LIST_FETCH_SUCCESS",
    "@NOTIFICATIONS/LIST_FETCH_FAILED"
  )<undefined, { data: INotification[]; meta?: IMeta }, Error>(),
  markAsRead: createAsyncAction(
    "@NOTIFICATIONS/MARK_AS_READ_REQUEST",
    "@NOTIFICATIONS/MARK_AS_READ_SUCCESS",
    "@NOTIFICATIONS/MARK_AS_READ_FAILED"
  )<undefined, { data: INotification[] }, Error>(),
  pushNewNotification: createStandardAction(
    "@NOTIFICATIONS/PUSH_NEW_NOTIFICATION"
  )<INotification>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<INotification, IState>(
  INITIAL_STATE,
  actions as any,
  (state: IState, action) => {
    switch (action.type) {
      case getType(actions.markAsRead.success):
        return {
          ...state,
          state: model(state.state).insert(action.payload.data),
        }
      case getType(actions.pushNewNotification):
        return {
          ...state,
          state: model(state.state).insert([action.payload], undefined, true),
        }
    }
    return state
  }
)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model<INotification>(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
