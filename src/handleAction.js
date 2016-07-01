import identity from 'lodash.identity'

function isFunction(val) {
  return typeof val === 'function'
}

function isValidReducersArg(reducers) {
  if (isFunction(reducers) || reducers === undefined) {
    return true
  } else if (typeof reducers === 'object' && isFunction(reducers.throw) && isFunction(reducers.next)) {
    return true
  }
  return false
}

export default function handleAction(type, reducers = identity, defaultState) {
  const typeValue = isFunction(type)
    ? type.toString()
    : type

  if (!isValidReducersArg(reducers)) {
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
