const request = require('request');
const fs = require('fs');
const crypto = require('crypto');

const TILE_API = "https://art.hearthstonejson.com/v1/tiles/"
const CARD_IMAGE_JSON_URL = "https://raw.githubusercontent.com/schmich/hearthstone-card-images/master/images.json"
const CARDS_JSON_URL = "https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json"
const tile_output_folder = "public/images/tiles/"
const card_output_folder = "public/images/cards/"

let timeout = 100;

// download card tiles
request({
    url: CARDS_JSON_URL,
    json: true
}, function (error, response, body) {
    for (let card of body) {
        let card_dest = tile_output_folder + card.id + ".png";
        if (!fs.existsSync(card_dest)) {
            setTimeout(() => {
                console.log(card_dest);
                let card_tile = TILE_API + card.id + ".png";
                request(card_tile).pipe(fs.createWriteStream(card_dest));
                timeout += 50;
            }, timeout);
        }
    }
});

// download card images
request({
    url: CARD_IMAGE_JSON_URL,
    json: true
}, (err, res, body) => {
    const version = body.config.version;
    const base = body.config.base;
    Object.entries(body.cards.rel).forEach(([key, value]) => {
        let card_dest = card_output_folder + key + ".png";
        if (fs.existsSync(card_dest)) {
            // check if hash is the same
            fs.createReadStream(card_dest).
                pipe(crypto.createHash('sha1').setEncoding('base64')).
                on('finish', function () {
                    let hash = this.read();
                    if (hash.substring(0,5) !== value) {
                        console.log(hash + " - " + value);
                        // download the card
                        setTimeout(() => {
                            console.log(card_dest);
                            let card_image = [base, version, "rel", key + ".png"].join("/");
                            request(card_image).pipe(fs.createWriteStream(card_dest));
                            timeout += 50;
                        }, timeout);
                    }
                });
        } else {
            // download the card
            setTimeout(() => {
                console.log(card_dest);
                let card_image = [base, version, "rel", key + ".png"].join("/");
                request(card_image).pipe(fs.createWriteStream(card_dest));
                timeout += 50;
            }, timeout);
        }
    });
});