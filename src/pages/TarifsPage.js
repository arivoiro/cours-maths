import React, { useEffect } from "react";
import Tarifs from "../components/Tarifs";

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
