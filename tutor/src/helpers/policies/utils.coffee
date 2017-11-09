_ = require 'underscore'

policies = require './policies'
{TaskStore} = require '../../flux/task'
{default: Courses} = require '../../models/courses-map'
Router = require '../router'
DEFAULT = 'default'

utils =
  _dueState: (task) ->
    state = 'before'
    state = 'after' if task.is_feedback_available or (task.due_at? and TaskStore.isTaskPastDue(task.id))

    state

  _role: ->
    { courseId } = Router.currentParams()
    course = Courses.get(courseId)
    if course then course.primaryRole.type else 'unknown'

  _checkQuestionFormat: (task, step, panel) ->
    # assuming 1 question right now
    question = step.content.questions[0]

    {aliases} = panel
    aliases ?= []
    aliases.push(panel.name)

    # change for matches with panel name or aliases
    not _.isEmpty _.intersection question.formats, aliases

  _getCheckedPolicy: (task, step, possiblePolicies) ->
    checkFn = "_#{possiblePolicies.check}"
    state = utils[checkFn](task, step)

    possiblePolicies.states[state]

  _getPolicy: (task, step, policyFor) ->

    taskType = task.type
    unless policies[taskType]?
      warning = "#{taskType} policy is missing.
        Please check src/helpers/policies/policies file.
        Default #{policyFor} policy for #{step.type} being used."
      console.warn(warning)
      taskType = DEFAULT

    possiblePolicies = policies[taskType][step.type][policyFor]

    policy = possiblePolicies.default if possiblePolicies.default?

    if possiblePolicies.check
      checkedPolicy = utils._getCheckedPolicy(task, step, possiblePolicies)
      policy = checkedPolicy if checkedPolicy?

    if policy.check
      nestedCheckedPolicy = utils._getCheckedPolicy(task, step, policy)
      policy = nestedCheckedPolicy if nestedCheckedPolicy?

    policy

  _isPanelPassed: (step, checks) ->
    panelPassed = _.reduce checks, (memo, next) ->
      # needs to detect both if the property next exists and if the value is truthy
      memo and step[next]? and step[next]
    , true

    panelPassed

  _getPanels: (task, step) ->
    allPanels = utils._getPolicy(task, step, 'panels')

    # get a list of panels need for question
    panels = _.filter allPanels, (panel) ->
      return true unless panel.optional

      optionalFn = "_#{panel.optional}"
      utils[optionalFn] task, step, panel

    panels

  _arePanelsPassed: (task, step, panels) ->
    panelsWithPass = _.map panels, (panel) ->
      panel.passed = false
      panel.passed = utils._isPanelPassed(step, panel.passCheck) if panel.passCheck?
      panel

  _getPanel: (panelsWithStatus) ->
    panel = _.findWhere panelsWithStatus, {passed: false}

    panel ?= _.last panelsWithStatus

  _canReview: (panels) ->
    reviewPanel = _.findWhere panels, {canReview: true}
    reviewPanel?

  _canWrite: (panels) ->
    cannotWrite = _.findWhere panels, {canWrite: false}
    not (cannotWrite?)

module.exports = utils
