const puppeteer = require("puppeteer");
const fs = require("fs");

const imageData = [];

function getRarityData(attributes) {
  console.log("attributes", attributes);
  // attribute shape is
  // {
  //     "trait_type": "background",
  //     "value": "background1"
  //   },
  let totalRarityLvl = 0;
  const rarityData = attributes.map((attr) => {
    const rarityLvl = (parseInt(attr.value.replace(attr.trait_type, "") || '1') - 1);
    console.log(attr.trait_type, attr.value, rarityLvl)
    totalRarityLvl += rarityLvl;
    return { name: attr.trait_type, rarityLvl };
  });
  return {
    lvl: totalRarityLvl,
    data: rarityData,
  };
}

async function loadImages(path) {
  const imageDir = `${path}/images`;
  const jsonDir = `${path}/json`;
  const files = await fs.promises.opendir(`${path}/images`);
  for await (const file of files) {
    let jsonRawData = fs.readFileSync(
      `${jsonDir}/${file.name.split(".")[0]}.json`
    );
    let jsonData = JSON.parse(jsonRawData);
    imageData.push({
      file: `${imageDir}/${file.name}`,
      jsonData,
      rarityData: getRarityData(jsonData.attributes),
    });
  }
  console.log(imageData.map(d => d.rarityData));
  return imageData;
}

const imageData = loadImages("./NFAs").catch(console.error);

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    async function submitFormOnce(imageData) {
        await page.goto('http://localhost:3000');

        const elementHandle = await page.$("input[type=file]");
        await elementHandle.uploadFile(imageData.file);
        await page.type('#name', imageData.jsonData.name);
        await page.type('#description', imageData.jsonData.description);
        await page.type('#price', imageData.rarityData.lvl * 0.2);
        await page.click('#upload');

        page
            .waitForSelector('#success')
            .then(async () => {
                await page.goto('http://localhost:3000/upload');
                imageData.shift();
                if (imageData.length <=0) return;
                submitFormOnce(imageData);
            })
    }

    submitFormOnce(imageData);
    //   await browser.close();
})();
