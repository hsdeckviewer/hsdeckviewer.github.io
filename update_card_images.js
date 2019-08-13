const request = require("request-promise-native");
const fs = require("fs");
const crypto = require("crypto");

const TILE_API = "https://art.hearthstonejson.com/v1/tiles/";
const CARD_IMAGE_JSON_URL =
  "https://raw.githubusercontent.com/schmich/hearthstone-card-images/master/manifest/en_US.json";
const CARDS_JSON_URL =
  "https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json";
const tile_output_folder = "public/images/tiles/";
const card_output_folder = "public/images/cards/";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function tryDownload(image, destPath, destFile) {
  return new Promise(function(resolve, reject) {
    request(image)
      .pipe(fs.createWriteStream(destPath + destFile))
      .on("finish", () => {
        console.log("finsihed downloading");
        resolve();
      });
  });
}

function checkHash(card_dest, value) {
  return new Promise(function(resolve, reject) {
    fs.createReadStream(card_dest)
      .pipe(crypto.createHash("sha1").setEncoding("base64"))
      .on("finish", function() {
        let hash = this.read();
        if (hash.substring(0, 5) !== value) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
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
  if (!fs.existsSync(card_output_folder)) {
    fs.mkdirSync(card_output_folder, { recursive: true });
    fs.mkdirSync(tile_output_folder, { recursive: true });
  }

  // download card tiles
  console.log("Fetching cards...");
  let cards = await downloadJson(CARDS_JSON_URL);

  console.log("Downloading card tiles...");
  for (let card of cards) {
    console.log(card);
    let card_dest = card.id + ".png";
    if (!fs.existsSync(tile_output_folder + card_dest)) {
      console.log(card_dest);
      let card_tile = TILE_API + card.id + ".png";
      await tryDownload(card_tile, tile_output_folder, card_dest);
    }
  }

  console.log("Getting manifest...");
  // download card images
  let cardImages = await downloadJson(CARD_IMAGE_JSON_URL);

  const locale = cardImages.config.locale;
  const base = cardImages.config.base + "/master/cards";
  for (let [key, value] of Object.entries(cardImages.cards)) {
    let card_dest = key + ".png";
    if (fs.existsSync(card_output_folder + card_dest)) {
      console.log("Checking hash...");
      // check if hash is the same
      if (!(await checkHash(card_output_folder + card_dest, value))) {
        console.log("No hash match. Download card...");
        let card_image = [base, locale, key + ".png"].join("/");
        await tryDownload(card_image, card_output_folder, card_dest);
      }
    } else {
      // download the card
      let card_image = [base, locale, key + ".png"].join("/");
      await tryDownload(card_image, card_output_folder, card_dest);
    }
  }
}

downloadImages();
