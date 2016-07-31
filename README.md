redux-standard-actions
======================

[![Build Status](https://travis-ci.org/yangmillstheory/redux-standard-actions.svg?branch=master)](https://travis-ci.org/yangmillstheory/redux-standard-actions)
[![npm version](https://img.shields.io/npm/v/redux-standard-actions.svg?style=shield)](https://www.npmjs.com/package/redux-standard-actions)

[Flux Standard Action](https://github.com/acdlite/flux-standard-action) utilities for Redux.

This project was a fork of [redux-actions](https://github.com/acdlite/redux-actions). It's now developed and published as a separate NPM module for active maintenance and to optimize on development iteration speed.

---

### Getting started

Install via NPM.

```js
npm install --save redux-standard-actions
```

---

### API


#### Flux Standard Action Creators

##### `makeActionCreator(type, payloadCreator = identity, ?metaCreator)`

Returns an Flux Standard Action creator.

`payloadCreator` can only be a function or `undefined` (in which case the identity is used). `metaCreator` is an optional function that builds the `meta` value of the action, receiving the same arguments as `payloadCreator`.

Note that `payload` will only be set on the action if `payloadCreator` does not return `undefined`, and `meta` will be set only if `metaCreator` is a function.


```js
let decrement = makeActionCreator('DECREMENT', amount => -amount));

expect(decrement(42)).to.deep.equal({ type: 'DECREMENT', payload: -42 });
```

If the action creator is called with an [Error ](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), `action.error` will be set to `true` and the payload creator will not be called; instead, the payload is set to the error.

Note that the meta creator will still be called in this case.


```js
const decrement = makeActionCreator('DECREMENT', amount => -amount);
const error = new TypeError('not a number');

expect(decrement(error)).to.deep.equal({ type: 'DECREMENT', payload: error, error: true });
```


##### `makeActionCreators(?actionsMap, ?...actionTypes)`

Returns an object mapping action types to Flux Standard Action creators.

The keys of this object are camel-cased from the keys in `actionsMap`; the values are the action creators.

`actionsMap` is an optional object with action types as keys, and payload creators as values. `actionTypes` is an optional list of positional arguments that are action type strings; these action types will use the identity payload creator.

**There's currently no support for specifying any `metaCreator` with this syntax (though it would be easy to add).**

```js
const { actionOne, actionTwo, actionThree } = makeActionCreators({
  ACTION_ONE(key, value) {
    return { [key]: value };
  },

  ACTION_TWO(first, second) {
    return [ first, second ];
  },

}, 'ACTION_THREE');

expect(actionOne('key', 1)).to.deep.equal({
  type: 'ACTION_ONE',
  payload: { key: 1 }
});

expect(actionTwo('first', 'second')).to.deep.equal({
  type: 'ACTION_TWO',
  payload: ['first', 'second'],
});

expect(actionThree(3)).to.deep.equal({
  type: 'ACTION_THREE',
  payload: 3,
});
```

##### `combineActions(...types)`

Combine any number of FSA types or FSA creators for use by an FSA reducer.

`types` is a variadic list of arguments which can be action type strings or action creators.

This method exists because while FSA type strings can be joined with a conventional delimiter, there is no obvious way for a library user to combine FSA creators.

The return value of this method is meant solely for use as action types in `makeActionReducer` and `makeActionReducers`.

```js
const increment = makeActionCreator('INCREMENT', amount => ({ amount }))
const decrement = makeActionCreator('DECREMENT', amount => ({ amount: -amount }))

const reducer = makeActionReducer(
  combineActions(increment, decrement),
  {
    next(state, { payload: { amount } }) {
      return { ...state, counter: state.counter + amount }
    },

    throw(state) {
      return { ...state, counter: 0 }
    },
  },
  { counter: 10 }
)

expect(reducer(undefined, increment(1)).to.deep.equal({ counter: 11 })
expect(reducer(undefined, decrement(1)).to.deep.equal({ counter: 9 })
expect(reducer(undefined, increment(new Error)).to.deep.equal({ counter: 0 })
expect(reducer(undefined, decrement(new Error)).to.deep.equal({ counter: 0 })
```

This also works in when declaring reducers with the `next`/`throw` object format in `makeActionReducer` and `makeActionReducers`.

#### Flux Standard Action Reducers

##### `makeActionReducer(type, reducerFn | reducerMap, ?defaultState)`

Returns a reducer that handles Flux Standard Actions of a certain type.

`type` is a string action type, or an action creator from `makeActionCreator`.

If a function `reducerFn` is given, it is used to handle **all** Flux Standard Actions with type `type`, i.e. those with `error: true` and those without an `error` key.

Otherwise, you can pass an object `reducerMap` with separate reducers for `next()` and `throw()`, which will **only** handle non-error and error FSA's, respectively.

All reducers here must be `undefined` or a function. `undefined` reducers will default to the identity.

```js
makeActionReducer('LOGIN', {
  next(state, { payload: { userProfile } }) {
    return { ...state, loggedInUser: userProfile }
  },
  throw(state, action) {
    // reset the state in case anything goes wrong
    return { ...state, loggedInUser: null }
  }
}, { loggedInUser: null });
```

The optional third parameter specifies a default state which is used when an `undefined` state is passed to the reducer.

##### `makeActionReducers(reducerMap, ?defaultState)`

Returns a reduced reducer from multiple action reducers.

`reducerMap` is an object where the keys are action types or action creators, and the values are the corresponding reducer functions, or an object in the next/throw form.

Any `undefined` reducer will be defaulted to the identity, as in `makeActionReducer`.

The optional second parameter specifies a default or initial state, which is used when `undefined` is passed to the reduced reducer.

```js
const increment = makeActionCreator('INCREMENT');
const decrement = makeActionCreator('DECREMENT');

const reducer = makeActionReducers({
  [increment]: (state, { payload: { amount } }) => ({ ...state, counter: state.counter + amount }),

  [decrement]: {
    next(state, { payload: { amount } }) {
      return { ...state, counter: state.counter - amount }
    },
    throw(state) {
      return { ...state, counter: 0 }
    },
  },
}, { counter: 0 });


// can handle actions dispatched from the action creators
expect(reducer(undefined, increment({ amount: 1 }))).to.deep.equal({ counter: 1 })
expect(reducer({ counter: 3 }, increment({ amount: 7 }))).to.deep.equal({ counter: 10 })
expect(reducer({ counter: 3 }, decrement({ amount: 1 }))).to.deep.equal({ counter: 2 })

// can handle actions not dispatched directly from
// the action creator, and error actions as well
expect(
  reducer(
    { counter: 3 },
    { type: 'DECREMENT', payload: { amount: 7 } }
  )
).to.deep.equal({ counter: -4 })
expect(
  reducer(
    { counter: 3 },
    { type: 'DECREMENT', payload: new Error, error: true }
  )
).to.deep.equal({ counter: 0 })
```

---
###  Usage with middleware

Integrate with [redux-thunk](https://github.com/gaearon/redux-thunk), or [redux-saga](https://github.com/yelouafi/redux-saga).
