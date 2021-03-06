import React from 'react';
import invariant from 'invariant';
import { extend, last, first } from 'lodash';
import { Redirect, Link } from 'react-router-dom';
import { asyncComponent } from './async-component';
import WarningModal from '../components/warning-modal';
import Courses from '../models/courses-map';
import { OXMatchByRouter } from 'shared';

const StudentDashboard = asyncComponent(
  () => import('../screens/student-dashboard')
);

const getConditionalHandlers = (Router) => {
  const MatchForTutor = OXMatchByRouter(Router, null, 'TutorRouterMatch');

  const renderDashboard = (props) => {
    const {courseId} = props.params;

    extend(props, {courseId});
    const course = Courses.get(courseId);

    if (!course) {
      return (
        <WarningModal title="Sorry, you can’t access this course">
          You are no longer a student in this course. Please contact your instructor if you are still enrolled in this course and need to be re-added.
        </WarningModal>
      );
    }

    if (!props.match.isExact) {
      return (
        <MatchForTutor {...props} />
      );
    }

    if (course.isTeacher) {
      if (course.is_concept_coach) {
        return (
          <CCDashboard courseId={courseId} {...props} />
        );
      } else {
        return (
          <Redirect
            to={{
              pathname: Router.makePathname('viewTeacherDashboard', props.params),
              query: Router.currentQuery()
            }} />
        );
      }
    } else {
      if (course.is_concept_coach) {
        return (
          <CCStudentRedirect courseId={courseId} />
        );
      } else {
        return <StudentDashboard {...props} />;
      }
    }
  };

  const legacyReferenceBookRedirect = ({ params }) => {
    const parts = params.parts.split('/');
    const course = Courses.get(first(parts));
    invariant(course, `Did not find course for params '${params}'`);
    const chapterSection = parts.length > 1 ? last(parts) : 0;
    return (
      <Redirect
        to={{
          pathname: Router.makePathname(
            chapterSection ? 'viewReferenceBookSection' : 'viewReferenceBook',
            {
              ecosystemId: course.ecosystem_id,
              chapterSection,
            }),
          query: Router.currentQuery(),
        }}
      />
    );
  };

  return {
    dashboard() { return renderDashboard; },
    legacyReferenceBookRedirect() { return legacyReferenceBookRedirect; },
  };
};

export { getConditionalHandlers };
