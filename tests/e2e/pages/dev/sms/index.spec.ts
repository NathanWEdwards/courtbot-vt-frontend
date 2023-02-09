import { lstatSync, readdirSync } from 'fs';
import { join } from 'path';
import { expect, test } from '@playwright/test';

const BASEURL = 'http://localhost:3000';
const URI = '/dev/sms';

test.describe('Sms()', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASEURL}${URI}`, { waitUntil: 'networkidle'});
    });

    test('The select element designated for selecting an instance displays all instance options.', async ({ page }) => {
        await page.goto(`${BASEURL}${URI}`, { waitUntil: 'networkidle'});
        const instanceOptions = page.locator('select[aria-label="courtbot-instances"] > option');
        const instances = (await instanceOptions.allInnerTexts()).map((instance) => { return instance.toLowerCase() });
        const instanceDirectory = join(process.cwd(), '/instances/');
        const directoryContents = readdirSync(instanceDirectory);
        const directoryInstances = directoryContents.filter((item) => {
            return lstatSync(join(instanceDirectory, item)).isDirectory();
        });
        expect(instances).toEqual(directoryInstances);
    });
})