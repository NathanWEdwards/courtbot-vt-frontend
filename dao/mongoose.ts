import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model } from 'mongoose';
import { Log, Notification, Reminder } from '../types';


let mongoServer: null | MongoMemoryServer;
let conn:Connection;
let NotificationDao:Model<Notification>;
let ReminderDao:Model<Reminder>;
let LogDao:Model<Log>;

const {
  LOG_COLLECTION = 'log',
} = process.env;

const NotificationSchema = new mongoose.Schema<Notification>({
  uid: {
    type: String,
    required: true,
    index: true,
  },
  number: {
    type: String,
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
    index: true,
  },
  event_date: {
    type: Date,
    required: true,
  },
  error: {
    type: String,
  },
},{
  timestamps: true,
});

const ReminderSchema = new mongoose.Schema<Reminder>({
  uid: {
    type: String,
    required: true,
    index: true,
  },
  number: {
    type: String,
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
    index: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
},{
  timestamps: true,
});

const LogSchema = new mongoose.Schema<Log>({
  uid: {
    type: String,
    required: true,
    index: true,
  },
  number: {
    type: String,
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
    index: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
},{
  collection: LOG_COLLECTION,
  timestamps: true,
});

async function initialize() {
  if (conn == null) {
    let uri = process.env.MONGODB_URI || '';
    if (process.env.NODE_ENV == "development") {
      mongoServer = await MongoMemoryServer.create({instance: {launchTimeout: 30000}});
      uri = mongoServer.getUri();
    }
    conn = await mongoose.createConnection(uri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    NotificationDao = conn.model<Notification>('Notification', NotificationSchema);
    ReminderDao = conn.model<Reminder>('Reminder', ReminderSchema);
    LogDao = conn.model<Log>('Log', LogSchema);
  }
}

export {
  initialize,
  LogDao,
  NotificationDao,
  ReminderDao,
};