import React from "react";

const ShortURLForm = () => {
  return (
    <div id="shortURLForm" className="d-none">
      <div className="input-group mx-auto" id="shortURLGroup">
        <div className="input-group-prepend">
          <button disabled id="urlButton" className="btn btn-outline-light">
            Generate Short URL
          </button>
        </div>
        <input
          id="urlInput"
          readonly
          className="form-control"
          type="text"
          name="url"
        />
        <div className="input-group-append">
          <button
            disabled
            id="copyButton"
            className="btn btn-outline-light"
            data-clipboard-target="#urlInput"
          >
            <img
              className="clippy"
              src="images/clippy.svg"
              alt="Copy to clipboard"
              width="13"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortURLForm;
