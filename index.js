var express = require("express");
var app = express();
const puppeteer = require('puppeteer');

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

app.get("/topshow", async (req, res, next) => {
    try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://scrapethissite.com/pages/forms/');
    const textsArray = await page.evaluate(
        () => [...document.querySelectorAll(
            '#hockey > div > table > tbody > tr > td.name')]
            .map(elem => elem.innerText)
    );
    const WinArray = await page.evaluate(
        () => [...document.querySelectorAll(
            '#hockey > div > table > tbody > tr > td.wins')]
            .map(elem => elem.innerText)
    );
    var result = {};
    textsArray.forEach((textsArray, i) =>
        result[textsArray] = WinArray[i]);
    console.log(result);

    await browser.close();

    res.json(result);
    } catch (error) {
        res.json('error occured..');
    }
});
   