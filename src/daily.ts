import type { Moment } from 'moment';
import { path } from './lineage';
/** Local calendar arithmetic; cloning prevents mutation of caller's date. */
export function tomorrowPath(now:Moment,folder:string,format:string):string {
  return path([folder,now.clone().add(1,'day').format(format || 'YYYY-MM-DD')].filter(Boolean).join('/'));
}

/** Read-only validation of the core Daily Notes configuration file. */
export function coreDailySettings(value:unknown):{folder:string;format:string} {
  if(!value || typeof value!=='object' || Array.isArray(value)) throw Error('Daily Notes configuration must be a JSON object.');
  const settings=value as {folder?:unknown;format?:unknown};
  if(settings.folder!==undefined && typeof settings.folder!=='string')throw Error('Daily Notes folder setting is invalid.');
  if(settings.format!==undefined && typeof settings.format!=='string')throw Error('Daily Notes filename format is invalid.');
  return {folder:(settings.folder as string || '').trim().replace(/\/+$/,''),format:(settings.format as string || '').trim() || 'YYYY-MM-DD'};
}
