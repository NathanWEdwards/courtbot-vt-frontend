import { createMocks } from 'node-mocks-http';
import { Case } from '../../../../../../types/case';

const {
    BASIC_AUTH_USERNAME,
    BASIC_AUTH_PASSWORD
} = process.env;

export function subscribe(phoneNumber: number, courtCase: Case, textMessage: string) {
    const { req, res } = createMocks({ method: 'POST' });

    const auth = Buffer.from(`${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}`).toString('base64');

    req.headers = {
        authorization: `Basic ${auth}`
    };

    req.body = {
        Body: textMessage,
        From: phoneNumber
    };

    req.cookies = {
        state: 'case_found',
        cases: JSON.stringify([courtCase])
    }

    req.query = {
        instance: 'vt'
    };

    res.setHeader = jest.fn();

    res.end = jest.fn();

    return {
        req,
        res
    }
}