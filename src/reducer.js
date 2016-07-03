import isFunction from 'lodash.isfunction'
import identity from 'lodash.identity'

import isFSAReducer from './isFSAReducer'

export default function makeActionReducer(actionType, reducer = identity, defaultState) {
  const type = isFunction(actionType)
    // allow actionType to be one of our action creators
    ? actionType.toString()
    : actionType

  if (!isFSAReducer(reducer)) {
    throw new TypeError('wrong shape for reducer argument')
  }

  const [ nextReducer = identity, throwReducer = identity ] = isFunction(reducer)
    ? [ reducer, reducer ]
    : [ reducer.next, reducer.throw ]

  return (state = defaultState, action) => {
    if (action.type !== type) {
      return state
    } else if (action.error === true) {
      return throwReducer(state, action)
    }
    return nextReducer(state, action)
  }
}
