import { NextApiRequest, NextApiResponse } from 'next'
import moment from 'moment-timezone';
import logger from '../../../utils/logger';
import { checkBasicAuthForMetrics } from '../../../utils/basic-auth';
import { initialize, LogDao } from '../../../dao/mongoose';
import { ActivityEntry } from '../../../types/activity-entry';

type logEntry = {
  _id: {
    date: string;
    type: string
  },
  count: number;
};

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if (await checkBasicAuthForMetrics(req, res)) {
    await initialize();
    const { method } = req;
    const instance = req.query.instance ? Array.isArray(req.query.instance) ? req.query.instance[0]: req.query.instance : 'vt';
    const range = req.query.range ? parseInt(Array.isArray(req.query.range) ? req.query.range[0]: req.query.range) : 30;
    const timezone = req.query.timezone ? Array.isArray(req.query.timezone) ? req.query.timezone[0]: req.query.timezone : 'America/New_York';
    const minDate = moment.tz(timezone).startOf('day').subtract(range - 1, 'days');
  
    if (method === 'GET') {
      const logEntries:Array<logEntry> = await LogDao.aggregate([
        {
          '$match': {
            'meta.instance': instance,
            'meta.service': `/api/sms/${instance}`,
            'meta.state': 'idle',
            timestamp: { $gte: minDate.toDate() },
          }
        },
        {
          '$project': {
            'localDate': {
              '$dateToString': {
                'date': '$timestamp', 
                'timezone': 'America/New_York', 
                'format': '%Y-%m-%d'
              }
            }, 
            'type': '$meta.result'
          }
        },
        {
          '$group': {
            '_id': {
              'date': '$localDate', 
              'type': '$type'
            }, 
            'count': {
              '$sum': 1
            }
          }
        }
      ]).exec();

      // build a map of dates
      const activity = new Map<string, ActivityEntry>();
      for (let i = 0; i < range; i++) {
        const date = minDate.toISOString().split('T')[0];
        activity.set(date, {
          date,
          'case found': 0,
          'case not found': 0,
          'case not matching regex': 0,
        });
        minDate.add(1, 'days');
      }

      // go thru each aggregation and add to map
      logEntries.forEach((o: logEntry) => {
        const date: string = o._id.date;
        const type: string = o._id.type;
        const count: number = o.count;

        if (activity.has(date) !== true) {
          const cookies: { [key: string] : string} = req.cookies;
          const input = '';
          const phone = '';
          const state: string = cookies.state || 'idle';
          logger.warn(`${phone} (${instance})[${state}]: unexpected input`, { metadata: {
            service: `/api/sms/${instance}`,
            cookies,
            instance,
            input,
            phone,
            state,
            result: 'unexpected input',
          }});
        }
          const elem: ActivityEntry | undefined = activity.get(date);

          // The ActivityEntry object must be defined
          if (elem != undefined) {

            if (type === 'case found' ) {
              elem['case found'] = count;
            } else if (type === 'case not found') {
              elem['case not found'] = count;
            } else if (type ===  'case not matching regex') {
              elem['case not matching regex'] = count;
            } else {
                const cookies: { [key: string] : string} = req.cookies;
                const input = '';
                const phone = '';
                const state: string = cookies.state || 'idle';
              logger.warn(`${phone} (${instance})[${state}]: unexpected input`, { metadata: {
                service: `/api/sms/${instance}`,
                cookies,
                instance,
                input,
                phone,
                state,
                result: 'unexpected input',
              }});
            }

          }
          
      });

      res.send({
        activity: Array.from(activity.values()),
      });
    } else {
        res
          .status(400)
          .json({ success: false });
    }
  }

  res.end();
}