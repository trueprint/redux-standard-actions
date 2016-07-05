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
  if (isFunction(reducer)) {
    return true
  } else if (
    isPlainObject(reducer) &&
    (!reducer.next || isFunction(reducer.next)) &&
    (!reducer.throw || isFunction(reducer.throw))
  ) {
    return true
  }
  return false
}
