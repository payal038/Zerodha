import React from "react";
import Hero from "./Hero";
import Awards from "./Awards";
import Stats from "./Stats";
import Pricing from "../Pricing/Hero";
import Education from "./Education";
import OpenAccount from "../OpenAccount";
import SentimentWidget from "./SentimentWidget";

function HomePage() {
  return (
    <>
      <Hero />
      <Awards />
      <Stats />
      <SentimentWidget />
      <Pricing />
      <Education />
      <OpenAccount />
    </>
  );
}

export default HomePage;
