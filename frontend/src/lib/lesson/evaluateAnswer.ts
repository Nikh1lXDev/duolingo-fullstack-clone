/**
 * Client-Side Deterministic Validation
 * 
 * NOTE: For Phase 5, answer evaluation is implemented purely on the client side 
 * to prioritize a snappy user experience without waiting for network latency.
 * This is deterministic but NOT server-authoritative and therefore not secure 
 * against a malicious client.
 * 
 * Phase 6+ may move this logic to the server.
 */

export function evaluateAnswer(type: string, submitted: unknown, correct: string): boolean {
  if (!submitted || !correct) return false;

  const normalizeString = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      // Replace multiple spaces with a single space
      .replace(/\s+/g, " ")
      // Remove common punctuation for generous matching
      .replace(/[.,!?¡¿]/g, "");
  };

  switch (type) {
    case "multiple_choice":
    case "type_answer":
    case "fill_blank":
    case "translate":
      return normalizeString(String(submitted)) === normalizeString(correct);

    case "word_bank":
      // submitted should be an array of words
      if (Array.isArray(submitted)) {
        const submittedStr = submitted.join(" ");
        return normalizeString(submittedStr) === normalizeString(correct);
      }
      return false;

    case "match_pairs":
      // submitted should be a record of left -> right selections
      try {
        const parsedCorrect = JSON.parse(correct);
        if (typeof submitted !== "object" || submitted === null) return false;
        
        // Ensure every key in the correct map is present and matches the value
        for (const [key, value] of Object.entries(parsedCorrect)) {
          if ((submitted as Record<string, unknown>)[key] !== value) return false;
        }
        return true;
      } catch {
        console.error("Match pairs validation error");
        return false;
      }

    default:
      return false;
  }
}
