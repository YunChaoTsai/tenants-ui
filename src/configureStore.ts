import {
  createStore,
  applyMiddleware,
  Middleware,
  Reducer,
  StoreEnhancer,
  Store,
} from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import thunkMiddleware from "redux-thunk"

export function configureStore<TState>(
  rootReducer: Reducer,
  {
    initialState,
    thunkExtraAgrs,
  }: { initialState?: TState; thunkExtraAgrs?: any }
): Store<TState> {
  const middlewares: Middleware[] = [
    thunkMiddleware.withExtraArgument(thunkExtraAgrs),
  ]
  const middlewareEnhancer = applyMiddleware(...middlewares)
  const enhancers: StoreEnhancer[] = [middlewareEnhancer]
  const store = createStore(
    rootReducer,
    initialState,
    composeWithDevTools(...enhancers)
  )
  return store
}

export default configureStore
