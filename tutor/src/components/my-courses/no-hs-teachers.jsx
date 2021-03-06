import React from 'react';
import SupportLink from '../support-email-link';
import { Panel } from 'react-bootstrap';

export default function NoHSTeachers() {
  return (
    <div className="only-college-instructors">
      <Panel>
        <p>
          Thanks for your interest in OpenStax Tutor Beta! At this time, OpenStax Tutor Beta is only available to instructors and students at 2- and 4-year institutions in the United States. Unfortunately, we’re not able to offer OpenStax Tutor Beta to high school, home school, corporate or international users at this time.
        </p>
        <p>
          In the meantime, we have over 50 online homework and ancillary partners that have created low-cost tools that integrate with our books. You can find those resources at <a href="https://openstax.org/partners">openstax.org/partners</a>.
        </p>
        <p>
          If you think you’ve reached this page in error, please contact <SupportLink displayEmail />.
        </p>
      </Panel>
    </div>
  );
}
