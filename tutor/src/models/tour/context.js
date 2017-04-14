import {
  BaseModel, identifiedBy, computed, observable, field,
} from '../base';
import {
  find, isEmpty, intersection, compact, uniq, flatMap, map, includes, filter, first,
} from 'lodash';
import { observe, action } from 'mobx';

import Courses   from '../courses';
import User      from '../user';
import Tour      from '../tour';
import TourRide  from './ride';
import invariant from 'invariant';

// TourContext
// Created by the upper-most React element (the Conductor)
// Regions and Anchors check in and out as they're mounted/unmounted

@identifiedBy('tour/context')
export default class TourContext extends BaseModel {

  @observable regions = observable.shallowArray();
  @observable anchors = observable.shallowMap();

  @field isEnabled = false;

  @field emitDebugInfo = false;

  @observable forcePastToursIndication;

  constructor(attrs) {
    super(attrs);
    observe(this, 'tourRide', this._onTourRideChange.bind(this));
  }

  @computed get tourIds() {
    if (!this.isEnabled) { return []; }
    return compact(uniq(flatMap(this.regions, r => r.tour_ids)));
  }

  @computed get courseIds() {
    return compact(uniq(map(this.regions, 'courseId')));
  }

  @computed get courses() {
    return compact(this.courseIds.map(id => Courses.get(id)));
  }

  addAnchor(id, domEl) {
    this.anchors.set(id, domEl);
  }

  removeAnchor(id) {
    this.anchors.delete(id);
  }

  openRegion(region) {
    const existing = find(this.regions, { id: region.id });
    if (existing){
      invariant(existing === region, `attempted to add region ${region.id}, but it already exists!`);
    } else { // no need to add if existing is the same object
      this.regions.push(region);
    }
  }

  closeRegion(region) {
    this.regions.remove(region);
  }

  @computed get activeRegion() {
    if (!this.tour){ return null; }
    return this.regions.find(region => region.tour_ids.find(tid => tid === this.tour.id));
  }

  @computed get tour() {
    return find(this.validTours, (tour) => (!includes(User.viewed_tour_ids, tour.id))) || null;
  }

  @computed get tourRide() {
    const { tour } = this;
    if ( tour ) {
      return new TourRide({ tour, context: this, region: this.activeRegion });
    }
    return null;
  }

  @computed get hasViewableTour() {
    return !isEmpty(this.validTours);
  }

  @computed get audienceTags() {
    return uniq(flatMap(this.courses, c => c.tourAudienceTags).concat(User.tourAudienceTags));
  }

  @computed get toursTags() {
    return flatMap(this.allTours, t => t.audience_tags);
  }

  @computed get allTours() {
    return compact(this.tourIds.map(id => Tour.forIdentifier(id)));
  }

  @computed get validTours() {
    return filter(this.allTours, (tour) => (!isEmpty(intersection(tour.audience_tags, this.audienceTags))));
  }

  @computed get unwatchedTours() {
    return filter(this.validTours, (tour) => (!includes(User.viewed_tour_ids, tour.id)));
  }

  @computed get debugStatus() {
    return `available regions: [${map(this.regions, 'id')}]; region tour ids: [${this.tourIds}]; audience tags: [${this.audienceTags}]; tour tags: [${this.toursTags}]; valid tours: [${map(this.validTours,'id')}]; TOUR RIDE: ${this.tourRide ? this.tourRide.tour.id : '<none>'}`;
  }

  @action replayTours() {
    this.validTours.forEach((tour) => {
      tour.replay();
    });
  }

  _onTourRideChange({ type, oldValue: oldRide }) {
    if (type !== 'update') { return; }
    if (oldRide) { oldRide.dispose(); }
  }

}
