React = require 'react'


UserStatus = require '../user/status-mixin'
Course = require './model'
ENTER = 'Enter'

{CourseListing} = require './listing'

CourseRegistration = React.createClass

  propTypes:
    collectionUUID: React.PropTypes.string.isRequired
    onComplete: React.PropTypes.func.isRequired

  mixins: [UserStatus]

  update: ->
    @forceUpdate() if @isMounted()

  startRegistration: ->
    course = @getCourse()
    course.set(ecosystem_book_uuid: @props.collectionUUID)
    course.register(React.findDOMNode(@refs.inviteInput).value)

  startConfirmation: ->
    @getCourse().confirm(React.findDOMNode(@refs.stduentIdInput).value)

  cancelConfirmation: ->
    @getCourse().cancelJoin()
    @clearCourse()

  clearCourse: ->
    @course.channel.off('change', @onCourseChange) if @course
    delete @course

  onCourseChange: ->
    if @course.isRegistered()
      # wait 1.5 secs so our success message is briefly displayed, then call onComplete
      _.delay(@props.onComplete, 1500)
    @forceUpdate()

  componentWillUnmount: ->
    @clearCourse()

  getCourse: ->
    return @course if @course
    @course = @getUser().findOrCreateCourse(@props.collectionUUID)
    @course.channel.on('change', @onCourseChange)
    @course

  onKeyPress: (ev) ->
    @startRegistration() if ev.key is ENTER

  renderCurrentCourses: ->
    <div className='text-center'>
      <h3>You are not registered for this course.</h3>
      <p>Did you mean to go to one of these?</p>
      <CourseListing
        courses={@getUser().courses}
        cnxUrl={@props.cnxUrl}/>
    </div>

  renderErrors: ->
    return null unless @course and @course.hasErrors()
    errors = for msg, i in @course.errorMessages()
      <li key={i}>{msg}</li>
    <div className="alert alert-danger">
      <ul className="errors">{errors}</ul>
    </div>

  renderInvite: ->
    <div className="form-group">
      {@renderCurrentCourses() if @getUser().courses?.length}
      <h3 className="text-center">Register for this Concept Coach course</h3>
      <hr/>
      <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 col-xs-12">
        {@renderErrors()}
        <label>
          Course invitation code:
          <div className="input-group">
            <input
              ref='inviteInput' autofocus
              onKeyPress={@onKeyPress} type="text" className="form-control"
            />
            <span className="input-group-btn">
              <button className="btn btn-default" type="button"
                onClick={@startRegistration}>Register</button>
            </span>
          </div>
        </label>
      </div>
    </div>

  renderSaving: ->
    <span><i className='fa fa-spinner fa-spin'/>Saving ...</span>

  renderPending: (course) ->
    <div className="form-group">
      <h3 className="text-center">
        Would you like to join {course.description()}?
      </h3>
      {@renderErrors()}
      <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 col-xs-12">
        <label className="col-sm-12">
          My Student ID is:
          <input ref='stduentIdInput' autofocus
            onKeyPress={@onKeyPress} type="text" className="form-control" />
        </label>

        <div className="text-center">
          <button className="btn"
            onClick={@cancelConfirmation}>Cancel</button>
          <button className="btn btn-success"
            style={marginLeft: '3rem'}
            onClick={@startConfirmation}>Confirm</button>
        </div>
      </div>
    </div>

  renderComplete: (course) ->
    <h3 className="text-center">
      You have successfully joined {course.description()}
    </h3>

  render: ->
    course = @getUser().getCourse(@props.collectionUUID)
    body =
      if course and not course.hasErrors()
        if course.isIncomplete()
          @renderSaving(course)
        else if course.isPending()
          @renderPending(course)
        else
          @renderComplete(course)
      else
        @renderInvite()

    <div className="row">
      {body}
    </div>

module.exports = CourseRegistration
