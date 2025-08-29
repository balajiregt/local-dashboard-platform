import { expect, Locator, Page } from '@playwright/test'

export class productScreen {
    readonly page: Page;
    readonly pagetitle: Locator;
    readonly menuicon: Locator;
    readonly logout: Locator

    constructor(page: Page) {
        this.page = page;
        this.pagetitle = page.locator('.title')
        this.menuicon = page.locator('#react-burger-menu-btn')
        this.logout = page.locator('#logout_sidebar_link')
    }

    async assert_pagetitle() {
        await expect(this.pagetitle).toHaveText('Products')
    }

    async leftsideMenuIcon() {
        await this.menuicon.click()
    }

    async logout_button() {
        await this.logout.click()
    }

    async actions_logout() {
        await this.menuicon.click()
        await this.logout.click()
    }
}