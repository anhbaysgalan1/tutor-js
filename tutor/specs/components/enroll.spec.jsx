import { SnapShot } from './helpers/component-testing';
import Factory from '../factories';
import Enroll from '../../src/components/enroll';
import EnzymeContext from './helpers/enzyme-context';
import Router from '../../src/helpers/router';
import EnrollModel from '../../src/models/course/enroll';

jest.mock('../../src/helpers/router');

describe('Student Enrollment', () => {
  let params, context, enrollment;
  let coursesMap;
  let fetchMock;

  beforeEach(() => {
    coursesMap = Factory.coursesMap();
    fetchMock = Promise.resolve();
    coursesMap.fetch = jest.fn(() => fetchMock);
    const course = coursesMap.array[0];
    coursesMap.set(course.id, course);
    params = { courseId: course.id };

    context = EnzymeContext.build();
    enrollment = new EnrollModel({ courses: coursesMap, llment_code: '1234', router: context.context.router });
    enrollment.create = jest.fn();
    Router.currentParams.mockReturnValue(params);
    Router.makePathname = jest.fn((name) => name);
  });

  it('loads when mounted', async () => {
    enrollment.isLoadingCourses = true;
    const wrapper = mount(<Enroll enrollment={enrollment} />);
    expect(await axe(wrapper.html())).toHaveNoViolations();
    expect(enrollment.create).toHaveBeenCalled();
    expect(wrapper).toHaveRendered('OXFancyLoader');
    expect(SnapShot.create(<Enroll enrollment={enrollment} />).toJSON()).toMatchSnapshot();
  });


  it('blocks teacher enrollment', () => {
    enrollment.api.errors = { is_teacher: { data: { course_name: 'My Fairly Graded Course' } } };
    expect(SnapShot.create(<Enroll enrollment={enrollment} />).toJSON()).toMatchSnapshot();
    const enroll = mount(<Enroll enrollment={enrollment} />);

    Router.makePathname = jest.fn(() => '/courses');
    enroll.find('Button').simulate('click');
    expect(Router.makePathname).toHaveBeenCalledWith('myCourses');
    expect(enrollment.router.history.push).toHaveBeenCalledWith('/courses');
  });

  it('forwards to your course if already a member', (done) => {
    enrollment.api.errors = { already_enrolled: { data: { course_name: 'My Course' } } };
    const enroll = mount(<Enroll enrollment={enrollment} />, context);
    expect(enroll).toHaveRendered('OXFancyLoader');
    enrollment.isComplete = true;
    enroll.update();
    setTimeout(() => {
      expect(enroll).toHaveRendered('Redirect');
      enroll.unmount();
      done();
    }, 100);
  });

  it('displays an invalid message', () => {
    enrollment.api.errors = { invalid_enrollment_code: true };
    expect(SnapShot.create(<Enroll enrollment={enrollment} />).toJSON()).toMatchSnapshot();
  });

  it('displays generic error message', () => {
    enrollment.api.errors = [{ code: 'blah', message: 'this is a error that we cant handle' }];
    expect(SnapShot.create(<Enroll enrollment={enrollment} />).toJSON()).toMatchSnapshot();
  });

  describe('select periods', () => {
    beforeEach(() => {
      enrollment.enrollment_code = enrollment.originalEnrollmentCode = 'cc3c6ff9-83d8-4375-94be-8c7ae3024938';

      enrollment.onEnrollmentCreate({ data: { name: 'My Grand Course', periods: [
        { name: 'Period #1', enrollment_code: '1234' }, {
          name: 'Period #2', enrollment_code: '4321' },
      ] } });
    });

    it('matches snapshot', () => {
      expect(SnapShot.create(<Enroll enrollment={enrollment} />).toJSON()).toMatchSnapshot();
    });

    it('can display a list of periods when joining from enrollment launch uuid', () => {
      enrollment.onSubmitPeriod = jest.fn();
      const enroll = mount(<Enroll enrollment={enrollment} />);
      expect(enroll).toHaveRendered('SelectPeriod');
      enroll.find('.choice').last().simulate('click');
      enroll.find('.btn-primary').simulate('click');
      expect(enrollment.pendingEnrollmentCode).toEqual('4321');
      expect(enrollment.onSubmitPeriod).toHaveBeenCalled();
    });

    it('skips period selection when course has only one', () => {
      enrollment.create = jest.fn();
      enrollment.onEnrollmentCreate({ data: {
        name: 'My Grand Course', periods: [{
          name: 'single period', enrollment_code: '4321',
        }],
      } });
      const enroll = mount(<Enroll enrollment={enrollment} />);
      expect(enroll).toHaveRendered('StudentIDForm');
    });
  });

  it('submits with student id when form is clicked', () => {
    const enroll = mount(<Enroll enrollment={enrollment}  />, context);
    expect(enroll).toHaveRendered('StudentIDForm');
    expect(SnapShot.create(<Enroll enrollment={enrollment} />).toJSON()).toMatchSnapshot();
    enroll.find('input').simulate('change', { target: { value: '411' } });
    expect(enrollment.student_identifier).toEqual('411');
    enrollment.confirm = jest.fn();
    enroll.find('.btn-primary').simulate('click');
    expect(enrollment.confirm).toHaveBeenCalled();
  });

  it('redirects on success', () => {
    enrollment.to = { course: { id: '133' } };
    enrollment.isComplete = true;
    const enroll = mount(<Enroll enrollment={enrollment}  />, context);
    expect(enroll).toHaveRendered('Redirect');
  });

});
