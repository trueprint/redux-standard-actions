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

  it('should accept any combination of action creators and action type strings and return a string', () => {
    const { actionOne, actionTwo } = makeActionCreators('ACTION_ONE', 'ACTION_TWO')

    expect(combineActions('ACTION_ONE', 'ACTION_TWO')).to.be.a.string
    expect(combineActions(actionOne, actionTwo)).to.be.a.string
    expect(combineActions(actionOne, actionTwo, 'ACTION_THREE')).to.be.a.string
  })
})
