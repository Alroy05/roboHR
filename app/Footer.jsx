import React from "react";
import { sourceCodePro } from "./styles/fonts";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer
      className={`p-4 bg-gray-800 text-white w-full grid grid-cols-3  bottom-0 ${sourceCodePro.className}`}
    >
      <p className={`text-center ${sourceCodePro.className}`}>
        By Vasaikars
      </p>
      <p className={`text-center ${sourceCodePro.className}`}>
        &copy; Kopat {year}
      </p>
      <p className={`text-center ${sourceCodePro.className}`}>
        Questions? Visit Farm House
      </p>
    </footer>
  );
};

export default Footer;
