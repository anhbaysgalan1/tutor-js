React = require 'react'
BS = require 'react-bootstrap'
_  = require 'underscore'

{RosterStore, RosterActions} = require '../../flux/roster'
ChangePeriodLink  = require './change-period'
DeleteStudentLink = require './delete-student'
ResetPasswordLink = require './reset-password'
AddStudentButton  = require './add-student'
module.exports = React.createClass
  displayName: 'PeriodRoster'
  propTypes:
    courseId: React.PropTypes.string.isRequired
    period: React.PropTypes.object.isRequired

  renderStudentRow: (student) ->
    <tr key={student.id}>
      <td>{student.first_name}</td>
      <td>{student.last_name}</td>
      <td>{student.id}</td>
      <td className="actions">
        <ResetPasswordLink courseId={@props.courseId} student={student} />
        <ChangePeriodLink courseId={@props.courseId} student={student} />
        <DeleteStudentLink student={student} />
      </td>
    </tr>

  render: ->
    <div className="period">
      <h3>Period: {@props.period.name}</h3>
      <BS.Row>
        <BS.Col sm=2>
          <AddStudentButton {...@props} />
        </BS.Col>
      </BS.Row>
      <BS.Table striped bordered condensed hover className="roster">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Tutor ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {for student in RosterStore.getStudentsForPeriod(@props.courseId, @props.period.id)
            @renderStudentRow(student)}
        </tbody>
      </BS.Table>
    </div>