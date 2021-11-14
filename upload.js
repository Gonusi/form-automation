const puppeteer = require("puppeteer");
const fs = require("fs");

const formURL = "http://localhost:3000/upload";

const raw = fs.readFileSync(`./output/metadata.json`);
let json = JSON.parse(raw);

// TODO analyze Open Sea actual upload page and adjust input names etc.
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  async function submitFormOnce(imageData) {
    await page.goto(formURL);
    const image = imageData[0];

    const elementHandle = await page.$("input[type=file]");
    await elementHandle.uploadFile(image.absolutePath);
    await page.type("#name", image.name);
    await page.type("#description", image.description);
    await page.type("#price", image.price.toString());
    await page.click("#upload");

    page.waitForSelector("#success").then(async () => {
      await page.goto(formURL);
      imageData.shift();
      if (imageData.length <= 0) return;
      submitFormOnce(imageData);
    });
  }

  submitFormOnce(json);
  //   await browser.close();
})();
