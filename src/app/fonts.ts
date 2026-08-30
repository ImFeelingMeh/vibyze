import localFont from "next/font/local";

/** Nunito Sans variable font, self-hosted from the repo's Nunito_Sans folder. */
export const nunitoSans = localFont({
  src: [
    {
      path: "../../Nunito_Sans/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf",
      weight: "200 1000",
      style: "normal",
    },
    {
      path: "../../Nunito_Sans/NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf",
      weight: "200 1000",
      style: "italic",
    },
  ],
  variable: "--font-nunito-sans",
  display: "swap",
});
