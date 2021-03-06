React = require 'react'
ReactDOM = require 'react-dom'
_ = require 'underscore'

ArbitraryHtmlAndMath = require '../html'
{default: Question} = require '../question'
FreeResponse = require './free-response'
{default: QuestionModel} = require '../../model/exercise/question'

RESPONSE_CHAR_LIMIT = 10000

{propTypes, props} = require './props'
modeType = propTypes.ExerciseStepCard.panel
modeProps = _.extend {}, propTypes.ExFreeResponse, propTypes.ExMulitpleChoice, propTypes.ExReview, mode: modeType
modeProps.focusParent = React.PropTypes.object

ExMode = React.createClass
  displayName: 'ExMode'
  propTypes: modeProps
  getDefaultProps: ->
    disabled: false
    free_response: ''
    answer_id: ''
  getInitialState: ->
    {free_response, answer_id} = @props

    freeResponse: free_response
    answerId: answer_id

  componentDidMount: ->
    @setFocus()

  componentDidUpdate: (prevProps) ->
    @setFocus(prevProps)

  componentWillReceiveProps: (nextProps) ->
    {free_response, answer_id, cachedFreeResponse} = nextProps

    nextAnswers = {}
    freeResponse = free_response or cachedFreeResponse or ''

    nextAnswers.freeResponse = freeResponse if @state.freeResponse isnt freeResponse
    nextAnswers.answerId = answer_id if @state.answerId isnt answer_id

    @setState(nextAnswers) unless _.isEmpty(nextAnswers)

  setFocus: (prevProps = {}) ->
    {mode, focus, id} = prevProps
    return if @props.mode is mode

    if @props.mode is 'free-response'
      focusEl = ReactDOM.findDOMNode(@refs.freeResponse)
    else
      focusEl = ReactDOM.findDOMNode(@props.focusParent)

    if focusEl
      if @props.focus
        focusEl.focus?()
      else
        focusEl.blur?()

  onFreeResponseChange: ->
    freeResponse = ReactDOM.findDOMNode(@refs.freeResponse)?.value
    if freeResponse.length <= RESPONSE_CHAR_LIMIT
      @setState({freeResponse})
      @props.onFreeResponseChange?(freeResponse)

  onAnswerChanged: (answer) ->
    return if answer.id is @state.answerId or @props.mode isnt 'multiple-choice'
    @setState {answerId: answer.id}
    @props.onAnswerChanged?(answer)

  getFreeResponse: ->
    {mode, free_response, disabled} = @props
    {freeResponse} = @state


    if mode is 'free-response'
      <textarea
        aria-label="question response text box"
        disabled={disabled}
        ref='freeResponse'
        placeholder='Enter your response'
        value={freeResponse}
        onChange={@onFreeResponseChange}
      />
    else
      <FreeResponse free_response={free_response}/>

  render: ->
    {mode, content, onChangeAnswerAttempt, answerKeySet, choicesEnabled} = @props
    {answerId} = @state

    answerKeySet = null unless choicesEnabled

    questionProperties = [
      'processHtmlAndMath', 'choicesEnabled', 'correct_answer_id', 'task',
      'feedback_html', 'type', 'questionNumber', 'project', 'context', 'focus'
    ]

    questionProps = _.pick(@props, questionProperties)
    if mode is 'multiple-choice'
      changeProps =
        onChange: @onAnswerChanged
    else if mode is 'review'
      changeProps =
        onChangeAttempt: onChangeAnswerAttempt

    htmlAndMathProps = _.pick(@props, 'processHtmlAndMath')

    {stimulus_html} = content
    stimulus = <ArbitraryHtmlAndMath
      {...htmlAndMathProps}
      className='exercise-stimulus'
      block={true}
      html={stimulus_html} /> if stimulus_html?.length > 0

    questions = _.map content.questions, (question) =>
      question = _.omit(question, 'answers') if mode is 'free-response'
      question = new QuestionModel(question)
      <Question
        {...questionProps}
        {...changeProps}
        key="step-question-#{question.id}"
        question={question}
        answer_id={answerId}
        keySet={answerKeySet}
      >
        {@getFreeResponse()}
      </Question>

    <div className='openstax-exercise'>
      {stimulus}
      {questions}
    </div>


module.exports = {ExMode}
