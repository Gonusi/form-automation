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
    const rarityLvl = parseInt(attr.value.replace(attr.trait_type, "") || '0');
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
}

loadImages("./NFAs").catch(console.error);

// (async () => {
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();

//     async function submitFormOnce() {
//         await page.goto('http://localhost:3000');

//         await page.type('#name', 'Pavadinimas 1');
//         await page.type('#description', 'Aprasymas 1');
//         await page.click('#upload');

//         page
//             .waitForSelector('#success')
//             .then(async () => {
//                 await page.goto('http://localhost:3000/upload');
//                 iterations++;
//                 if (iterations > 5) return;
//                 submitFormOnce();
//             })
//     }

//     submitFormOnce();
//     //   await browser.close();
// })();
