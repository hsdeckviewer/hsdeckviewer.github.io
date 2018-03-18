(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.deckstrings = {})));
}(this, (function (exports) { 'use strict';

var encode_1 = encode;

var MSB = 0x80;
var REST = 0x7F;
var MSBALL = ~REST;
var INT = Math.pow(2, 31);

function encode(num, out, offset) {
  out = out || [];
  offset = offset || 0;
  var oldOffset = offset;

  while(num >= INT) {
    out[offset++] = (num & 0xFF) | MSB;
    num /= 128;
  }
  while(num & MSBALL) {
    out[offset++] = (num & 0xFF) | MSB;
    num >>>= 7;
  }
  out[offset] = num | 0;
  
  encode.bytes = offset - oldOffset + 1;
  
  return out
}

var decode = read;

var MSB$1 = 0x80;
var REST$1 = 0x7F;

function read(buf, offset) {
  var res    = 0
    , offset = offset || 0
    , shift  = 0
    , counter = offset
    , b
    , l = buf.length;

  do {
    if (counter >= l) {
      read.bytes = 0;
      throw new RangeError('Could not decode varint')
    }
    b = buf[counter++];
    res += shift < 28
      ? (b & REST$1) << shift
      : (b & REST$1) * Math.pow(2, shift);
    shift += 7;
  } while (b >= MSB$1)

  read.bytes = counter - offset;

  return res
}

var N1 = Math.pow(2,  7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);

var length = function (value) {
  return (
    value < N1 ? 1
  : value < N2 ? 2
  : value < N3 ? 3
  : value < N4 ? 4
  : value < N5 ? 5
  : value < N6 ? 6
  : value < N7 ? 7
  : value < N8 ? 8
  : value < N9 ? 9
  :              10
  )
};

var varint = {
    encode: encode_1
  , decode: decode
  , encodingLength: length
};

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/** @internal */
function atob_binary(encoded) {
    return atob(encoded);
}
/** @internal */
function btoa_binary(decoded) {
    return btoa(decoded);
}

/** @internal */
var Iterator = /** @class */ (function () {
    function Iterator() {
        this.index = 0;
    }
    Iterator.prototype.next = function (repeat) {
        if (repeat === void 0) { repeat = 1; }
        this.index += repeat;
    };
    return Iterator;
}());
/** @internal */
var BufferWriter = /** @class */ (function (_super) {
    __extends(BufferWriter, _super);
    function BufferWriter() {
        var _this = _super.call(this) || this;
        _this.buffer = [];
        return _this;
    }
    BufferWriter.prototype.null = function () {
        this.buffer[this.index] = 0;
        this.next();
    };
    BufferWriter.prototype.varint = function (value) {
        varint.encode(value, this.buffer, this.index);
        this.next(varint.encode.bytes);
    };
    BufferWriter.prototype.toString = function () {
        var binary = String.fromCharCode.apply(String, this.buffer);
        return btoa_binary(binary);
    };
    return BufferWriter;
}(Iterator));
/** @internal */
var BufferReader = /** @class */ (function (_super) {
    __extends(BufferReader, _super);
    function BufferReader(string) {
        var _this = _super.call(this) || this;
        var binary = atob_binary(string);
        var buffer = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) {
            buffer[i] = binary.charCodeAt(i);
        }
        _this.buffer = buffer;
        return _this;
    }
    BufferReader.prototype.nextByte = function () {
        var value = this.buffer[this.index];
        this.next();
        return value;
    };
    BufferReader.prototype.nextVarint = function () {
        var value = varint.decode(this.buffer, this.index);
        this.next(varint.decode.bytes);
        return value;
    };
    return BufferReader;
}(Iterator));

var DECKSTRING_VERSION = 1;
function verifyDbfId(id, name) {
    name = name ? name : "dbf id";
    if (!isPositiveNaturalNumber(id)) {
        throw new Error("Invalid " + name + " " + id + " (expected valid dbf id)");
    }
}
function isPositiveNaturalNumber(n) {
    if (typeof n !== "number" || !isFinite(n)) {
        return false;
    }
    if (Math.floor(n) !== n) {
        return false;
    }
    return n > 0;
}
function sorted_cards(cards) {
    return cards.sort(function (a, b) { return (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0); });
}
function trisort_cards(cards) {
    var single = [], double = [], n = [];
    for (var _i = 0, cards_1 = cards; _i < cards_1.length; _i++) {
        var tuple = cards_1[_i];
        var list = void 0;
        var card = tuple[0], count = tuple[1];
        verifyDbfId(card, "card");
        if (count === 0) {
            continue;
        }
        if (count === 1) {
            list = single;
        }
        else if (count === 2) {
            list = double;
        }
        else if (isPositiveNaturalNumber(count)) {
            list = n;
        }
        else {
            throw new Error("Invalid count " + count + " (expected positive natural number)");
        }
        list.push(tuple);
    }
    return [single, double, n];
}
function encode$1(deck) {
    if (typeof deck !== "object" ||
        (deck.format !== 1 && deck.format !== 2) ||
        !Array.isArray(deck.heroes) ||
        !Array.isArray(deck.cards)) {
        throw new Error("Invalid deck definition");
    }
    var writer = new BufferWriter();
    var format = deck.format;
    var heroes = deck.heroes.slice().sort();
    var cards = sorted_cards(deck.cards.slice());
    writer.null();
    writer.varint(DECKSTRING_VERSION);
    writer.varint(format);
    writer.varint(heroes.length);
    for (var _i = 0, heroes_1 = heroes; _i < heroes_1.length; _i++) {
        var hero = heroes_1[_i];
        verifyDbfId(hero, "hero");
        writer.varint(hero);
    }
    for (var _a = 0, _b = trisort_cards(cards); _a < _b.length; _a++) {
        var list = _b[_a];
        writer.varint(list.length);
        for (var _c = 0, list_1 = list; _c < list_1.length; _c++) {
            var tuple = list_1[_c];
            var card = tuple[0], count = tuple[1];
            writer.varint(card);
            if (count !== 1 && count !== 2) {
                writer.varint(count);
            }
        }
    }
    return writer.toString();
}
function decode$2(deckstring) {
    var reader = new BufferReader(deckstring);
    if (reader.nextByte() !== 0) {
        throw new Error("Invalid deckstring");
    }
    var version = reader.nextVarint();
    if (version !== DECKSTRING_VERSION) {
        throw new Error("Unsupported deckstring version " + version);
    }
    var format = reader.nextVarint();
    if (format !== 1 && format !== 2) {
        throw new Error("Unsupported format " + format + " in deckstring");
    }
    var heroes = new Array(reader.nextVarint());
    for (var i = 0; i < heroes.length; i++) {
        heroes[i] = reader.nextVarint();
    }
    heroes.sort();
    var cards = [];
    for (var i = 1; i <= 3; i++) {
        for (var j = 0, c = reader.nextVarint(); j < c; j++) {
            cards.push([
                reader.nextVarint(),
                i === 1 || i === 2 ? i : reader.nextVarint(),
            ]);
        }
    }
    sorted_cards(cards);
    return {
        cards: cards,
        heroes: heroes,
        format: format,
    };
}

exports.encode = encode$1;
exports.decode = decode$2;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],2:[function(require,module,exports){
var deckstrings = require("deckstrings");
var cards = {}
var deckstringList = [];

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
},{"deckstrings":1}]},{},[2]);
