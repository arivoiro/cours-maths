import React from "react";
import Contact from "../components/Contact";
import { useEffect } from "react";

export default function ContactPage() {
  useEffect(() => {
    document.title = "Cours Maths — Contact";
  }, []);
  return (
  <div className="contact-page">
    <Contact />
  </div>
);
}
