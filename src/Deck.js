import React from "react";

const Deck = ({ deck, onRemoveDeck }) => {
  return (
    <div className={"deck " + deck.hero}>
      <div class="deck-title">ROGUE</div>
      <div class="deck-cards">{}</div>
      <div class="deck-buttons">
        <button
          class="btn btn-outline-dark btn-sm btn-block"
          data-clipboard-text={deck.deckstring}
          data-toggle="tooltip"
          title=""
          data-original-title="Copied!"
        >
          Copy Deck Code
        </button>
        <button class="btn btn-outline-dark btn-sm btn-block">
          Remove Deck
        </button>
      </div>
    </div>
  );
};

export default Deck;
