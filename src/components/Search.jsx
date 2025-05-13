import React from "react";

const Search = () => {
  return (
    <>
      <div className="wrap-search">
        <i className="fas fa-search opacity-3" />
        <input
          type="search"
          className="input-search"
          id="search"
          placeholder="Search..."
        />
      </div>
    </>
  );
};

export default Search;
