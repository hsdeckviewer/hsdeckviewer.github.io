const request = require("request-promise-native");
const fs = require("fs");

const TILE_API = "https://art.hearthstonejson.com/v1/tiles/";
const CARD_RENDER_API =
  "https://art.hearthstonejson.com/v1/render/latest/enUS/256x/";
const CARDS_JSON_URL =
  "https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json";
const tile_output_folder = "public/images/tiles/";
const card_output_folder = "public/images/cards/";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function tryDownload(image, destPath, destFile) {
  return new Promise(function(resolve, reject) {
    try {
      request(image)
        .pipe(fs.createWriteStream(destPath + destFile))
        .on("finish", () => {
          console.log("finished downloading");
          resolve(true);
        });
    } catch (e) {
      console.log("failed downloading");
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
  if (!fs.existsSync(card_output_folder)) {
    fs.mkdirSync(card_output_folder, { recursive: true });
    fs.mkdirSync(tile_output_folder, { recursive: true });
  }

  // download card tiles
  console.log("Fetching cards...");
  let cards = await downloadJson(CARDS_JSON_URL);

  console.log("Downloading card images...");
  for (let card of cards) {
    console.log(card);
    let card_dest = card.id + ".png";
    if (!fs.existsSync(tile_output_folder + card_dest)) {
      console.log(card_dest);
      let card_tile = TILE_API + card_dest;
      for (let i = 0; i < 3; i++) {
        let success = await tryDownload(
          card_tile,
          tile_output_folder,
          card_dest
        );
        if (success) {
          break;
        }
        await sleep(500);
      }
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
      await sleep(500);
    }
  }
}

downloadImages();
