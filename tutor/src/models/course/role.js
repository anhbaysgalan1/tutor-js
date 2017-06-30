import {
  BaseModel, identifiedBy, field, identifier,
} from '../base';
import { computed } from 'mobx';

@identifiedBy('course/role')
export default class CourseRole extends BaseModel {
  @identifier id;

  @field({ type: 'date' }) joined_at;
  @field type;

  @computed get isStudent() {
    return this.type == 'student';
  }

  @computed get isTeacher() {
    return this.type == 'teacher';
  }
}