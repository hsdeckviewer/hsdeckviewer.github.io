const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;
const SHORTURLKEY = process.env.SHORTURLKEY;
const SHORTURLAPI = "https://kutt.it/api/url/submit";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/shorturl', (req, res) => {
    let longURL = req.body.longUrl;
    request
        .post({
            url: SHORTURLAPI,
            headers: {
                'X-API-Key': SHORTURLKEY
            },
            json: true,
            form: {
                target: longURL,
                reuse: true
            }
        }, (error, response, body) => {
            res.json(JSON.stringify({
                'shortURL': body.shortUrl
            }));
        });
});

app.listen(port, () => console.log(`HSDeckViewer listening on port ${port}`));