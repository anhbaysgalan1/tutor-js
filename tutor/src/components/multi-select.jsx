import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import { find } from 'lodash';
import classnames from 'classnames';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import Icon from './icon';

@observer
class MultiSelect extends React.Component {

  static propTypes = {
    title:      React.PropTypes.string.isRequired,
    className:  React.PropTypes.string,
    closeAfterSelect: React.PropTypes.bool,
    selections: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id:       React.PropTypes.string,
        title:    React.PropTypes.oneOfType([
          React.PropTypes.string, React.PropTypes.element,
        ]),
        selected: React.PropTypes.bool,
      })
    ).isRequired,
    onOnlySelection: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    tabIndex: React.PropTypes.number
  };

  static defaultProps = {
    closeAfterSelect: true,
    tabIndex: 0
  }

  @observable isOpen = false;

  @action.bound toggleOnly(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    return this.props.onOnlySelection(ev.target.getAttribute('data-id'));
  }

  @action.bound onSelect(selection) {
    if (this.props.onSelect) {
      this.props.onSelect(
        find(this.props.selections, { id: selection })
      );
    }
  }

  @action.bound onToggle(isOpen, ev, { source }) {
    if (this.props.closeAfterSelect || 'select' !== source) {
      this.isOpen = isOpen;
    }
  }

  renderMenuSelection = (selection) => {
    let onlyToggle;
    if (this.props.onOnlySelection) {
      onlyToggle = <span className="only" data-id={selection.id} onClick={this.toggleOnly}>
        only
      </span>;
    }

    return (
      <MenuItem
        key={selection.id}
        eventKey={selection.id}
        className="multi-selection-option"
      >
        <Icon type={selection.selected ? 'check-square-o' : 'square-o'} />
        <span className="title">{selection.title}</span>
        {onlyToggle}
      </MenuItem>
    );
  };

  render() {
    return (
      <div className={classnames('multi-select', this.props.className)}>
        <DropdownButton
          id="multi-select"
          onSelect={this.onSelect}
          title={this.props.title}
          onToggle={this.onToggle}
          open={this.isOpen}
          tabIndex={this.props.tabIndex}
        >
          {Array.from(this.props.selections).map((selection) => this.renderMenuSelection(selection))}
        </DropdownButton>
      </div>
    );
  }
}


export default MultiSelect;
