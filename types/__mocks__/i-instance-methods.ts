import { EventDao } from '../../instances/vt/dao/__mocks__/mongoose';

const TIMEZONE = 'America/New_York';

function getInstanceMethods () {
    return  {
            getWebsite() {
              return `https://www.vermontjudiciary.org/court-hearings`;
            },
          
            getNumberRegex() {
              return /.+-.+-.+/;
            },
          
            findAll() {
                return EventDao._data;
            },
          
            getTestCase(_days:number) {
              return {
                uid: `testcase`,
                number: `testcase`,
                date: new Date(Date.now()),
                address: `65 State Street Montpelier, VT`,
              };
            },
          
            getHelpText() {
              return `Reply with a docket number to sign up for a reminder. Docket numbers look like 3 sets of numbers or characters. For example: 123-45-67 or 123-CR-45.`;
            },
          
            getTimezone() {
              return TIMEZONE;
            },
          }

}

module.exports = {
  getInstanceMethods
}