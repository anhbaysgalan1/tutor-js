import {
  identifiedBy, session,
} from 'shared/model';

import moment from 'moment';
import { observable, computed } from 'mobx';
import Job from '../job';
import UiSettings from 'shared/model/ui-settings';
import { TimeStore } from '../../flux/time';
import Toasts from '../toasts';

const CURRENT = observable.map();
const LAST_EXPORT = 'sce';

@identifiedBy('jobs/scores-export')
export default class ScoresExport extends Job {

  static forCourse(course) {
    let exp = CURRENT.get(course.id);
    if (!exp){
      exp = new ScoresExport(course);
      CURRENT.set(course.id, exp);
    }
    return exp;
  }

  @observable course;
  @session url;

  @computed get lastExportedAt() {
    const date = UiSettings.get(LAST_EXPORT, this.course.id);
    return date ? moment(date).format('M/D/YY, h:mma') : null;
  }

  constructor(course) {
    super({ maxAttempts: 120, interval: 5 }); // every 5 seconds for max of 10 mins
    this.course = course;
  }

  onPollComplete(info) {
    UiSettings.set(LAST_EXPORT, this.course.id, TimeStore.getNow().toISOString());
    Toasts.push({
      info,
      type: 'scores',
      handler: 'job',
      status: this.hasFailed ? 'failed' : 'ok',
    });
  }

  create() {
    // set this now so status updates immediately
    this.pollingId = 'pending';
  }

  onCreated({ data }) {
    this.startPolling(data.job);
  }

}
