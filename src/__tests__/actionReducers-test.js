import { makeActionReducers, makeActionCreator, combineActions } from '../'

describe('makeActionReducers', () => {
  it('should accept a map of multiple reducers in unified reducer form', () => {
    const reducer = makeActionReducers({
      INCREMENT: (state, { payload: amount }) => ({ ...state, counter: state.counter + amount }),

      DECREMENT: (state, { payload: amount }) => ({ ...state, counter: state.counter - amount }),
    })

    expect(reducer({ counter: 3 }, { type: 'INCREMENT', payload: 7 })).to.deep.equal({ counter: 10 })
    expect(reducer({ counter: 10 }, { type: 'DECREMENT', payload: 7 })).to.deep.equal({ counter: 3 })
  })

  it('should accept a map of multiple reducers in next/throw form', () => {
    const reducer = makeActionReducers({
      INCREMENT: {
        next(state, { payload: amount }) {
          return { ...state, counter: state.counter + amount }
        },
        throw(state) {
          return { ...state, counter: 0 }
        },
      },

      DECREMENT: {
        next(state, { payload: amount }) {
          return { ...state, counter: state.counter - amount }
        },
        throw(state) {
          return { ...state, counter: 0 }
        },
      },
    })

    expect(reducer({ counter: 3 }, { type: 'INCREMENT', payload: 7 })).to.deep.equal({ counter: 10 })
    expect(reducer({ counter: 3 }, { type: 'INCREMENT', payload: 7, error: true })).to.deep.equal({ counter: 0 })
    expect(reducer({ counter: 3 }, { type: 'DECREMENT', payload: 7 })).to.deep.equal({ counter: -4 })
    expect(reducer({ counter: 3 }, { type: 'DECREMENT', payload: 7, error: true })).to.deep.equal({ counter: 0 })
  })

  it('should accept a default state as the second parameter', () => {
    const reducer = makeActionReducers({
      INCREMENT: ({ counter }, { payload: amount }) => ({
        counter: counter + amount,
      }),

      DECREMENT: ({ counter }, { payload: amount }) => ({
        counter: counter - amount,
      }),
    }, { counter: 3 })

    expect(reducer(undefined, { type: 'INCREMENT', payload: 7 })).to.deep.equal({ counter: 10 })
  })

  it('should accept action creators as action type', () => {
    const increment = makeActionCreator('INCREMENT')
    const decrement = makeActionCreator('DECREMENT')
    const reducer = makeActionReducers({
      [increment]: (state, { payload: amount }) => ({ ...state, counter: state.counter + amount }),
      [decrement]: (state, { payload: amount }) => ({ ...state, counter: state.counter - amount }),
    })

    expect(reducer({ counter: 3 }, increment(7))).to.deep.equal({ counter: 10 })
    expect(reducer({ counter: 3 }, decrement(7))).to.deep.equal({ counter: -4 })
  })

  it('should handle actions not dispatched from action creators when defined with action creators', () => {
    const increment = makeActionCreator('INCREMENT')
    const decrement = makeActionCreator('DECREMENT')

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
    })

    expect(reducer({ counter: 3 }, { type: 'INCREMENT', payload: { amount: 7 } })).to.deep.equal({ counter: 10 })
    expect(
      reducer(
        { counter: 3 },
        { type: 'DECREMENT', payload: { amount: 7 } },
      )
    ).to.deep.equal({ counter: -4 })
    expect(
      reducer(
        { counter: 3 },
        { type: 'DECREMENT', payload: { amount: 7 }, error: true },
      )
    ).to.deep.equal({ counter: 0 })
  })

  it('should accept combined actions as action types in unified reducer form', () => {
    const increment = makeActionCreator('INCREMENT', amount => ({ amount }))
    const decrement = makeActionCreator('DECREMENT', amount => ({ amount: -amount }))

    const reducer = makeActionReducers({
      [combineActions(increment, decrement)](state, { payload: { amount } }) {
        return { ...state, counter: state.counter + amount }
      },
    }, { counter: -10 })

    expect(reducer({ counter: 10 }, increment(5))).to.deep.equal({ counter: 15 })
    expect(reducer({ counter: 10 }, decrement(5))).to.deep.equal({ counter: 5 })
    expect(reducer({ counter: 10 }, { type: 'NOT_TYPE', payload: 1000 })).to.deep.equal({ counter: 10 })
    expect(reducer(undefined, increment(5))).to.deep.equal({ counter: -5 })
  })

  it('should accept combined actions as action types in the next/throw form', () => {
    const increment = makeActionCreator('INCREMENT', amount => ({ amount }))
    const decrement = makeActionCreator('DECREMENT', amount => ({ amount: -amount }))

    const reducer = makeActionReducers({
      [combineActions(increment, decrement)]: {
        next(state, { payload: { amount } }) {
          return { ...state, counter: state.counter + amount }
        },

        throw(state) {
          return { ...state, counter: 0 }
        },
      },
    }, { counter: -10 })
    const error = new Error

    // non-errors
    expect(reducer({ counter: 10 }, increment(5))).to.deep.equal({ counter: 15 })
    expect(reducer({ counter: 10 }, decrement(5))).to.deep.equal({ counter: 5 })
    expect(reducer({ counter: 10 }, { type: 'NOT_TYPE', payload: 1000 })).to.deep.equal({ counter: 10 })
    expect(reducer(undefined, increment(5))).to.deep.equal({ counter: -5 })

    // errors
    expect(
      reducer({ counter: 10 }, { type: 'INCREMENT', payload: error, error: true })
    ).to.deep.equal({ counter: 0 })
    expect(
      reducer({ counter: 10 }, decrement(error))
    ).to.deep.equal({ counter: 0 })
  })
})
