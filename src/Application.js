const Application = () => {
  return (
    <div>
      <div id="header-section">
        <div>
            <div className="container title-container">
                <h1>Hearthstone Deck Viewer</h1>
            </div>
        </div>
        <div id="deckstringForm">
            <div className="input-group">
                <input id="deckstring" name="deckstring" type="text" className="form-control" placeholder="Input deck code(s) here"/>
                <div className="input-group-append">
                    <button disabled id="addButton" className="btn btn-outline-light" data-clipboard-target="#urlInput">Add Deck(s)</button>
                </div>
            </div>
        </div>
        <small className="form-text text-muted mb-2">
            Separate multiple deck codes with whitespace or commas. Individual deck strings copied from the game client are also supported.
        </small>
        <div id="shortURLForm" className="d-none">
            <div className="input-group mx-auto" id="shortURLGroup">
                <div className="input-group-prepend">
                    <button disabled id="urlButton" className="btn btn-outline-light">Generate Short URL</button>
                </div>
                <input id="urlInput" readonly className="form-control" type="text" name="url"/>
                <div className="input-group-append">
                    <button disabled id="copyButton" className="btn btn-outline-light" data-clipboard-target="#urlInput">
                        <img className="clippy" src="images/clippy.svg" alt="Copy to clipboard" width="13"/>
                    </button>
                </div>
            </div>
        </div>
        <div id="removeButtonContainer" className="d-none">
            <div className="container">
                <button disabled className="btn btn-outline-light" id="removeButton">Remove All Decks</button>
            </div>
        </div>
      </div>
      <Decks decks={} />
    </div>
  );
}

export default Application;