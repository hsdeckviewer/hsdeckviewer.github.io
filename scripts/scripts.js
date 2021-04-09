var deckstrings = require("deckstrings");
var cards = {};
var deckstringList = [];
var CARD_TILE_API = "/images/tiles/";
var clipboard;

$(function() {
  clipboard = new ClipboardJS(".btn");

  $.getJSON(
    "https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json",
    function(data) {
      data.forEach(function(card) {
        cards[card["dbfId"]] = card;
      });

      var urlParams = new URLSearchParams(window.location.search);
      var decks = urlParams.getAll("deckstring");
      decks.forEach(function(deck) {
        createDeckFromString(decodeURIComponent(deck));
      });
    }
  );

  $("#copyButton").tooltip({
    title: "Copied",
    trigger: "click"
  });
  $("#copyButton").on("mouseout", function() {
    $(this).tooltip("hide");
  });

  $("#removeButton").click(function(e) {
    $(".deck").remove();
    deckstringList = [];
    update();
  });

  $("#addButton").click(function() {
    var deckText = window.clip;
  });

  $("#urlButton").click(function() {
    $("#urlButton").prop("disabled", true);
    $.ajax({
      url: "/.netlify/functions/shorturl",
      type: "POST",
      data: JSON.stringify({ longUrl: location.href }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(result) {
        $("#urlInput").val(result.shortURL);
        $("#urlButton").prop("disabled", false);
      }
    });
  });

  $("#addButton").on("click", addInputedDecks);

  $("#deckstring").on("change", e => {
    $("#addButton").prop("disabled", $("#deckstring").val() == "");
  });
  
  $("#deckstring").on("input", e => {
    $("#addButton").prop("disabled", $("#deckstring").val() == "");
  });

  $("#deckstring").on("keyup", function(e) {
    $("#addButton").prop("disabled", $("#deckstring").val() == "");
    if (e.keyCode === KeyboardEvent.DOM_VK_RETURN) {
      addInputedDecks();
      $("#addButton").prop("disabled", true);
    }
  });
});

function parseDeckcodeFromString(deckstring) {
  var strings = deckstring.split("#");
  return strings[strings.length - 3].trim();
}

function addInputedDecks() {
  const input = $("#deckstring").val();
  if (
    input.indexOf("deck in Hearthstone") != -1
  ) {
    var deckcode = input.split(" ").sort((a,b) => b.length - a.length)[0].trim();
    var title = input.split("#").filter(str => str != '')[0].trim();
    createDeckFromString(deckcode, title);
  } else {
    var deckstring = input.split(/,\s*|\s+/);
    deckstring.forEach(function(deck) {
      createDeckFromString(deck);
    });
  }
  
  $("#deckstring").val("");
}

function update() {
  updateURL();
  updateButtonStates();
}

function updateURL() {
  var updatedURL = "/";
  if (deckstringList.length > 0) {
    updatedURL = "/?deckstring=" + deckstringList.join("&deckstring=");
  }
  history.replaceState({}, "", updatedURL);
}

function updateButtonStates() {
  var isDisabled = deckstringList.length == 0;
  $("#removeButton").prop("disabled", isDisabled);
  $("#urlButton").prop("disabled", isDisabled);
  $("#copyButton").prop("disabled", isDisabled);
  if (isDisabled) {
    $("#shortURLForm").addClass("d-none");
    $("#removeButtonContainer").addClass("d-none");
  } else {
    $("#shortURLForm").removeClass("d-none");
    $("#removeButtonContainer").removeClass("d-none");
  }
}

function createDeckFromString(deckstring, title = null) {
  var deck = deckstrings.decode(deckstring);
  deckstringList.push(encodeURIComponent(deckstring));
  var deckElement = createDeckElement(deck.heroes[0], deck.cards, deckstring, title);
  $("#decks")[0].appendChild(deckElement);
  update();
}

function createDeckElement(hero, cardlist, deckstring, title) {
  var deckContainer = document.createElement("div");
  deckContainer.classList.add(cards[hero].cardClass.toLowerCase());
  deckContainer.classList.add("deck");

  var titleContainer = document.createElement("div");
  titleContainer.classList.add("deck-title");
  var deckTitle = title;
  if (deckTitle == null) {
    deckTitle = cards[hero].cardClass
  }
  titleContainer.appendChild(document.createTextNode(deckTitle));

  var buttonContainer = document.createElement("div");
  buttonContainer.classList.add("deck-buttons");

  var copyButton = document.createElement("button");
  copyButton.classList.add("btn");
  copyButton.classList.add("btn-outline-dark");
  copyButton.classList.add("btn-sm");
  copyButton.classList.add("btn-block");
  copyButton.setAttribute("data-clipboard-text", deckstring);
  copyButton.setAttribute("data-toggle", "tooltip");
  copyButton.setAttribute("title", "Copied!");
  copyButton.appendChild(document.createTextNode("Copy Deck Code"));
  $(copyButton).tooltip({
    title: "Copied",
    trigger: "click"
  });
  copyButton.addEventListener("mouseout", function() {
    $(copyButton).tooltip("hide");
  });
  var clipboard = new ClipboardJS(copyButton);

  var removeButton = document.createElement("button");
  removeButton.classList.add("btn");
  removeButton.classList.add("btn-outline-dark");
  removeButton.classList.add("btn-sm");
  removeButton.classList.add("btn-block");
  removeButton.appendChild(document.createTextNode("Remove Deck"));
  removeButton.addEventListener("click", function() {
    deckContainer.parentNode.removeChild(deckContainer);
    deckstringList.splice(
      deckstringList.indexOf(encodeURIComponent(deckstring)),
      1
    );
    update();
  });

  buttonContainer.appendChild(copyButton);
  buttonContainer.appendChild(removeButton);

  var cardsContainer = document.createElement("div");
  cardsContainer.classList.add("deck-cards");

  cardlist.sort(function(a, b) {
    var cardA = cards[a[0]];
    var cardB = cards[b[0]];
    var costCompare = cardA.cost - cardB.cost;
    if (costCompare == 0) {
      return cardA.name.localeCompare(cardB.name);
    }
    return costCompare;
  });
  cardlist.forEach(function(card) {
    var cardContainer = document.createElement("div");
    var cardTileURL = CARD_TILE_API + cards[card[0]].id + ".png";
    cardContainer.setAttribute(
      "style",
      "background-image: url('" + cardTileURL + "');"
    );
    cardContainer.classList.add("hs-card");
    cardContainer.setAttribute("data-toggle", "tooltip");
    cardContainer.setAttribute(
      "title",
      "<img src='images/cards/" + cards[card[0]].id + ".png'>"
    );
    $(cardContainer).tooltip({
      html: true,
      placement: "right",
      boundary: "viewport",
      animation: false,
      template:
        '<div class="tooltip card-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner card-container"></div></div>'
    });

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
  deckContainer.appendChild(buttonContainer);
  return deckContainer;
}
