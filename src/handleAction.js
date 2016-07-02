import isFunction from 'lodash.isfunction'
import identity from 'lodash.identity'

import { isUsableFSAReducer } from './apiUtils'

export default function handleAction(type, reducers = identity, defaultState) {
  const typeValue = isFunction(type)
    ? type.toString()
    : type

  if (!isUsableFSAReducer(reducers)) {
    throw new TypeError('wrong shape for reducers argument')
  }

  const [ nextReducer = identity, throwReducer = identity ] = isFunction(reducers)
    ? [ reducers, reducers ]
    : [ reducers.next, reducers.throw ]

  return (state = defaultState, action) => {
    if (action.type !== typeValue) {
      return state
    }
    return action.error === true ? throwReducer(state, action) : nextReducer(state, action)
  }
}
