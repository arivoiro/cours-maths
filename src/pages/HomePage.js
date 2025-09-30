import React, { useEffect } from "react";
import Hero from "../components/Hero";
import Tarifs from "../components/Tarifs";
import Contact from "../components/Contact";

export default function HomePage() {
  useEffect(() => {
    document.title = "Cours Maths — Accueil";
  }, []);
  return (
    <div>
      <Hero />
      <Tarifs />
      <Contact />
    </div>
  );
}
