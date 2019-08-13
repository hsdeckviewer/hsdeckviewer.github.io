import fetch from "node-fetch";

const SHORTURLKEY = process.env.SHORTURLKEY;
const SHORTURLAPI = process.env.SHORTURLAPI;

export async function handler(event, context) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log(SHORTURLAPI);
  console.log(event.body);

  const params = event.body;
  const longUrl = JSON.parse(params).longUrl;
  console.log(longUrl);

  return fetch(SHORTURLAPI, {
    headers: {
      "content-type": "application/json",
      "X-API-Key": SHORTURLKEY
    },
    method: "POST",
    body: JSON.stringify({ target: longUrl, reuse: true })
  })
    .then(res => res.json())
    .then(json => ({
      statusCode: 200,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ shortURL: json.shortUrl })
    }));
}
