React = require 'react'
_ = require 'underscore'
BS = require 'react-bootstrap'


Search = React.createClass
  propTypes:
    location: React.PropTypes.object.isRequired

#   displayExercise: (id) ->
#     @props.location.onRecordLoad(id, store)
# 96@6
#     @props.location.visitExercise(id)

  loadExercise: (exerciseId) ->
    @setState({exerciseId})
    ExerciseStore.once 'loaded', =>
      @props.location.onRecordLoad('exercises', exerciseId, ExerciseStore)

    ExerciseActions.load(exerciseId)

  onFindExercise: ->
    @loadExercise(this.refs.exerciseId.getDOMNode().value)

  onExerciseKeyPress: (ev) ->
    return unless ev.key is 'Enter'
    @loadExercise(this.refs.exerciseId.getDOMNode().value)
    ev.preventDefault()

  render: ->
    <div className="search">
      <h1>Edit exercise:</h1>
      <BS.Row>
        <BS.Col sm=3>
          <div className="input-group">
            <input type="text" autoFocus
              className="form-control"
              onKeyPress={@onExerciseKeyPress}
              ref="exerciseId" placeholder="Exercise ID"/>
            <span className="input-group-btn">
              <button className="btn btn-default load"
                type="button" onClick={@onFindExercise}
              >Load</button>
            </span>
          </div>
        </BS.Col>
      </BS.Row>
    </div>


module.exports = Search
