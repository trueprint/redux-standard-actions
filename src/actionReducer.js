import isFunction from 'lodash.isfunction'
import identity from 'lodash.identity'

import isFSAReducer from './isFSAReducer'

/**
 * Returns a reducer that handles Flux Standard Actions of a given type.
 *
 * @param {string} type the action type; usually an upper-case and snake-case string
 * @param {function} reducer a function of non-zero arity, or undefined (in this case the identity function is used).
 *                           this may also be an object with next and throw reducers, which each handle non-error
 *                           and error actions, respectively
 * @param {object} defaultState a plain object; the state to use when the reducer is called with undefined state
 * @returns {function} the resulting reducer
 */
export default function makeActionReducer(type, reducer = identity, defaultState) {
  if (!isFSAReducer(reducer)) {
    throw new TypeError('Use a function, undefined, or object with next/throw reducers for reducer argument')
  } else if (type === undefined) {
    throw new TypeError('Expected type to not be undefined')
  }

  // .toString() is safe, and handles passing in our action creators. See
  //
  //    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
  const [ nextReducer = identity, throwReducer = identity ] = isFunction(reducer)
    ? [ reducer, reducer ]
    : [ reducer.next, reducer.throw ]
  const actionType = type.toString()

  return (state = defaultState, action) => {
    if (action.type !== actionType) {
      return state
    } else if (action.error === true) {
      return throwReducer(state, action)
    }
    return nextReducer(state, action)
  }
}
