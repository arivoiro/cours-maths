import React from "react";
import Tarifs from "../components/Tarifs";
import { useEffect } from "react";

export default function TarifsPage() {
  useEffect(() => {
    document.title = "Cours Maths — Tarifs";
  }, []);
  return (
  <div className="tarif-page">
    <Tarifs />
  </div>
);
}
