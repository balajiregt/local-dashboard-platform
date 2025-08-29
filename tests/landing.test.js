import { test, expect } from '@playwright/test';
import { landingpage } from '../../project3_pom/Pages/landing.page';

test.beforeEach(async ({ page }) => {
    await page.goto('https://reference-tryout-api.herokuapp.com/docs');
});

test.describe('@e2e To validate the landing page-> header title', () => {
    test('test1-madeup', async ({ page }) => {
        const landscn = new landingpage(page)
        var linkname = await landscn.innertext_madeup()
        console.log(linkname)
        // var linkname2=linkname.replace('/','')

        await landscn.click_madeup()

        var header = await landscn.innertext_header()
        console.log('destination page header: ', header)
        var assertstringmatch = linkname.includes(header) || header.includes(linkname)
        await expect(assertstringmatch).toBeTruthy()
    })

    test('test2-internalservererror', async ({ page }) => {
        const landscn = new landingpage(page)
        var linkname = await landscn.innertext_internalservererror()
        //var linkname2=linkname.replace('/','')
        console.log('linktext is: ', linkname)

        await landscn.click_internalservererror()

        var header = await landscn.innertext_header()
        console.log('destination page header: ', header)
        var assertstringmatch = linkname.includes(header) || header.includes(linkname)
        await expect(assertstringmatch).toBeTruthy()
    })

    test('test3-noresponse', async ({ page }) => {
        const landscn = new landingpage(page)
        var linkname = await landscn.innertext_noresponse()
        //var linkname2=linkname.replace('/','')
        console.log('linktext is: ', linkname)

        await landscn.click_noresponse()

        var header = await landscn.innertext_header()
        console.log('destination page header: ', header)
        var assertstringmatch = linkname.includes(header) || header2.includes(linkname)
        await expect(assertstringmatch).toBeTruthy()
    })

    test('test4-badrequest', async ({ page }) => {
        const landscn = new landingpage(page)
        var linkname = await landscn.innertext_badrequest()
        // var linkname2=linkname.replace('/','')
        console.log('linktext is: ', linkname)

        await landscn.click_badrequest()

        var header = await landscn.innertext_header()
        console.log('destination page header: ', header)
        var assertstringmatch = linkname.includes(header) || header.includes(linkname)
        await expect(assertstringmatch).toBeTruthy()
    })

    test('test5-forbidden', async ({ page }) => {
        const landscn = new landingpage(page)
        var linkname = await landscn.innertext_forbidden()
        //  var linkname2=linkname.replace('/','')
        console.log('linktext is: ', linkname)

        await landscn.click_forbidden()

        var header = await landscn.innertext_header()
        console.log('destination page header: ', header)
        var assertstringmatch = linkname.includes(header) || header.includes(linkname)
        await expect(assertstringmatch).toBeTruthy()
    })

    test('test6-gatewaytimeout', async ({ page }) => {
        const landscn = new landingpage(page)
        var linkname = await landscn.innertext_gatewaytimeout()
        //var linkname2=linkname.replace('/','')
        console.log('linktext is: ', linkname)

        await landscn.click_gatewaytimeout()

        var header = await landscn.innertext_header()
        console.log('destination page header: ', header)
        var assertstringmatch = linkname.includes(header) || header.includes(linkname)
        await expect(assertstringmatch).toBeTruthy()
    })

    test('test7-unauthorized', async ({ page }) => {
        const landscn = new landingpage(page)
        var linkname = await landscn.innertext_unauthorized()
        //var linkname2=linkname.replace('/','')
        console.log('linktext is: ', linkname)

        await landscn.click_unauthorized()

        var header = await landscn.innertext_header()
        console.log('destination page header: ', header)
        var assertstringmatch = linkname.includes(header) || header.includes(linkname)
        await expect(assertstringmatch).toBeTruthy()
    })

    test('test8-managehealth', async ({ page }) => {
        const landscn = new landingpage(page)
        var linkname = await page.locator('#endpoints').innerText()
        console.log('linktext is: ', linkname)

        await landscn.click_managehealth()

        var header = await landscn.innertext_header()
        console.log('destination page header: ', header)

        var assertstringmatch = linkname.includes(header) || header.includes(linkname)
        await expect(assertstringmatch).toBeTruthy()
    })

});






