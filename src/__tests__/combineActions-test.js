import isFunction from 'lodash.isfunction'

import { combineActions, makeActionCreators } from '../'

describe('combineActions', () => {
  it('should throw an error if any action is not a function or string', () => {
    expect(
      () => combineActions(1, 'ACTION_TWO')
    ).to.throw(TypeError, 'Expected each argument to be a string action type or an action creator')

    expect(
      () => combineActions('ACTION_ONE', () => {}, null)
    ).to.throw(TypeError, 'Expected each argument to be a string action type or an action creator')
  })

  it('should accept action creators and action type strings', () => {
    const { actionOne, actionTwo } = makeActionCreators('ACTION_ONE', 'ACTION_TWO')

    expect(
      () => combineActions('ACTION_ONE', 'ACTION_TWO')
    ).not.to.throw(Error)
    expect(
      () => combineActions(actionOne, actionTwo)
    ).not.to.throw(Error)
    expect(
      () => combineActions(actionOne, actionTwo, 'ACTION_THREE')
    ).not.to.throw(Error)
  })

  it('should return a stringifiable object', () => {
    const { actionOne, actionTwo } = makeActionCreators('ACTION_ONE', 'ACTION_TWO')

    expect(
      isFunction(
        combineActions('ACTION_ONE', 'ACTION_TWO').toString
      )
    ).to.be.ok
    expect(
      isFunction(
        combineActions(actionOne, actionTwo).toString
      )
    ).to.be.ok
    expect(
      isFunction(
        combineActions(actionOne, actionTwo, 'ACTION_THREE').toString
      )
    ).to.be.ok
  })
})
