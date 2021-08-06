var express = require("express");
var app = express();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
    
app.listen(process.env.PORT || 3000, () => {
 console.log("Server running on port 3000");
});

app.get("/topshow", async (req, res, next) => {
    try {
      
   console.log('started....');
    const chromeOptions = await puppeteer.launch({
      headless: true,
      devtools: false,
      ignoreHTTPSErrors: true,
      slowMo: 0,
      args: ["--disable-gpu",
      "--no-sandbox",
      "--no-zygote",
      "--disable-setuid-sandbox",
      "--disable-accelerated-2d-canvas",
      "--disable-dev-shm-usage",
      "--proxy-server='direct://'",
      "--proxy-bypass-list=*"]
  });

    const UA = USER_AGENT;
    const browser = await puppeteer.launch(chromeOptions); 
    const page = await browser.newPage();

    //Randomize viewport size
    await page.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 3000 + Math.floor(Math.random() * 100),
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
   });
   await page.setUserAgent(UA);
    await page.setJavaScriptEnabled(true);
    await page.evaluateOnNewDocument(() => {
      // Pass webdriver check
      Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
      });
   });
   await page.evaluateOnNewDocument(() => {
         // Pass chrome check
         window.chrome = {
            runtime: {},
            // etc.
         };
   });
   await page.evaluateOnNewDocument(() => {
      //pass plugins check
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
              Promise.resolve({ state: Notification.permission }) :
              originalQuery(parameters)
      );
  });

  await page.evaluateOnNewDocument(() => {
      // Overwrite the `plugins` property to use a custom getter.
      Object.defineProperty(navigator, 'plugins', {
          // This just needs to have `length > 0` for the current test,
          // but we could mock the plugins too if necessary.
          get: () => [1, 2, 3, 4, 5],
      });
  });

  await page.evaluateOnNewDocument(() => {
      // Overwrite the `plugins` property to use a custom getter.
      Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
      });
  });



    console.log('calling the website....');
    await page.goto('https://www.binged.com/streaming-premiere-dates/indoo-ki-jawani-hindi-movie-streaming-online-watch/', {
        waitUntil: 'networkidle2',
    });
    console.log('called the website....');
    const textsArray = await page.evaluate(() => document.querySelector('body').innerHTML);
    console.log('textsArray is ready....', textsArray);
    let abc = getData(textsArray);
    console.log('abc is ready....');
    let finalOutput = [];

    if (abc.length == 20) {
        for (let index = 0; index < 20; index++) {
            finalOutput.push({
                name: abc[index].name,
                image: getCorrectImageUrl(abc[index].image)
            });
            console.log('finalOutput for index is done', index);
        }
    
        console.log(finalOutput);
    }
    
    await browser.close();

    return res.send(
        {
           status: 200,
           result: finalOutput
        }
     )

    } catch (error) {
        console.error('Failed to fetch data:', error);

         return res.send(
            {
               status: 500,
               result: error
            }
         )
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
 