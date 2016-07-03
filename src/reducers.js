import makeReducer from './reducer'

export default function makeReducers(reducersMap, defaultState) {
  const actionReducers = Object
    .keys(reducersMap)
    .map(type => makeReducer(type, reducersMap[type]))

  return (state = defaultState, action) =>
    actionReducers.reduce(
      (previousState, actionReducer) => actionReducer(previousState, action),
      state
    )
}
