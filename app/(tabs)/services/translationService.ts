import axios from "axios";

export const translateText = async (text: string, from: string, to: string) => {
  try {
    const response = await axios.post(
      "https://libretranslate.com/translate",
      {
        q: text,
        source: from,
        target: to,
        format: "text",
      },
      {
        headers: { accept: "application/json" },
      }
    );

    return response.data.translatedText;
  } catch (error) {
    console.error("Erreur traduction :", error);
    return "[Erreur traduction]";
  }
};
