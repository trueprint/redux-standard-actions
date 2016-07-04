import makeActionReducer from './actionReducer'

/**
 * Takes a map of action types to reducers, and returns a reducer that operates
 * by using all these reducers. Note that the calling order of the reducers in
 * reducersMap is not guaranteed.
 *
 * @param {object} reducersMap a map of action types to FSA reducers
 * @param {object} defaultState the default state for the resulting reducer
 * @returns {function} a reduction of the reducers in reducersMap
 */
export default function makeActionReducers(reducersMap, defaultState) {
  const actionReducers = Object
    .keys(reducersMap)
    .map(type => makeActionReducer(type, reducersMap[type]))

  return (state = defaultState, action) =>
    actionReducers.reduce(
      (previousState, actionReducer) => actionReducer(previousState, action),
      state
    )
}
