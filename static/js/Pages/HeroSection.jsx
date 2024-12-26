import React from "react";
import "../Pages/HeroSection.css";
const HeroSection = () => {
  return (
    <div className="info" >
      <span className="infoHeading" style={{ textAlign: "center" }}>
        <span className="gradienText">BLOCK</span>{" "}
        <span className="NormalText">STAKING & CLAIM</span>
      </span>
      <p className="infoPara" style={{ color: "white" }}>
        Xero AI is revolutionizing the way we create content with our
        groundbreaking text-to-video Telegram bot, powered by our unique ARBP
        technology for unmatched accuracy. Built entirely in-house, our models
        stand out for their efficiency, with no reliance on standard APIs. Reap
        early investor advantage now!
      </p>
    </div>
  );
};

export default HeroSection;
