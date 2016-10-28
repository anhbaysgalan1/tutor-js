React = require 'react'
BS = require 'react-bootstrap'

classnames = require 'classnames'
keys = require 'lodash/keys'

BindStore = require '../bind-store-mixin'
{NewCourseActions, NewCourseStore} = require '../../flux/new-course'

STAGES = {
  'course_type': require './select-type'
  'course_code': require './select-course'
  'period':      require './select-dates'
  'details':     require './course-details'
  'copy_ql':     require './copy-ql'
  'build':       require './build-course'
}

STAGE_KEYS = keys(STAGES)

componentFor = (index) ->
  STAGES[ STAGE_KEYS[ index ] ]

NewCourse = React.createClass

  getInitialState: ->
    currentStage: 0

  contextTypes:
    router: React.PropTypes.object

  mixins: [BindStore]
  bindStore: NewCourseStore

  onContinue: -> @go(1)
  onBack: -> @go(-1)
  go: (amt) ->
    stage = @state.currentStage
    while componentFor(stage + amt)?.shouldSkip?()
      stage += amt
    @setState({currentStage: stage + amt})

  Footer: ->
    <div className="controls">
      <BS.Button
        onClick={@onCancel} className="cancel"
      >
        Cancel
      </BS.Button>

      <BS.Button onClick={@onBack}
        bsStyle='success' className="back"
        disabled={@state.currentStage is 0}
      >
        Back
      </BS.Button>

      <BS.Button onClick={@onContinue}
        bsStyle='success' className="next"
        disabled={
          not NewCourseStore.isValid( STAGE_KEYS[@state.currentStage] )
        }
      >
        Continue
      </BS.Button>

    </div>

  onCancel: ->
    @context.router.transitionTo('/dashboard')

  render: ->
    Component = componentFor(@state.currentStage)
    <div className="new-course">
      <BS.Panel
        header={Component.title}
        className={@state.currentStage}
        footer={<@Footer /> unless Component.shouldHideControls}
      >
          <Component
            onContinue={@onContinue}
            onCancel={@onCancel}
            {...@state}
          />
      </BS.Panel>
    </div>



module.exports = NewCourse