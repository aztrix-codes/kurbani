'use client'
import React from "react";
import "./userPage.css";

function Page() {


  return (
    <div className="page-container">
      <div className="tiles-grid">
          <div  className="tile">
            <h3 className="tile-title">Add new share</h3>
          </div>
          <div  className="tile">
            <h3 className="tile-title">My shares</h3>
          </div>
          <div  className="tile">
            <h3 className="tile-title">Total shares</h3>
          </div>
          <div  className="tile">
            <h3 className="tile-title">Total paid</h3>
          </div>
          <div  className="tile">
            <h3 className="tile-title">Total pending</h3>
          </div>
          <div  className="tile">
            <h3 className="tile-title">My invoice</h3>
          </div>
      </div>
    </div>
  );
}

export default Page;
