import React from 'react';
import { action, computed } from 'mobx';
import { observer } from 'mobx-react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Router from '../../helpers/router';

import Icon from '../icon';
import Name from '../name';
import { AsyncButton } from 'shared';

const WARN_REMOVE_CURRENT = 'If you remove yourself from the course you will be redirected to the dashboard.';

import Course from '../../models/course';
import Teacher from '../../models/course/teacher';

@observer
export default class RemoveTeacherLink extends React.PureComponent {

  static propTypes = {
    course: React.PropTypes.instanceOf(Course).isRequired,
    teacher: React.PropTypes.instanceOf(Teacher).isRequired,
  }

  static contextTypes = {
    router: React.PropTypes.object,
  }

  @action.bound goToDashboard() {
    this.context.router.history.push(Router.makePathname('myCourses'));
  }

  @action.bound performDeletion() {
    const request = this.props.teacher.drop();
    if (this.props.teacher.isTeacherOfCourse) {
      request.then(this.goToDashboard);
    }
  }

  confirmPopOver() {
    const { teacher } = this.props;

    return (
      <Popover
        id={`settings-remove-popover-${teacher.id}`}
        className="settings-remove-teacher"
        title={<span>Remove <Name {...teacher} />?</span>}
      >
        <AsyncButton
          bsStyle="danger"
          onClick={this.performDeletion}
          isWaiting={teacher.api.isPending}
          waitingText="Removing..."
        >
          <Icon type="ban" /> Remove
        </AsyncButton>

        <div className="warning">
          {teacher.isTeacherOfCourse ? WARN_REMOVE_CURRENT : undefined}
        </div>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        rootClose={true}
        trigger="click"
        placement="left"
        overlay={this.confirmPopOver()}>
        <a>
          <Icon type="ban" />
          {' Remove'}
        </a>
      </OverlayTrigger>
    );
  }

}
