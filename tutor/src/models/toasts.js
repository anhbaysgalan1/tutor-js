import invariant from 'invariant';
import { Store, setHandlers } from 'shared/model/toasts';

import * as lms from '../components/toasts/lms';
import * as scores from '../components/toasts/scores';
import Reload from '../components/toasts/reload';

const JobToasts = { lms, scores };

setHandlers({
  job(toast) {
    invariant(['ok', 'failed'].includes(toast.status), 'job status must be ok or failed');
    return JobToasts[toast.type][toast.status == 'ok' ? 'Success' : 'Failure'];
  },
  reload() {
    return Reload;
  },
});

export { Toast } from 'shared/model/toasts';

export default Store;
