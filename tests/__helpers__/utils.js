import { randomInt } from 'node:crypto';

export function randomPhoneNumber() {
    const phoneNumber = Array(10)
                        .fill(undefined)
                        .map((_, _index) => {
                            return randomInt(0,9).toString();
                        });
    return "+" + phoneNumber.join("");
}

export function eventAsCase(eventDocument) {
    return {
        uid: eventDocument._id,
        number: eventDocument.docket_number,
        date: eventDocument.date,
        address: `${eventDocument.court_room_code} ${eventDocument.county.name}, VT`
    }
}