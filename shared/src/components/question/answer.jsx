import React from 'react';
import { partial, pick, debounce } from 'lodash';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import classnames from 'classnames';
import keymaster from 'keymaster';

import AnswerModel from '../../model/exercise/answer';
import keysHelper from '../../helpers/keys';
import ArbitraryHtmlAndMath from '../html';
import { SimpleFeedback } from './feedback';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

let idCounter = 0;

const isAnswerCorrect = function(answer, correctAnswerId) {
  let isCorrect = answer.id === correctAnswerId;
  if (answer.correctness != null) { isCorrect = (answer.correctness === '1.0'); }

  return (

    isCorrect

  );
};

const isAnswerChecked = function(answer, chosenAnswer) {
  return (
    (chosenAnswer || []).includes(answer.id)
  );
};


@observer
export default class Answer extends React.Component {

  static propTypes = {
    answer: React.PropTypes.instanceOf(AnswerModel).isRequired,
    iter: React.PropTypes.number.isRequired,
    qid: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]).isRequired,
    type: React.PropTypes.string.isRequired,
    hasCorrectAnswer: React.PropTypes.bool.isRequired,
    onChangeAnswer: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool,
    chosenAnswer: React.PropTypes.array,
    correctAnswerId: React.PropTypes.string,
    answered_count: React.PropTypes.number,
    show_all_feedback: React.PropTypes.bool,
    keyControl: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
      React.PropTypes.array,
    ]),
  };

  static defaultProps = {
    disabled: false,
    show_all_feedback: false,
  };

  static contextTypes = {
    processHtmlAndMath: React.PropTypes.func,
  };

  componentWillMount() {
    if (this.shouldKey()) { return this.setUpKeys(); }
  }

  componentWillUnmount() {
    const { keyControl } = this.props;
    if (keyControl != null) { return keysHelper.off(keyControl, 'multiple-choice'); }
  }

  componentDidUpdate(prevProps) {
    const { keyControl } = this.props;

    if (this.shouldKey(prevProps) && !this.shouldKey()) {
      keysHelper.off(prevProps.keyControl, 'multiple-choice');
    }

    if (this.shouldKey() && (prevProps.keyControl !== keyControl)) {
      return (
        this.setUpKeys()
      );
    }
  }

  shouldKey = (props) => {
    if (props == null) { ({ props } = this); }
    const { keyControl, disabled } = props;

    return (

      (keyControl != null) && !disabled

    );
  };

  setUpKeys = () => {
    const { answer, onChangeAnswer, keyControl } = this.props;

    const keyInAnswer = debounce(partial(onChangeAnswer, answer), 200, {
      leading: true,
      trailing: false,
    });
    keysHelper.on(keyControl, 'multiple-choice', keyInAnswer);
    return (
      keymaster.setScope('multiple-choice')
    );
  };

  onKeyPress = (ev) => {
    if ((ev.key === 'Enter') && (this.props.disabled !== true)) { this.onChange(); }
    return (
      null
    );
  }; // silence react event return value warning

  @action.bound onChange() {
    this.props.onChangeAnswer(this.props.answer)
  };

  render() {
    let feedback, onChange, radioBox, selectedCount;
    let { answer, iter, qid, type, correctAnswerId, answered_count, hasCorrectAnswer, chosenAnswer, disabled } = this.props;
    if (qid == null) { qid = `auto-${idCounter++}`; }

    const isChecked = isAnswerChecked(answer, chosenAnswer);
    const isCorrect = isAnswerCorrect(answer, correctAnswerId);

    const classes = classnames('answers-answer', {
      'disabled': disabled,
      'answer-checked': isChecked,
      'answer-correct': isCorrect,
    }
    );

    if (!hasCorrectAnswer && (type !== 'teacher-review') && (type !== 'teacher-preview')) {
      ({ onChange } = this);
    }

    if (onChange) {
      radioBox = <input
                   type="radio"
                   className="answer-input-box"
                   checked={isChecked}
                   id={`${qid}-option-${iter}`}
                   name={`${qid}-options`}
                   onChange={onChange}
                   disabled={disabled} />;
    }

    if (type === 'teacher-review') {
      const percent = Math.round((answer.selected_count / answered_count) * 100) || 0;
      selectedCount = <div
                        className="selected-count"
                        data-count={`${answer.selected_count}`}
                        data-percent={`${percent}`} />;
    }

    if (this.props.show_all_feedback && answer.feedback_html) {
      feedback = <SimpleFeedback key="question-mc-feedback">
        {answer.feedback_html}
      </SimpleFeedback>;
    }

    let ariaLabel = `${isChecked ? 'Selected ' : ''}Choice ${ALPHABET[iter]}`;
    // somewhat misleading - this means that there is a correct answer,
    // not necessarily that this answer is correct
    if (this.props.hasCorrectAnswer) {
      ariaLabel += `(${isCorrect ? 'Correct' : 'Incorrect'} Answer)`;
    }
    ariaLabel += ':';
    const htmlAndMathProps = pick(this.context, ['processHtmlAndMath']);

    return (
      <div className="openstax-answer">
        <section aria-labelledby={`${qid}-label-${iter}`} role="region" className={classes}>
          {selectedCount}
          {radioBox}
          <label
            id={`${qid}-label-${iter}`}
            onKeyPress={this.onKeyPress}
            htmlFor={`${qid}-option-${iter}`}
            className="answer-label">
            <button
              onClick={onChange}
              aria-label={ariaLabel}
              className="answer-letter"
              disabled={disabled}>
              {ALPHABET[iter]}
            </button>
            <div className="answer-answer">
              <ArbitraryHtmlAndMath
                {...htmlAndMathProps}
                className="answer-content"
                html={answer.content_html} />
              {feedback}
            </div>
          </label>
        </section>
      </div>
    );
  }
}
