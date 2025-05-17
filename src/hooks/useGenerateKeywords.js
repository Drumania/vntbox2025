import { useCallback } from "react";

const useGenerateKeywords = () => {
  const generateKeywords = useCallback((displayName = "", username = "") => {
    const keywords = new Set();

    const addKeywords = (text) => {
      if (!text) return;
      const str = text.toLowerCase();
      for (let i = 1; i <= str.length; i++) {
        keywords.add(str.slice(0, i));
      }
    };

    const nameParts = displayName.toLowerCase().split(" ");
    nameParts.forEach(addKeywords);
    addKeywords(username);

    return Array.from(keywords);
  }, []);

  return generateKeywords;
};

export default useGenerateKeywords;
