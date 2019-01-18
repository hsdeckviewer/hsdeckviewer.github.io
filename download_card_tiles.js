let request = require('request');
let fs = require('fs');

const TILE_API = "https://art.hearthstonejson.com/v1/tiles/"
const CARDS_JSON_URL = "https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json"
const tile_output_folder = "public/images/tiles/"

let timeout = 100;

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