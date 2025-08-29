import { expect, Locator, Page } from '@playwright/test';
export class loginScreen {
    readonly page: Page;
    readonly username: Locator;
    readonly password: Locator;
    readonly submit: Locator

    constructor(page: Page) {
        this.page = page;
        this.username = page.locator('#user-name')
        this.password = page.locator('#password')
        this.submit = page.locator('#login-button')
    }

    async type_username(username: string) {
        await this.username.fill(username)
    }

    async type_password(password: string) {
        await this.password.fill(password)
    }
    async click_submit() {
        await this.submit.click()
    }


}