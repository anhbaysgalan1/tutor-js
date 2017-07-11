import {
  computed, action,
} from 'mobx'

import {
  BaseModel, identifiedBy, field, identifier, belongsTo,
} from '../base';
import { TimeStore } from '../../flux/time';
import moment from 'moment';

@identifiedBy('course/student')
export default class CourseStudent extends BaseModel {
  @identifier id;

  @field name;

  @field first_name;
  @field last_name;
  @field is_active;
  @field is_comped;
  @field is_paid;
  @field is_refund_allowed;
  @field is_refund_pending;
  @field({ type: 'date' }) payment_due_at;
  @field prompt_student_to_pay; // not needed and unused

  @field period_id;
  @field role_id;
  @field student_identifier;

  @belongsTo course;

  // called by api
  save() {
    return {
      courseId: this.course.id, data: this.serialize(),
    };
  }

  get mustPayImmediatly() {
    return Boolean(this.needsPayment && moment(this.payment_due_at).isBefore(TimeStore.getNow()));
  }

  onSaved({ data }) {
    this.update(data);
  }

  @computed get needsPayment() {
    return !(this.is_paid || this.is_comped);
  }

  @action markPaid() {
    this.is_paid = true;
    this.prompt_student_to_pay = false;
  }
}
