import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { computed, action } from 'mobx';
import { observer } from 'mobx-react';
import TourAnchor from '../tours/anchor';
import Icon from '../icon';
import Course from '../../models/course';
import Export from '../../models/jobs/scores-export';

@observer
export default class ScoresExport extends React.PureComponent {

  static propTypes = {
    course: React.PropTypes.instanceOf(Course).isRequired,
  }

  @computed get scoresExport() {
    return Export.forCourse(this.props.course);
  }

  @action.bound startExport() {
    this.scoresExport.create();
  }

  @computed get message() {
    if (this.scoresExport.isPending) {
      return <span className="busy">Exporting spreadsheet…</span>;
    }
    return <span>Last exported: {this.scoresExport.lastExportedAt}</span>;
  }

  render() {
    return (
      <TourAnchor className="job scores-export" id="scores-export-button">
        <Button
          disabled={this.scoresExport.isPending}
          onClick={this.startExport}
        >
          <Icon type="download" />
        </Button>
        {this.message}
      </TourAnchor>
    );
  }

}
