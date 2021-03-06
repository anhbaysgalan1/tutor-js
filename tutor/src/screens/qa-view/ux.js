import { observable, computed, action, autorun } from 'mobx';
import { readonly } from 'core-decorators';
import { pick, assign, extend, uniq, flatMap, first } from 'lodash';
import MenuToggle from '../../components/book-menu/toggle';
import EcosystemSelector from './ecosystem-selector';
import Router from '../../helpers/router';
import ViewToggle from './view-toggle';
import UserMenu from '../../components/navbar/user-menu';
import DefaultExercises from '../../models/exercises';
import DefaultEcosystems from '../../models/ecosystems';
import BookUX from '../../models/reference-book/ux';


// menu width (300) + page width (1000) + 50 px padding
// corresponds to @book-page-width and @book-menu-width in variables.scss
const MENU_VISIBLE_BREAKPOINT = 1350;

export default class QaScreenUX extends BookUX {

  @readonly allowsAnnotating = false;
  @observable ecosystemId;

  @observable isDisplayingExercises = true;
  @observable isMenuVisible = window.innerWidth > MENU_VISIBLE_BREAKPOINT;
  @observable isShowing2StepPreview = false;
  @observable ignoredExerciseTypes = [];

  constructor({
    router,
    exercises = DefaultExercises,
    ecosystems = DefaultEcosystems,
  }) {
    super();
    this.router = router;
    this.exercisesMap = exercises;
    this.ecosystemsMap = ecosystems;

    this.diposeExerciseFetcher = autorun(() => {
      if (this.ecosystem && !this.ecosystem.referenceBook.api.isFetchedOrFetching) {
        this.ecosystemId = this.ecosystem.id;
      }
      if (this.book && this.page) {
        this.exercisesMap.ensurePagesLoaded({
          book: this.book, page_ids: [this.page.id], limit: false,
        });
      }
    });
  }

  @computed get isFetchingExercises() {
    return Boolean(
      this.ecosystem &&
        this.page &&
        this.exercisesMap.isFetching({ page_id: this.page.id })
    );
  }

  @action unmount() {
    super.unmount();
    this.diposeExerciseFetcher();
  }

  @computed get exercises() {
    if (!this.page) { return []; }
    return this.exercisesMap.forPageId(this.page.id);
  }

  @computed get exerciseTypes() {
    return uniq(flatMap(this.exercises, 'types'));
  }

  // TODO, complete ignoring types
  isTypeIgnored() { return false; }

  @action.bound onEcosystemSelect(ecosystemId) {
    this.router.history.push(
      Router.makePathname('QADashboard', { ecosystemId }),
    );
  }

  @computed get ecosystem() {
    return this.ecosystemsMap.get(this.ecosystemId);
  }

  checkForTeacherContent() { }

  @action.bound setDisplayingPanel(el, checked) {
    this.isDisplayingExercises = checked;
  }

  sectionHref(section) {
    if (!section) { return null; }
    return Router.makePathname('QADashboard', {
      ecosystemId: this.ecosystemId,
      chapterSection: section.chapter_section.asString,
    });
  }

  sectionLinkProps(section) {
    if (!section) { return null; }
    return {
      to: 'QADashboard',
      params: extend(Router.currentParams(), { chapterSection: section.chapter_section.asString }),
    };
  }

  @action.bound onNavSetSection(path) {
    this.router.history.push(path);
  }

  setNavBar(nav) {
    nav.childProps.set('ux', this);
    nav.left.merge({
      'slide-out-menu-toggle': MenuToggle,
    });
    nav.right.merge({
      view: ViewToggle,
      ecosystems: EcosystemSelector,
      menu: UserMenu,
    });
  }

}
