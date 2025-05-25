import React from "react";
import { HomeOverlay } from "./HomeOverlay";
import { IosStatusBar } from "./IosStatusBar";
import { Navbar } from "./Navbar";
import "./style.css";

export const Home = (): JSX.Element => {
  return (
    <div className="home">
      <div className="frame-wrapper-2">
        <div className="frame-11">
          <div className="overlap-8">
            <div className="rectangle-5" />

            <Navbar />
            <IosStatusBar />
            <HomeOverlay />
          </div>
        </div>
      </div>
    </div>
  );
};
