import type { Moment } from 'moment';
import { path } from './lineage';
/** Local calendar arithmetic; cloning prevents mutation of caller's date. */
export function tomorrowPath(now:Moment,folder:string,format:string):string {
  return path([folder,now.clone().add(1,'day').format(format || 'YYYY-MM-DD')].filter(Boolean).join('/'));
}
