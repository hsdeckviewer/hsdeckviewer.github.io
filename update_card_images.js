const request = require("request-promise-native");
const fs = require("fs");

const TILE_API = "https://art.hearthstonejson.com/v1/tiles/";
const CARD_RENDER_API =
  "https://art.hearthstonejson.com/v1/render/latest/enUS/256x/";
const CARDS_JSON_URL =
  "https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json";
const tile_output_folder = "docs/images/tiles/";
const card_output_folder = "docs/images/cards/";

const BASE_CARDS_JSON = "./base_image_version.json";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function tryDownload(image, destPath, destFile) {
  return new Promise(function(resolve, reject) {
    try {
      request(image)
        .pipe(fs.createWriteStream(destPath + destFile))
        .on("finish", () => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    } catch (e) {
      resolve(false);
    }
  });
}

function downloadJson(uri) {
  return new Promise(function(resolve, reject) {
    request({
      uri: uri,
      json: true
    }).then(body => {
      console.log("Resolving json request...");
      resolve(body);
    });
  });
}

async function downloadImages() {
  let firstDownload = false;
  if (!fs.existsSync(card_output_folder)) {
    firstDownload = true;
    fs.mkdirSync(card_output_folder, { recursive: true });
    fs.mkdirSync(tile_output_folder, { recursive: true });
  }

  // download card tiles
  console.log("Fetching cards...");
  let cards = await downloadJson(CARDS_JSON_URL);

  if (!firstDownload) {
    console.log("Finding new or updated cards...");
    const base_cards_dict = {};
    let base_cards = JSON.parse(fs.readFileSync(BASE_CARDS_JSON, "utf8"));
    console.log("Updating base cards json...");
    fs.writeFileSync(BASE_CARDS_JSON, JSON.stringify(cards), "utf8");
    base_cards.forEach(card => (base_cards_dict[card.id] = card));
    cards = cards.filter(
      card =>
        base_cards_dict[card.id] == null ||
        JSON.stringify(base_cards_dict[card.id]) != JSON.stringify(card)
    );
    console.log(cards.map(card => card.id));
  }

  console.log("Downloading card images...");
  for (let card of cards) {
    let card_dest = card.id + ".png";
    console.log(card_dest);
    let card_tile = TILE_API + card_dest;
    for (let i = 0; i < 3; i++) {
      let success = await tryDownload(card_tile, tile_output_folder, card_dest);
      if (success) {
        break;
      }
      await sleep((2 << i) * 100);
    }

    let card_image = CARD_RENDER_API + card_dest;
    for (let i = 0; i < 3; i++) {
      let success = await tryDownload(
        card_image,
        card_output_folder,
        card_dest
      );
      if (success) {
        break;
      }
      await sleep((2 << i) * 100);
    }
  }
}

downloadImages();
