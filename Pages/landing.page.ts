  //import {expect,Page} from '@playwright/test'

// export default class landingpage{
//     constructor(public page:Page){
//     }

//     async madeup(){
//         await this.page.locator('a[href="/madeup"]').click()

//     }

//     async internalservererror(){
//      await this.page.locator('a[href="/internal_server_error"]').click()
//     }

//     async unauthorized(){
//         await this.page.locator('a[href="/unauthorized"]').click()
//     }
//     async noresponse(){
//         await this.page.locator('a[href="/no_response"]').click()
//     }
//     async badrequest(){
//         await this.page.locator('a[href="/bad_request"]').click()
//     }
//     async forbidden(){
//         await this.page.locator('a[href="/forbidden"]').click()
//     }
//     async gatewaytimeout(){
//         await this.page.locator('a[href="/gateway_timeout"]').click()
//     }

//     async managehealth(){
//         await this.page.locator('a[href="/manage/health"]').click()
//     }

// }
//home.page.ts
import { expect, Locator, Page } from '@playwright/test';
export class landingpage {
    readonly page: Page;
    readonly madeup: Locator;
    readonly internalservererror: Locator;
    readonly noresponse: Locator
    readonly unauthorized: Locator;
    readonly badrequest: Locator;
    readonly gatewaytimeout: Locator
    readonly forbidden: Locator;
    readonly managehealth: Locator
    readonly landingpageheader: Locator

    constructor(page: Page) {
        this.page = page;
        this.madeup = page.locator('a[href="/madeup"]')
        this.internalservererror = page.locator('a[href="/internal_server_error"]')
        this.noresponse = page.locator('a[href="/no_response"]')
        this.unauthorized = page.locator('a[href="/unauthorized"]')
        this.badrequest = page.locator('a[href="/bad_request"]')
        this.gatewaytimeout = page.locator('a[href="/gateway_timeout"]')
        this.forbidden = page.locator('a[href="/forbidden"]')
        this.managehealth = page.locator('a[href="/manage/health"]')
        this.landingpageheader=page.locator('#service')
    }

    async innertext_header(){
        var headertext=await this.landingpageheader.innerText()
        return headertext
    }
    
    async click_madeup() {
        await this.madeup.click()
    }
    async innertext_madeup() {
       var linktext= await this.madeup.innerText()
       return linktext
    }

    async click_internalservererror(){
        await this.internalservererror.click()
    }

    async innertext_internalservererror(){
       var linktext= await this.internalservererror.innerText()
       return linktext
    }

    async click_noresponse(){
        await this.noresponse.click()
    }

    async innertext_noresponse(){
       var linktext= await this.noresponse.innerText()
       return linktext
    }

    async click_unauthorized(){
        await this.unauthorized.nth(1).click()
    }

    async innertext_unauthorized(){
        var linktext=await this.unauthorized.nth(1).innerText()
        return linktext
    }

    async click_badrequest(){
        await this.badrequest.click()
    }

    async innertext_badrequest(){
       var linktext= await this.badrequest.innerText()
       return linktext
    }

    async click_gatewaytimeout(){
        await this.gatewaytimeout.click()
    }

    async innertext_gatewaytimeout(){
        var linktext=await this.gatewaytimeout.innerText()
        return linktext
    }

    async click_forbidden(){
        await this.forbidden.click()
    }

    async innertext_forbidden(){
        var linktext=await this.forbidden.innerText()
        return linktext
    }

    async click_managehealth(){
        await this.managehealth.click()
    }

    async innertext_managehealth(){
       var linktext= await this.managehealth.innerText()
       return linktext
    }
}