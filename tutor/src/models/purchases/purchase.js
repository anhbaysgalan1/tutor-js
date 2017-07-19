import { find } from 'lodash';
import moment from 'moment';
import {
  BaseModel, identifiedBy, field, identifier, belongsTo, computed, observable,
} from '../base';
import Courses from '../courses-map';
import { TimeStore } from '../../flux/time';
import { numberWithTwoDecimalPlaces } from '../../helpers/string';


@identifiedBy('purchase/product')
class Product extends BaseModel {
  @identifier uuid;
  @field name;
  @field price;
}

@identifiedBy('purchase')
export default class Purchase extends BaseModel {

  static URL = observable.shallowBox('');

  @identifier identifier;
  @field product_instance_uuid;
  @field is_refunded;
  @field sales_tax;
  @field total;
  @field({ type: 'date' }) updated_at;
  @field({ type: 'date' }) purchased_at;
  @belongsTo({ model: Product }) product;

  @computed get course() {
    return find(Courses.array, c =>
      c.userStudentRecord && c.userStudentRecord.uuid == this.product_instance_uuid);
  }

  @computed get isRefundable() {
    return !this.is_refunded &&
           moment(this.purchased_at).add(14, 'days').isAfter(TimeStore.getNow());
  }

  @computed get invoiceURL() {
    return Purchase.URL.get() + '/invoice/' + this.identifier;
  }

  @computed get formattedTotal() {
    const amount = numberWithTwoDecimalPlaces(this.total);
    return this.is_refunded ? `-${amount}` : amount;
  }

  refund() {
    return { item_uuid: this.product_instance_uuid, refund_survey: this.refund_survey };
  }

  onRefunded() {
    this.is_refunded = true;
    if (this.course) {
      this.course.userStudentRecord.is_paid = false;
      this.course.userStudentRecord.prompt_student_to_pay = true;
    }
  }

}