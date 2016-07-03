import { makeActionReducers, makeActionCreator } from '../'

describe('makeActionReducers', () => {
  it('should accept a map of multiple reducers in unified form', () => {
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

  it('accepts a default state as the second parameter', () => {
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
})
