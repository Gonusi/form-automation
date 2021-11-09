const puppeteer = require('puppeteer');
let iterations = 0;

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    async function submitFormOnce() {
        await page.goto('http://localhost:3000');

        await page.type('#name', 'Pavadinimas 1');
        await page.type('#description', 'Aprasymas 1');
        await page.click('#upload');

        page
            .waitForSelector('#success')
            .then(async () => {
                await page.goto('http://localhost:3000/upload');
                iterations++;
                if (iterations > 5) return;
                submitFormOnce();
            })
    }

    submitFormOnce();
    //   await browser.close();
})();