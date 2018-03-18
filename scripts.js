var deckstrings = require("deckstrings");
var cards = {}
var deckstringList = [];

$(function(){
    $.getJSON('https://api.hearthstonejson.com/v1/latest/enUS/cards.json', function(data) {
        console.log(data);
        data.forEach(function(card) {
            cards[card["dbfId"]] = card;
        });
        console.log(cards);
    });

    var urlParams = new URLSearchParams(window.location.search);
    var decks = urlParams.getAll('deckstring');
    decks.forEach(function(deck) {
        createDeckFromString(decodeUriComponent(deck));
    });

    $("#deckstringForm").submit(function(e){
        e.preventDefault();
        var deckstring = $("#deckstring").val().split(/\s+/);
        deckstring.forEach(function(deck){
            createDeckFromString(deck);
        });
    });
});

function updateURL() {
    history.replaceState({},"","/?deckstring=" + deckstringList.join("&deckstring="));
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