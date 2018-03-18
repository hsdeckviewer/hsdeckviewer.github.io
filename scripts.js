var deckstrings = require("deckstrings");
var cards = {}
var deckstringList = [];
var URL_SHORTENER_KEY = "AIzaSyA7Z4uvsIz_m6k4Uu4kT-DdutJim76Lxzg";

$(function(){
    $.getJSON('https://api.hearthstonejson.com/v1/latest/enUS/cards.json', function(data) {
        data.forEach(function(card) {
            cards[card["dbfId"]] = card;
        });

        var urlParams = new URLSearchParams(window.location.search);
        var decks = urlParams.getAll('deckstring');
        decks.forEach(function(deck) {
            createDeckFromString(decodeURIComponent(deck));
        });
    });

    $("#urlShortenerForm").submit(function(e){
        e.preventDefault();
        $.post("https://www.googleapis.com/urlshortener/v1/url/?key=" + URL_SHORTENER_KEY, {"longURL": location.href}, function(data){
            $("#urlInput").val(data.id);
        }, "json")
    });

    $("#deckstringForm").submit(function(e){
        e.preventDefault();
        var deckstring = $("#deckstring").val().split(/\s+/);
        deckstring.forEach(function(deck){
            createDeckFromString(deck);
        });
        $("#deckstring").val("");
    });
});

function updateURL() {
    var updatedURL = "/?deckstring=" + deckstringList.join("&deckstring=");
    history.replaceState({},"", updatedURL);
}

function createDeckFromString(deckstring) {
    var deck = deckstrings.decode(deckstring);
    deckstringList.push(encodeURIComponent(deckstring));
    var deckElement = createDeckElement(deck.heroes[0], deck.cards);
    $("#decks")[0].appendChild(deckElement);
    updateURL();
}

function createDeckElement(hero, cardlist) {
    var deckContainer = document.createElement("div");
    deckContainer.classList.add("deck");

    var titleContainer = document.createElement("div");
    titleContainer.classList.add("deck-title");
    titleContainer.appendChild(document.createTextNode(cards[hero].cardClass + " Deck"))
    
    var cardsContainer = document.createElement("div");
    cardsContainer.classList.add("deck-cards");

    cardlist.sort(function(a,b){
        var cardA = cards[a[0]];
        var cardB = cards[b[0]];
        var costCompare = cardA.cost - cardB.cost;
        if (costCompare == 0) {
            return cardA.name.localeCompare(cardB.name);
        }
        return costCompare
    });
    cardlist.forEach(function(card) {
        var cardContainer = document.createElement("div");
        cardContainer.classList.add("hs-card");

        var cardCost = document.createElement("div");
        cardCost.appendChild(document.createTextNode(cards[card[0]].cost));
        cardCost.classList.add("card-cost");

        var cardText = document.createElement("div");
        cardText.appendChild(document.createTextNode(cards[card[0]].name));
        cardText.classList.add("card-text");

        var numCards = document.createElement("div");
        numCards.appendChild(document.createTextNode(card[1]));
        numCards.classList.add("card-number");

        cardContainer.appendChild(cardCost);
        cardContainer.appendChild(cardText);
        cardContainer.appendChild(numCards);
        cardsContainer.appendChild(cardContainer);
    });
    deckContainer.appendChild(titleContainer);
    deckContainer.appendChild(cardsContainer);
    return deckContainer;
}