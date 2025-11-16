import { toWebRequest } from 'h3';
import { auth } from '../../../services/auth';

export default defineEventHandler(async (event) => {
  return auth.handler(toWebRequest(event));
});
