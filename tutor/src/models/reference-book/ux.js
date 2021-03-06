import { observable, computed, action, observe } from 'mobx';
import { first, invoke } from 'lodash';

import WindowSize from '../window-size';
import Courses from '../courses-map';
import Book from '../reference-book';

// menu width (300) + page width (1000) + 50 px padding
// corresponds to @book-page-width and @book-menu-width in variables.scss
const MENU_VISIBLE_BREAKPOINT = 1350;

export default class BookUX {

  @observable isMenuVisible = window.innerWidth > MENU_VISIBLE_BREAKPOINT;
  @observable chapterSection;
  @observable ecosystemId;
  @observable book;

  windowSize = new WindowSize();

  constructor() {
    this.disposers = [
      observe(this, 'ecosystemId', this.onEcosystemChange),
      observe(this, 'chapterSection', this.onChapterSectionChange),
    ];
  }

  unmount() {
    this.disposers.forEach(d => d());
    this.disposers = [];
  }

  @action.bound onEcosystemChange({ newValue: ecosystemId }) {
    if (this.book && this.book.id == ecosystemId){ return; }
    this.book = new Book({ id: ecosystemId });
    this.book.fetch().then(() => {
      if (!this.chapterSection) {
        this.setChapterSection();  // will default to first section
      }
    });
  }

  @computed get isFetching() {
    return Boolean(
      (this.book && this.book.api.isPending) || (this.page && this.page.api.isPending)
    );
  }

  @action.bound onMenuSelection(section) {
    this.setChapterSection(section);
    if (this.isMenuOnTop) { this.isMenuVisible = false; }
  }

  @action.bound onChapterSectionChange({ newValue: section }) {
    if (section && this.page) {
      this.page.ensureLoaded();
    }
  }

  @computed get isMenuOnTop() {
    return this.windowSize.width < MENU_VISIBLE_BREAKPOINT;
  }


  @action.bound toggleTocMenu() {
    this.isMenuVisible = !this.isMenuVisible;
  }

  @action.bound update(props) {
    this.ecosystemId = props.ecosystemId;
    this.setChapterSection(props.chapterSection);
  }

  @action setChapterSection(cs) {
    if (this.book && !cs) {
      cs = first(this.book.pages.byChapterSection.keys());
    }
    if (this.tours && this.tours.tourRide) {
      // wait for React to re-render, mathjax to run, and the page to reflow
      setTimeout(() => invoke(this, 'tours.tourRide.joyrideRef.calcPlacement'), 10);
    }
    this.chapterSection = cs;
  }

  @computed get pages() {
    return this.book.pages;
  }

  @computed get course() {
    return this.ecosystemId && Courses.forEcosystemId(this.ecosystemId);
  }

  @computed get page() {
    return this.book && this.chapterSection && this.book.pages.byChapterSection.get(this.chapterSection);
  }

  @computed get toc() {
    return this.book.children;
  }

  @computed get courseDataProps() {
    const { course } = this;
    return course ? {
      'data-title': course.name,
      'data-book-title': course.bookName || '',
      'data-appearance': course.appearance_code,
    } : {};
  }

  @computed get pagingProps() {
    return {
      onForwardNavigation: this.onNavSetSection,
      onBackwardNavigation: this.onNavSetSection,
      isForwardEnabled: !!this.page.nextPage,
      isBackwardEnabled: !!this.page.prevPage,
      forwardHref: this.sectionHref(this.page.nextPage),
      backwardHref: this.sectionHref(this.page.prevPage),
    };
  }

}
