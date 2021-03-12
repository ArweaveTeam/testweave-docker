import {startRescan} from './database/rescan.database';

(async () => await startRescan('snapshot/.rescan'))();
