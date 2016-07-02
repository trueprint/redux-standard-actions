import { isFSA } from 'flux-standard-action'

import { actionCreator } from '../'

describe('actionCreator()', () => {
  describe('resulting action creator', () => {
    const type = 'TYPE'

    it('returns a valid FSA', () => {
      const myActionCreator = actionCreator(type, b => b)
      const foobar = { foo: 'bar' }
      const action = myActionCreator(foobar)
      expect(isFSA(action)).to.be.true
    })

    it('uses return value as payload', () => {
      const myActionCreator = actionCreator(type, b => b)
      const foobar = { foo: 'bar' }
      const action = myActionCreator(foobar)
      expect(action).to.deep.equal({
        type,
        payload: foobar,
      })
    })

    it('uses identity function if actionCreator is not a function', () => {
      const myActionCreator = actionCreator(type)
      const foobar = { foo: 'bar' }
      const action = myActionCreator(foobar)
      expect(action).to.deep.equal({
        type,
        payload: foobar,
      })
      expect(isFSA(action)).to.be.true
    })

    it('accepts a second parameter for adding meta to object', () => {
      const myActionCreator = actionCreator(type, null, ({ cid }) => ({ cid }))
      const foobar = { foo: 'bar', cid: 5 }
      const action = myActionCreator(foobar)
      expect(action).to.deep.equal({
        type,
        payload: foobar,
        meta: {
          cid: 5,
        },
      })
      expect(isFSA(action)).to.be.true
    })

    it('sets error to true if payload is an Error object', () => {
      const myActionCreator = actionCreator(type)
      const errObj = new TypeError('this is an error')

      const errAction = myActionCreator(errObj)
      expect(errAction).to.deep.equal({
        type,
        payload: errObj,
        error: true,
      })
      expect(isFSA(errAction)).to.be.true

      const foobar = { foo: 'bar', cid: 5 }
      const noErrAction = myActionCreator(foobar)
      expect(noErrAction).to.deep.equal({
        type,
        payload: foobar,
      })
      expect(isFSA(noErrAction)).to.be.true
    })

    it('sets error to true if payload is an Error object and meta is provided', () => {
      const myActionCreator = actionCreator(type, null, (_, meta) => meta)
      const errObj = new TypeError('this is an error')

      const errAction = myActionCreator(errObj, { foo: 'bar' })
      expect(errAction).to.deep.equal({
        type,
        payload: errObj,
        error: true,
        meta: { foo: 'bar' },
      })
    })

    it('sets payload only when defined', () => {
      const action = actionCreator(type)()
      expect(action).to.deep.equal({
        type,
      })

      const explictUndefinedAction = actionCreator(type)(undefined)
      expect(explictUndefinedAction).to.deep.equal({
        type,
      })

      const explictNullAction = actionCreator(type)(null)
      expect(explictNullAction).to.deep.equal({
        type,
      })

      const baz = '1'
      const myActionCreator = actionCreator(type, null, () => ({ bar: baz }))
      expect(myActionCreator()).to.deep.equal({
        type,
        meta: {
          bar: '1',
        },
      })

      for (const validValue of [ false, 0, '' ]) {
        const expectPayload = actionCreator(type)(validValue)
        expect(expectPayload).to.deep.equal({
          type,
          payload: validValue,
        })
      }
    })

    it('bypasses action creators if payload is an Error object', () => {
      const myActionCreator = actionCreator(type, () => 'not this', (_, meta) => meta)
      const errObj = new TypeError('this is an error')

      const errAction = myActionCreator(errObj, { foo: 'bar' })
      expect(errAction).to.deep.equal({
        type,
        payload: errObj,
        error: true,
        meta: { foo: 'bar' },
      })
    })
  })
})
