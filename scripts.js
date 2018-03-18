var deckstrings = require("deckstrings");
var cards = {}

$(function(){
    $.getJSON('https://api.hearthstonejson.com/v1/latest/enUS/cards.json', function(data) {
        console.log(data);
        data.forEach(function(card) {
            cards[card["dbfId"]] = card;
        });
        console.log(cards);
    });
    $("#deckstringForm").submit(function(e){
        e.preventDefault();
        var deck = deckstrings.decode($("#deckstring").val());
        console.log(deck);
        var deckElement = createDeckElement(deck.heroes[0], deck.cards);
        $("#decks")[0].appendChild(deckElement);
    });
});

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