import React, { useEffect } from "react";
import Contact from "../components/Contact";

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
