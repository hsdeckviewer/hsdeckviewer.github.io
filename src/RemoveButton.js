import React from "react";

const RemoveButton = () => {
  return (
    <div id="removeButtonContainer" className="d-none">
      <div className="container">
        <button disabled className="btn btn-outline-light" id="removeButton">
          Remove All Decks
        </button>
      </div>
    </div>
  );
};

export default RemoveButton;
