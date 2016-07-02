import isPlainObject from 'lodash.isplainobject'
import isFunction from 'lodash.isfunction'

/**
 * Checks if the argument is a payload creator,
 * which is a function with non-zero arity.
 *
 * @param {*} payloadCreator the payloadCreator to check for validity
 * @returns {boolean} whether or not payloadCreator is usable
 */
export function isPayloadCreator(payloadCreator) {
  return isFunction(payloadCreator) && !!payloadCreator.length
}

/**
 * Returns whether or not the argument is a usable reducer. The
 * argument must be an n-ary function with n greater than 0, or undefined.
 *
 * Reducers that fail this check are considered bad input.
 *
 * @param {*} reducer the reducer to test for validity
 * @returns {boolean} whether or not the reducer is a valid
 */
function isUsableReducer(reducer) {
  return reducer === undefined || (isFunction(reducer) && !!reducer.length)
}

/**
 * Returns whether or not a function is a usable FSA reducer. This is a
 * plain object that specifies next or throw reducers (which are
 * usable reducers), or is itself a usable reducer.
 *
 * @param {*} fsaReducer the fsaReducer to test for validity
 * @returns {boolean} whether or not the fsaReducer is valid
 */
export function isUsableFSAReducer(fsaReducer) {
  if (isUsableReducer(fsaReducer)) {
    return true
  } else if (
    isPlainObject(fsaReducer) &&
    isUsableReducer(fsaReducer.next) &&
    isUsableReducer(fsaReducer.throw)
  ) {
    return true
  }
  return false
}
