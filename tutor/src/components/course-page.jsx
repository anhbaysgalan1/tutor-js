import React from 'react';
import cn from 'classnames';
import { isNil } from 'lodash';
import { computed } from 'mobx';
import Course from '../models/course';
import CourseUX from '../models/course/ux';

export default class CoursePage extends React.PureComponent {

  static propTypes = {
    course: React.PropTypes.instanceOf(Course).isRequired,
    children: React.PropTypes.element.isRequired,
    controls: React.PropTypes.node,
    title: React.PropTypes.node,
    className: React.PropTypes.string,
  }

  @computed get ux () {
    return new CourseUX(this.props.course);
  }

  renderTitle() {
    if (isNil(this.props.title)) { return null; }

    return (
      <div className="title-wrapper">
        <div className="title">{this.props.title}</div>
      </div>
    );
  }

  renderControls() {
    return isNil(this.props.controls) ? null: <div className="controls-wrapper">{this.props.controls}</div>;
  }

  render() {
    return (
      <div
        className={cn('course-page', this.props.className)}
        {...this.ux.dataProps}
      >
        <header>
          {this.renderTitle()}
          {this.renderControls()}
        </header>
        <div className="body">
          {this.props.children}
        </div>
      </div>
    );
  }
}