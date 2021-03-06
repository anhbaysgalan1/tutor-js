import React from 'react';
import { range, map, zip, partial, keys, isNil, extend, placeholder } from 'lodash';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import keymaster from 'keymaster';
import keysHelper from '../../helpers/keys';
import QuestionModel from '../../model/exercise/question'
import ArbitraryHtmlAndMath from '../html';
import Answer from './answer';
import { Feedback } from './feedback';
import Instructions  from './instructions';

//console.log( "---\n", ArbitraryHtmlAndMath, "---\n", Answer, "---\n", Feedback, "---\n", Instructions)

const KEYS =
  { 'multiple-choice-numbers': range(1, 10) }; // 1 - 9

// a - i
KEYS['multiple-choice-alpha'] = map(KEYS['multiple-choice-numbers'], partial(keysHelper.getCharFromNumKey, placeholder, null));

KEYS['multiple-choice'] = zip(KEYS['multiple-choice-numbers'], KEYS['multiple-choice-alpha']);

const KEYSETS_PROPS = keys(KEYS);
KEYSETS_PROPS.push(null); // keySet could be null for disabling keyControling

let idCounter = 0;

const isAnswerChecked = function(answer, chosenAnswer) {
  return chosenAnswer.includes(answer.id);
};

@observer
export default class AnswersTable extends React.Component {

  static propTypes = {
    question: React.PropTypes.instanceOf(QuestionModel).isRequired,
    type: React.PropTypes.string.isRequired,
    answer_id: React.PropTypes.string,
    correct_answer_id: React.PropTypes.string,
    feedback_html: React.PropTypes.string,
    answered_count: React.PropTypes.number,
    show_all_feedback: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    hideAnswers: React.PropTypes.bool,
    hasCorrectAnswer: React.PropTypes.bool,
    onChangeAttempt: React.PropTypes.func,
    keySet: React.PropTypes.oneOf(KEYSETS_PROPS),
  };

  static defaultProps = {
    type: 'student',
    show_all_feedback: false,
    keySet: 'multiple-choice',
  };

  constructor(props, context) {
    super(props, context);
    const originalKeyScope = this.getOriginalKeyScope();

    this.state = {
      answer_id: null,
      originalKeyScope,
    };
  }

  componentWillReceiveProps(nextProps) {
    const originalKeyScope = this.getOriginalKeyScope(nextProps);
    if (originalKeyScope != null) { this.setState({ originalKeyScope }); }
    if (nextProps.answer_id !== this.state.answer_id) { this.setState({ answer_id: null }); }

    if (!isNil(this.props.keySet) && isNil(nextProps.keySet)) { return this.resetToOriginalKeyScope(); }
  }

  componentWillUnmount() {
    this.resetToOriginalKeyScope()
  }

  getOriginalKeyScope = (props) => {
    if (props == null) { ({ props } = this); }

    const originalKeyScope = keymaster.getScope();
    if ((props.keySet !== originalKeyScope) && (originalKeyScope !== (this.state != null ? this.state.originalKeyScope : undefined))) { return originalKeyScope; }
  };

  resetToOriginalKeyScope = () => {
    const { originalKeyScope } = this.state;
    if (originalKeyScope != null) { keymaster.setScope(originalKeyScope); }
    this.setState({ originalKeyScope: undefined })
  };

  @action.bound onChangeAnswer(answer, changeEvent) {
    if (this.props.onChange) {
      this.setState({ answer_id: answer.id });
      return (
        this.props.onChange(answer)
      );
    } else {
      if (changeEvent != null) {
        changeEvent.preventDefault();
      }
      return (
        (typeof this.props.onChangeAttempt === 'function' ? this.props.onChangeAttempt(answer) : undefined)
      );
    }
  };

  shouldInstructionsShow = () => {
    const { type, question, answer_id, correct_answer_id } = this.props;
    return (
      (question.formats.length > 1) &&
        !(
          (answer_id === correct_answer_id) ||
            ['teacher-preview', 'teacher-review'].includes(type)
        )
    );
  };

  hasIncorrectAnswer = () => {
    const { answer_id, correct_answer_id, choicesEnabled } = this.props;
    return (
      !!(answer_id && !choicesEnabled && (answer_id !== correct_answer_id))
    );
  };

  render() {
    let feedback, instructions;
    const {
      question, hideAnswers, type, answered_count, choicesEnabled, correct_answer_id,
      answer_id, feedback_html, show_all_feedback, keySet, project, hasCorrectAnswer, focus,
    } = this.props;
    if (hideAnswers) { return null; }

    const { answers, id } = question;

    const chosenAnswer = [answer_id, this.state.answer_id];
    let checkedAnswerIndex = null;

    const questionAnswerProps = {
      qid: id || `auto-${idCounter++}`,
      correctAnswerId: correct_answer_id,
      hasCorrectAnswer,
      chosenAnswer,
      onChangeAnswer: this.onChangeAnswer,
      type,
      answered_count,
      disabled: !choicesEnabled,
      show_all_feedback,
    };

    const answersHtml = map(answers, function(answer, i) {
      const additionalProps = { answer, iter: i, key: `${questionAnswerProps.qid}-option-${i}` };
      if (focus) { additionalProps.keyControl = KEYS[keySet] != null ? KEYS[keySet][i] : undefined; }
      const answerProps = extend({}, additionalProps, questionAnswerProps);
      if (isAnswerChecked(answer, chosenAnswer)) { checkedAnswerIndex = i; }

      return (
        <Answer {...answerProps} />
      );
    })

    if (feedback_html) {
      feedback = (
        <Feedback key="question-mc-feedback">
          {feedback_html}
        </Feedback>
      );
    }
    if ((feedback != null) && (checkedAnswerIndex != null)) { answersHtml.splice(checkedAnswerIndex + 1, 0, feedback); }

    if (this.shouldInstructionsShow()) {
      instructions = <Instructions
                       project={project}
                       hasFeedback={feedback_html != null}
                       hasIncorrectAnswer={this.hasIncorrectAnswer()} />;
    }

    return (
      <div className="answers-table">
        {instructions}
        {answersHtml}
      </div>
    );
  }
}
