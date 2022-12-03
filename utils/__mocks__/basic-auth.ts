import { NextApiRequest, NextApiResponse } from 'next'

export default async function checkBasicAuth (_req:NextApiRequest, _res:NextApiResponse) {
    return true;
}