React = require 'react'
EventEmitter2 = require 'eventemitter2'
_ = require 'underscore'
classnames = require 'classnames'
{SpyMode, TaskHelper, ExerciseStatics} = require 'shared'

{channel} = tasks = require './collection'
api = require '../api'
{Reactive} = require '../reactive'
apiChannelName = 'task'

exercises = {ExerciseStep} = require '../exercise'
breadcrumbs = {Breadcrumbs} = require '../breadcrumbs'

{TaskReview} = require './review'
{TaskTitle} = require './title'
{NoExercises} = require './no-exercises'

TaskBase = React.createClass
  displayName: 'TaskBase'
  getInitialState: ->
    {item} = @props
    initialState = @getState()

    _.extend({currentStep: 0}, initialState)

  contextTypes:
    close: React.PropTypes.func
    navigator: React.PropTypes.instanceOf(EventEmitter2)

  getState: (props) ->
    props ?= @props
    {item} = props

    return {steps: [], task: item} unless item

    crumbs = TaskHelper.mapSteps(item)
    steps = @setupSteps({steps: crumbs})

    {crumbs, steps, task: item}

  setupSteps: (task) ->
    steps = _.keys(task?.steps)
    steps.push('continue')

    steps

  goToStep: (stepIndex) ->
    @setState(currentStep: stepIndex) if @isStepAllowed(stepIndex)

  nextStep: ->
    {currentStep} = @state
    @goToStep(currentStep + 1)

  goToFirstIncomplete: ->
    {taskId} = @props
    stepIndex = tasks.getFirstIncompleteIndex(taskId)
    @goToStep(stepIndex)

  isStepAllowed: (stepIndex) ->
    @isExerciseStep(stepIndex) or
      @isStaticStep(stepIndex) or
      (@isReviewStep(stepIndex) and @canReview()) or
      (@isContinueStep(stepIndex) and @shouldContinue())

  isExerciseStep: (stepIndex) ->
    {crumbs} = @state
    crumbs[stepIndex]?.id?

  canReview: ->
    {taskId} = @props
    not _.isEmpty tasks.getCompleteSteps(taskId)

  shouldContinue: ->
    {taskId} = @props
    _.isEmpty tasks.getIncompleteSteps(taskId)

  isStaticStep: (stepIndex) ->
    {crumbs} = @state
    not crumbs[stepIndex].id?

  isReviewStep: (stepIndex) ->
    {crumbs} = @state
    crumbs[stepIndex].type is 'end'

  isContinueStep: (stepIndex) ->
    {steps} = @state
    steps[stepIndex] is 'continue'

  fetchTask: ->
    tasks.fetchByModule(@props)

  componentWillMount: ->
    api.channel.on('exercise.*.receive.complete', @fetchTask)
    exercises.channel.on('leave.*', @nextStep)

  componentWillUnmount: ->
    api.channel.off('exercise.*.receive.complete', @fetchTask)
    exercises.channel.off('leave.*', @nextStep)

  componentWillReceiveProps: (nextProps) ->
    nextState = @getState(nextProps)

    if (_.isEmpty(@props.item) and not _.isEmpty(nextProps.item)) or
      (@props.taskId isnt nextProps.taskId)
        stepIndex = tasks.getFirstIncompleteIndex(nextProps.taskId)
        nextState.currentStep = stepIndex

    @setState(nextState)

  componentDidUpdate: ->
    {currentStep, steps} = @state
    {close, navigator} = @context

    step = steps[currentStep]
    navigator.emit('show.task', {view: 'task', step: step})

    close() if @isContinueStep(currentStep)

  render: ->
    {task, currentStep, crumbs} = @state
    {taskId} = @props
    return null unless task?

    breadcrumbs = <Breadcrumbs
      {...@props}
      canReview={@canReview()}
      shouldContinue={@shouldContinue()}
      goToStep={@goToStep}
      currentStep={currentStep}/>

    noExercises = not task.steps? or _.isEmpty(task.steps)

    if noExercises
      panel = <NoExercises/>
    else if @isExerciseStep(currentStep)
      panel = <ExerciseStep
        className='concept-coach-task-body'
        id={crumbs[currentStep].id}
        pinned={false}/>
    else if @isReviewStep(currentStep)
      panel = <TaskReview {...@props} goToStep={@goToFirstIncomplete}/>
    else if @isContinueStep(currentStep)
      panel = null
    else if @isStaticStep(currentStep)
      {type} = crumbs[currentStep]
      Static = ExerciseStatics[type]

      panel = <Static project='concept-coach' onContinue={@nextStep}/>

    taskClasses = classnames 'concept-coach-task',
      'card-body': noExercises

    <div className={taskClasses}>
      <TaskTitle {...@props}/>
      {breadcrumbs}
      {panel}
      <SpyMode.Content>{JSON.stringify(task.spy)}</SpyMode.Content>
    </div>


Task = React.createClass
  displayName: 'Task'
  filter: (props, eventData) ->
    toCompare = ['collectionUUID', 'moduleUUID']

    setProps = _.pick(props, toCompare)
    receivedData = _.pick(eventData.data, toCompare)

    _.isEqual(setProps, receivedData)

  render: ->
    {collectionUUID, moduleUUID} = @props
    taskId = "#{collectionUUID}/#{moduleUUID}"

    <Reactive
      topic={taskId}
      store={tasks}
      apiChannelName={apiChannelName}
      collectionUUID={collectionUUID}
      moduleUUID={moduleUUID}
      fetcher={tasks.fetchByModule}
      filter={@filter}>
      <TaskBase {...@props} taskId={taskId}/>
    </Reactive>



module.exports = {Task, channel}
