import { makeActionReducers, makeActionCreator } from '../'

describe('makeActionReducers', () => {
  it('create a single handler from a map of multiple action handlers', () => {
    const reducer = makeActionReducers({
      INCREMENT: ({ counter }, { payload: amount }) => ({
        counter: counter + amount,
      }),

      DECREMENT: ({ counter }, { payload: amount }) => ({
        counter: counter - amount,
      }),
    })

    expect(reducer({ counter: 3 }, { type: 'INCREMENT', payload: 7 }))
      .to.deep.equal({
        counter: 10,
      })
    expect(reducer({ counter: 10 }, { type: 'DECREMENT', payload: 7 }))
      .to.deep.equal({
        counter: 3,
      })
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

    expect(reducer(undefined, { type: 'INCREMENT', payload: 7 }))
      .to.deep.equal({
        counter: 10,
      })
  })

  it('accepts action function as action type', () => {
    const incrementAction = makeActionCreator('INCREMENT')
    const reducer = makeActionReducers({
      [incrementAction]: ({ counter }, { payload: amount }) => ({
        counter: counter + amount,
      }),
    })

    expect(reducer({ counter: 3 }, incrementAction(7)))
      .to.deep.equal({
        counter: 10,
      })
  })
})
