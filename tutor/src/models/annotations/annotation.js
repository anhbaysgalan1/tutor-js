import { get } from 'lodash';
import { computed, action, observable } from 'mobx';
import serializeSelection from 'serialize-selection';
import Hypothesis from './hypothesis';
import {
  BaseModel, identifiedBy, field, identifier, session, belongsTo, hasMany,
} from '../base';
import DOM from '../../helpers/dom';

@identifiedBy('annotations/annotation/target')
export class AnnotationSelector extends BaseModel {

  @identifier elementId;

  @field chapter;
  @field content;
  @field courseId;
  @field end;
  @field section;
  @field start;
  @field title;
  @field type = 'TextPositionSelector'
  @observable bounds;

  @action restore(highlighter) {
    const el = document.getElementById(this.elementId);
    if (!el) { return null; }
    const selection = serializeSelection.restore(this, el);
    this.bounds = selection.getRangeAt(0).getBoundingClientRect();
    if (highlighter) {
      highlighter.doHighlight();
    }
    return selection;
  }

}

@identifiedBy('annotations/annotation/target')
export class AnnotationTarget extends BaseModel {

  @identifier source;
  @hasMany({ model: AnnotationSelector }) selector;

}

@identifiedBy('annotations/annotation')
export default class Annotation extends BaseModel {

  @identifier id;
  @field user;
  @field text;
  @field uri;
  @field hidden;
  @field flagged;

  @field({ type: 'date' }) created;
  @field({ type: 'date' }) updated;
  @field({ type: 'object' }) rect;
  @field({ type: 'object' }) document;
  @field({ type: 'object' }) links;
  @field({ type: 'object' }) permissions;
  @field({ type: 'array' }) tags;
  @session({ type: 'object' }) style;
  @hasMany({ model: AnnotationTarget }) target;
  @belongsTo({ model: 'annotations' }) listing;

  @computed get selection() {
    return get(this, 'target[0].selector[0]', {});
  }

  @computed get elementId() {
    return get(this.selection, 'elementId');
  }

  @computed get element() {
    return this.elementId ? document.getElementById(this.elementId) : null;
  }

  @computed get referenceElement() {
    return this.element ? DOM.closest(this.element, '[id]') : null;
  }

  @computed get courseId() {
    return this.selection.courseId;
  }

  @computed get chapter() {
    return this.selection.chapter;
  }

  @computed get section() {
    return this.selection.section;
  }

  @action save() {
    return this.listing.update(this);
  }

  @action destroy() {
    return this.listing.destroy(this);
  }

  // get style() {
  //   const rect = this.selection.restore();
  //   console.log(rect)
  //   return {
  //     top: rect.top - this.parentRect.top,
  //     position: 'absolute',
  //   }
  // }

  isSiblingOfElement(el) {
    if (!el) { return; }
    if (el === this.referenceElement) { return true; }
    let node = el.parentNode;
    while (node != null) {
      if (node == this.referenceElement) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }


}