import {json} from 'body-parser';

export const jsonMiddleware = json({
  limit: '15mb',
  type: () => true,
});
