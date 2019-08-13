import React from "react";
import id from "uuid/v4";
import Decks from "./Decks";
import DeckStringForm from "./DeckStringForm";
import ShortURLForm from "./ShortURLForm";
import RemoveButton from "./RemoveButton";

const App = () => {
  const [decks, setDecks] = React.useState([]);

  const addDeck = deck => {
    deck.id = id();
    setDecks([deck, ...decks]);
  };

  const removeDeck = id => {
    setDecks(decks.filter(deck => deck.id !== id));
  };

  const removeAllDecks = () => {
    setDecks([]);
  };

  return (
    <div>
      <div id="header-section">
        <div>
          <div className="container title-container">
            <h1>Hearthstone Deck Viewer</h1>
          </div>
        </div>
        <DeckStringForm addDeck={addDeck} />
        <small className="form-text text-muted mb-2">
          Separate multiple deck codes with whitespace or commas. Individual
          deck strings copied from the game client are also supported.
        </small>
        <ShortURLForm />
        <RemoveButton removeAllDecks={removeAllDecks} />
      </div>
      <Decks decks={decks} onRemoveDeck={removeDeck} />
    </div>
  );
};

export default App;
