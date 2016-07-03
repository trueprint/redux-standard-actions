import { isFSA } from 'flux-standard-action'

import { makeActionCreator } from '../'

describe('makeActionCreator()', () => {
  describe('resulting action creator', () => {
    const type = 'TYPE'

    it('returns a valid FSA', () => {
      const actionCreator = makeActionCreator(type, b => b)
      const foobar = { foo: 'bar' }
      const action = actionCreator(foobar)
      expect(isFSA(action)).to.be.true
    })

    it('uses return value as payload', () => {
      const actionCreator = makeActionCreator(type, b => b)
      const foobar = { foo: 'bar' }
      const action = actionCreator(foobar)
      expect(action).to.deep.equal({
        type,
        payload: foobar,
      })
    })

    it('uses identity function if makeActionCreator is not a function', () => {
      const actionCreator = makeActionCreator(type)
      const foobar = { foo: 'bar' }
      const action = actionCreator(foobar)
      expect(action).to.deep.equal({
        type,
        payload: foobar,
      })
      expect(isFSA(action)).to.be.true
    })

    it('accepts a second parameter for adding meta to object', () => {
      const actionCreator = makeActionCreator(type, undefined, ({ cid }) => ({ cid }))
      const foobar = { foo: 'bar', cid: 5 }
      const action = actionCreator(foobar)
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
      const actionCreator = makeActionCreator(type)
      const errObj = new TypeError('this is an error')

      const errAction = actionCreator(errObj)
      expect(errAction).to.deep.equal({
        type,
        payload: errObj,
        error: true,
      })
      expect(isFSA(errAction)).to.be.true

      const foobar = { foo: 'bar', cid: 5 }
      const noErrAction = actionCreator(foobar)
      expect(noErrAction).to.deep.equal({
        type,
        payload: foobar,
      })
      expect(isFSA(noErrAction)).to.be.true
    })

    it('sets error to true if payload is an Error object and meta is provided', () => {
      const actionCreator = makeActionCreator(type, undefined, (_, meta) => meta)
      const errObj = new TypeError('this is an error')

      const errAction = actionCreator(errObj, { foo: 'bar' })
      expect(errAction).to.deep.equal({
        type,
        payload: errObj,
        error: true,
        meta: { foo: 'bar' },
      })
    })

    it('sets payload only when defined', () => {
      const action = makeActionCreator(type)()
      expect(action).to.deep.equal({
        type,
      })

      const explictUndefinedAction = makeActionCreator(type)(undefined)
      expect(explictUndefinedAction).to.deep.equal({
        type,
      })

      const explictNullAction = makeActionCreator(type)(null)
      expect(explictNullAction).to.deep.equal({
        type,
      })

      const baz = '1'
      const actionCreator = makeActionCreator(type, undefined, () => ({ bar: baz }))
      expect(actionCreator()).to.deep.equal({
        type,
        meta: {
          bar: '1',
        },
      })

      for (const validValue of [ false, 0, '' ]) {
        const expectPayload = makeActionCreator(type)(validValue)
        expect(expectPayload).to.deep.equal({
          type,
          payload: validValue,
        })
      }
    })

    it('bypasses action creators if payload is an Error object', () => {
      const actionCreator = makeActionCreator(type, () => 'not this', (_, meta) => meta)
      const errObj = new TypeError('this is an error')

      const errAction = actionCreator(errObj, { foo: 'bar' })
      expect(errAction).to.deep.equal({
        type,
        payload: errObj,
        error: true,
        meta: { foo: 'bar' },
      })
    })
  })
})
