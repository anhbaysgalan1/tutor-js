import CourseEnroll from '../../../src/models/course/enroll';
import CL from '../../../src/flux/course-listing';
jest.mock('../../../src/flux/course-listing', () => ({
  CourseListingStore: { once: jest.fn((signal, cb) => cb()) },
  CourseListingActions: { load: jest.fn() },
}));

describe('Course Enrollment', function() {
  let enroll;
  beforeEach(() => {
    enroll = new CourseEnroll();
  });

  it('#isPending', () => {
    expect(enroll.isPending).toBe(true);
    enroll.api.errors = { foo: 'bar' };
    expect(enroll.isPending).toBe(false);
    enroll.api.errors = null;
    expect(enroll.isPending).toBe(true);
    enroll.to = { course: { name: 'test' } };
    expect(enroll.isPending).toBe(false);
  });

  it('#courseName', () => {
    enroll.to = { course: { name: 'test course' } };
    expect(enroll.courseName).toEqual('test course');
    enroll.api.errors = { is_teacher: { data: { course_name: 'TEST COURSE' } } };
    expect(enroll.courseName).toEqual('TEST COURSE');
  });

  it('#isInvalid', () => {
    expect(enroll.isInvalid).toBe(false);
    enroll.api.errors = { invalid_enrollment_code: 'true' };
    expect(enroll.isInvalid).toBe(true);
  });

  it('#isRegistered', () => {
    expect(enroll.isRegistered).toBe(false);
    enroll.api.errors = { already_enrolled: 'true' };
    expect(enroll.isRegistered).toBe(true);
    enroll.api.errors = null;
    expect(enroll.isRegistered).toBe(false);
    enroll.status = 'processed';
    expect(enroll.isRegistered).toBe(true);
  });

  it('fetches on complete', () => {
    enroll.status = 'processed';
    expect(enroll.isRegistered).toBe(true);
    expect(CL.CourseListingStore.once).toHaveBeenCalled();
    expect(CL.CourseListingActions.load).toHaveBeenCalled();
    expect(enroll.isComplete).toBe(true);
  });

  test('#confirm', () => {
    enroll.student_identifier = '1234';
    expect(enroll.confirm()).toEqual({ data: { student_identifier: '1234' } });
  });

  it('blocks lms and links from the wrong way', () => {
    enroll.to = { course: { is_lms_enabled: true } };
    let comp = mount(enroll.bodyContents);
    expect(comp.text()).toContain('this enrollment link isn’t valid');

    enroll.to.is_lms_enabled = false;
    enroll.originalEnrollmentCode = 'e1e1a822-0985-4b54-b5ab-f0963d98c494';
    enroll.courseToJoin = { is_lms_enabled: false };
    expect(enroll.isFromLms).toBe(true);
    expect(enroll.courseIsLmsEnabled).toBe(false);
    comp = mount(enroll.bodyContents);
    expect(comp.text()).toContain('you need an enrollment link');
  });

});
