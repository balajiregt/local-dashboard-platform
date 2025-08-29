import { test, expect } from '@playwright/test';
import { productScreen } from '../Pages/products.page.ts';
import { loginScreen } from '../Pages/prelogin.home.page.js';
const testdata1 = require('../Testdata/standarduser.json')
const testdata2 = require('../Testdata/locked_user.json')
const testdata3 = require('../Testdata/problemuser.json')
const testdata4 = require('../Testdata/performanceuser.json')

test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
});

test.only('@e2e test1- successful login as a standard user- log out', async ({ page }) => {
    const sigInScreen = new loginScreen(page)
    await sigInScreen.type_username('standard_user')
    await sigInScreen.type_password('secret_sauce')
    await sigInScreen.click_submit()

    const productpage = new productScreen(page)
    await productpage.assert_pagetitle() //assert the products screen page title
    await productpage.actions_logout()
})

test.only('test2- successful login as a performance glitch user', async ({ page }) => {
    test.setTimeout(100000);
    const sigInScreen = new loginScreen(page)
    await sigInScreen.username_freetextField('performance_glitch_user')
    await sigInScreen.password_freetextField('secret_sauce')
    await sigInScreen.click_submit()

    const productpage = new productScreen(page)
    await productpage.assert_pagetitle()  //assert the products screen page title
    await productpage.actions_logout()
})


