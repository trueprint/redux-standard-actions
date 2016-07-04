import isPlainObject from 'lodash.isplainobject'
import isFunction from 'lodash.isfunction'

/**
 * Returns whether or not the argument is a can act as a Flux Standard Action reducer.
 *
 * This is either a reducer, or a plain object that specifies next or throw reducers.
 *
 * @param {*} reducer the reducer to test for FSA usability
 * @returns {boolean} whether or not the reducer is a valid FSA reducer
 */
export default function isFSAReducer(reducer) {
  if (isReducer(reducer)) {
    return true
  } else if (
    isPlainObject(reducer) &&
    (!reducer.next || isReducer(reducer.next)) &&
    (!reducer.throw || isReducer(reducer.throw))
  ) {
    return true
  }
  return false
}

/**
 * Returns whether or not the argument is a valid reducer, which is an n-ary
 * function with n greater than 0 (since it must at least operate on the state).
 *
 * @param {*} reducer the reducer to test for validity
 * @returns {boolean} whether or not the reducer is a valid
 */
function isReducer(reducer) {
  return isFunction(reducer) && !!reducer.length
}
