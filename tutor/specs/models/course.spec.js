import Courses from '../../src/models/courses-map';
import { autorun } from 'mobx';
import { bootstrapCoursesList } from '../courses-test-data';
import UiSettings from 'shared/src/model/ui-settings';
jest.mock('shared/src/model/ui-settings');

describe('Course Model', () => {

  beforeEach(() => bootstrapCoursesList());

  it('can be bootstrapped and size observed', () => {
    Courses.clear();
    const lenSpy = jest.fn();
    autorun(() => lenSpy(Courses.size));
    expect(lenSpy).toHaveBeenCalledWith(0);
    bootstrapCoursesList();
    expect(lenSpy).toHaveBeenCalledWith(3);
    expect(Courses.size).toEqual(3);
  });

  it('#isStudent', () => {
    expect(Courses.get(1).isStudent).toBe(true);
    expect(Courses.get(2).isStudent).toBe(false);
    expect(Courses.get(3).isStudent).toBe(true);
  });

  it('#isTeacher', () => {
    expect(Courses.get(1).isTeacher).toBe(false);
    expect(Courses.get(2).isTeacher).toBe(true);
    expect(Courses.get(3).isTeacher).toBe(true);
  });

  it('calculates audience tags', () => {
    expect(Courses.get(1).tourAudienceTags).toEqual(['student']);
    const teacher = Courses.get(2);
    expect(teacher.tourAudienceTags).toEqual(['teacher']);
    teacher.is_preview = true;
    expect(teacher.tourAudienceTags).toEqual(['teacher-preview']);
    expect(Courses.get(3).tourAudienceTags).toEqual(['teacher', 'student']);
  });


  it('should return expected roles for courses', function() {
    expect(Courses.get(1).primaryRole.type).to.equal('student');
    expect(Courses.get(2).primaryRole.type).to.equal('teacher');
    expect(Courses.get(3).primaryRole.type).to.equal('teacher');
  });

  it('stores dashboard view count', () => {
    Courses.get(2).recordDashboardView();
    expect(UiSettings.set).toHaveBeenCalledWith('DV.2', 1);
  });
});
