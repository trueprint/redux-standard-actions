import identity from 'lodash.identity';
import isNil from 'lodash.isnil';

function isFunction(val) {
  return typeof val === 'function';
}

export default function handleAction(type, reducers, defaultState) {
  const typeValue = isFunction(type)
    ? type.toString()
    : type;

  let [nextReducer, throwReducer] = isFunction(reducers)
    ? [reducers, reducers]
    : [reducers.next, reducers.throw];

  if (isNil(nextReducer)) {
    nextReducer = identity;
  }
  if (isNil(throwReducer)) {
    throwReducer = identity;
  }

  if (!isFunction(nextReducer) || !isFunction(throwReducer)) {
    throw new TypeError('reducers should be a function or map of next/throw functions');
  }

  return (state = defaultState, action) => {
    if (action.type !== typeValue) {
      return state;
    }
    return action.error === true ? throwReducer(state, action) : nextReducer(state, action);
  };
}
