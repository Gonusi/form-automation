const fs = require("fs");
const path = require("path");

// 0. setup
const inputDir = "./input";
const pricePerRarityUnit = 0.2;

// 1.  file _metadata.json contains info about all generated images,
// including what combination of items was used.
const raw = fs.readFileSync(`${inputDir}/json/_metadata.json`);
let json = JSON.parse(raw);

// 2. add absolute file path so that we can later automatically upload the file
json = json.map((item) => {
  const absolutePath = path.resolve(`./input/images/${item.filename}`);
  return { ...item, absolutePath };
});

// 3. extract rarity data by adding all the item rarity levels. For example:
// background0, body0, hat0, clothes0 == 0
// background1, body0, hat0, clothes0 == 1
// background1, body1, hat1, clothes1 == 4
// background3, body1, hat3, clothes3 == 10
json = json.map((item) => {
  const totalRarity = item.attributes.reduce((acc, curr, i) => {
    return acc + Number(curr.value.split("_")[1]);
  }, 0);
  return { ...item, totalRarity };
});

// 4. calculate price (later we can manually update it in the file if needed).
// formula is: totalRarity * pricePerRarityUnit
// examples:
// if totalRarity == 3
// and pricePerRarityUnit == 0.2
// then price = 3 * 0.2 == 0.6
json = json.map((item) => {
  const price = Number((item.totalRarity * pricePerRarityUnit).toPrecision(4));
  return { ...item, price };
});

// 4. write updated data to ../output/metadata.json
const data = JSON.stringify(json);
fs.writeFileSync("./output/metadata.json", data);

console.log(json);
