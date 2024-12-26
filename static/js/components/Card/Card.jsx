import React from "react";
import "./Card.css";

const Card = ({ heading, value }) => {
  return (
    <div className="card">
      <div className="border-wrapper">
        <div className="content">
          <p className="card-heading">{heading}</p>
          <p className="card-value letter-spacing-1">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
