React = require 'react'
BS = require 'react-bootstrap'
Router = require 'react-router-dom'
_ = require 'underscore'
{SpyMode} = require 'shared'

Courses = require('../../models/courses-map').default

ChapterSectionType = require './chapter-section-type'

pluralize = require 'pluralize'
pluralize.addIrregularRule(' has', ' have')



Statistics = React.createClass

  propTypes:
    courseId: React.PropTypes.string.isRequired
    roleId:   React.PropTypes.string
    section:  ChapterSectionType.isRequired
    displaying: React.PropTypes.string.isRequired

  getWorkedText: (role) ->
    count = @props.section.student_count
    total = @props.section.questions_answered_count
    switch role
      when 'teacher'
        "#{pluralize(' students', count, true)}
         #{pluralize(' has', count)} worked #{pluralize(' problems', total, true)}"
      when 'student'
        "#{pluralize(' problems', total, true)} worked in this #{@props.displaying}"
      when 'teacher-student'
        "#{pluralize(' problems', total, true)} worked"

  render: ->
    # if roleid then we're on teacher-student view
    if @props.roleId?
      role = 'teacher-student'
    else
    # else use the course role of teacher or student
      role = Courses.get(@props.courseId).primaryRole.type

    <div className='statistics'>
      <SpyMode.Content className="clue">
        <ul>
          { for key, value of @props.section.clue
            value = value.join(' ') if _.isArray(value)
            <li key={key}><strong>{key}</strong>: {String(value)}</li>}
        </ul>
      </SpyMode.Content>
      <div className='amount-worked'>
        <span className='count'>
          {@getWorkedText(role)}
        </span>
      </div>
    </div>


module.exports = Statistics
