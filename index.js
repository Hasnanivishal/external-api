var express = require("express");
var app = express();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

app.listen(process.env.PORT || 3000, () => {
 console.log("Server running on port 3000");
});

app.get("/topshow", async (req, res, next) => {
    try {

    const chromeOptions = {
            headless: true,
            defaultViewport: null,
            args: [
                "--incognito",
                "--no-sandbox",
                "--single-process",
                "--no-zygote"
            ],
    };

    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();

    await page.goto('https://www.binged.com/streaming-premiere-dates/mimi-movie-streaming-online-watch-2/');
    const textsArray = await page.evaluate(() => document.querySelector('body').innerHTML);
    let abc = getData(textsArray);
    let finalOutput = [];

    for (let index = 0; index < 20; index++) {
        finalOutput.push({
            name: abc[index].name,
            image: getCorrectImageUrl(abc[index].image)
        })
    }

    console.log(finalOutput);

    await browser.close();

    res.json(finalOutput);

    } catch (error) {
        res.json('error occured.....', error);
    }
});

let getData = html => {
    data = [];
    const $ = cheerio.load(html);
    const htmlData = $('#td-outer-wrap > div.bng-container.c-bng-layout > div.c-bng-layout__sidebar > div.bng-widgets > div.c-bng-list-widget > div.c-bng-list-widget__items > a');
    
    htmlData.each(
       (div, elem) => {
          data.push(
             {
                name: $(elem).find('h3.c-bng-list-widget__title').text(),
                image: $(elem).find('div.c-bng-list-widget__img > img').attr('srcset')
             }
          );
       }
    );
 
    return data;
 }
   
 let getCorrectImageUrl = imgData => {
    let correctImgArr = imgData.split(',');
    let correctImg = '';
    correctImgArr.forEach(element => {
       if (element.includes('186w')) {
          correctImg = element.replace('186w', '').trim();
       }
    });
 
    return correctImg;
 }
 