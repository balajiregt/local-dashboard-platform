import { test, expect } from '@playwright/test';
import { landingpage } from '../Pages/landing.page';

test.beforeEach(async ({ page }) => {
    await page.goto('https://reference-tryout-api.herokuapp.com/docs');
});

test.describe('@e2e To validate the endpoint routes- count', () => {
    test('test1-madeup', async ({ page }) => {
        const landscn = new landingpage(page)
        await expect(landscn.madeup).toHaveCount(1)
    });

    test('test2-internalservererror', async ({ page }) => {
        const landscn = new landingpage(page)
        await expect(landscn.internalservererror).toHaveCount(1)
    });

    test('test3-unauthorized', async ({ page }) => {
        const landscn = new landingpage(page)
        await expect(landscn.unauthorized).toHaveCount(1)
    });

    test('test4-noresponse', async ({ page }) => {
        const landscn = new landingpage(page)
        await expect(landscn.noresponse).toHaveCount(1)
    });

    test('test5-badrequest', async ({ page }) => {
        const landscn = new landingpage(page)
        await expect(landscn.badrequest).toHaveCount(1)
    });

    test('test6-forbidden', async ({ page }) => {
        const landscn = new landingpage(page)
        await expect(landscn.forbidden).toHaveCount(1)
    });

    test('test7-gatewaytimeout', async ({ page }) => {
        const landscn = new landingpage(page)
        await expect(landscn.gatewaytimeout).toHaveCount(1)
    });
});




