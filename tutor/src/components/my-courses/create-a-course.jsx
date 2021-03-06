import React from 'react';

import { observer } from 'mobx-react';
import classnames from 'classnames';
import Router from '../../helpers/router';

import { wrapCourseDropComponent } from './course-dnd';
import TutorLink from '../link';
import IconAdd from '../icons/add';
import Courses from '../../models/courses-map';
import TourAnchor from '../tours/anchor';

@wrapCourseDropComponent @observer
export default class CreateACourse extends React.PureComponent {

  static propTypes = {
    isHovering: React.PropTypes.bool,
    connectDropTarget: React.PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: React.PropTypes.object,
  }

  onDrop(course) {
    const url = Router.makePathname('createNewCourse', { sourceId: course.id });
    this.context.router.history.push(url);
  }

  renderAddZone() {
    return (
      this.props.connectDropTarget(
        <div className="my-courses-add-zone">
          <TutorLink
            to="createNewCourse"
            className={classnames({ 'is-hovering': this.props.isHovering })}>
            <div>
              <IconAdd />
              <span>
                CREATE A COURSE
              </span>
            </div>
          </TutorLink>
        </div>
      )
    );
  }

  render() {
    return (
      <TourAnchor id="create-course-zone">
        {this.renderAddZone()}
      </TourAnchor>);
  }
}
