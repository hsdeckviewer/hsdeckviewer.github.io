import React from "react";

const DeckStringForm = () => {
  return (
    <div id="deckstringForm">
      <div className="input-group">
        <input
          id="deckstring"
          name="deckstring"
          type="text"
          className="form-control"
          placeholder="Input deck code(s) here"
        />
        <div className="input-group-append">
          <button
            disabled
            id="addButton"
            className="btn btn-outline-light"
            data-clipboard-target="#urlInput"
          >
            Add Deck(s)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckStringForm;
