React = require 'react'
classnames = require 'classnames'

Name = require '../name'

{default: Courses} = require '../../models/courses-map'
# {ScoresStore, ScoresActions} = require '../../flux/scores'

ViewingAsStudentName = React.createClass
  displayName: 'ViewingAsStudentName'
  propTypes:
    courseId: React.PropTypes.string.isRequired
    taskId: React.PropTypes.string.isRequired
    className: React.PropTypes.string

  getInitialState: ->
    @getStudentState()

  getStudentState: (props) ->
    {courseId, taskId} = props or @props
    Courses.get(courseId).scores.getTask(taskId).student

  updateStudent: (props) ->
    props ?= @props
    @setState(@getStudentState(props))

  componentWillMount: ->
    {courseId, taskId} = @props
    {student} = @state

    unless student?
      ScoresStore.once('change', @updateStudent)
      ScoresActions.load(courseId)

  componentWillReceiveProps: (nextProps) ->
    @updateStudent(nextProps)

  render: ->
    {className} = @props
    studentName = null

    className = classnames className, 'task-student'
    {student} = @state

    studentName = <div className={className}>
      <Name {...student} />
    </div> if student?

    studentName

module.exports = {ViewingAsStudentName}
