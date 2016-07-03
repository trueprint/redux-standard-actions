import { makeActionReducer } from './reducer'

function makeActionReducers(reducersMap, defaultState) {
  const actionReducers = Object
    .keys(reducersMap)
    .map(type => makeActionReducer(type, reducersMap[type]))

  return (state = defaultState, action) => {
    actionReducers.reduce(
      (previousState, actionReducer) => actionReducer(previousState, action),
      state
    )
  }
}

export default { makeActionReducers }
