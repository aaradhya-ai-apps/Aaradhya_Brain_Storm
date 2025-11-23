import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { 
  GameConfig, 
  GameContent, 
  GeneratedPair, 
  QuizQuestion, 
  TrueFalseQuestion, 
  SorterData, 
  OrderItem 
} from "../types";

export const generateGameContent = async (
  config: GameConfig
): Promise<GameContent> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const basePrompt = `Analyze the provided text from a PDF study document. 
  Text content: "${config.pdfContent?.slice(0, 40000)}..."`;

  let prompt = "";
  let responseSchema: any = null;

  switch (config.gameMode) {
    case 'MEMORY':
      prompt = `${basePrompt}
      Generate ${config.pairCount} pairs of matching concepts (Term -> Definition) for a memory game.
      - Pairs must be strictly based on the text.
      - Keep definitions concise (under 10 words).`;
      
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            match: { type: Type.STRING },
          },
          required: ["term", "match"],
        },
      };
      break;

    case 'QUIZ':
      prompt = `${basePrompt}
      Generate ${config.pairCount} multiple-choice questions.
      - Provide 4 options for each question.
      - Ensure only one option is correct.
      - Based strictly on the text.`;

      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer"],
        },
      };
      break;

    case 'TRUE_FALSE':
      prompt = `${basePrompt}
      Generate ${config.pairCount} statements based on the text.
      - Roughly half should be TRUE facts from the text.
      - Roughly half should be plausible FALSE modifications of facts from the text.
      - Shuffle them.`;

      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            statement: { type: Type.STRING },
            isTrue: { type: Type.BOOLEAN },
          },
          required: ["statement", "isTrue"],
        },
      };
      break;

    case 'SORTER':
      prompt = `${basePrompt}
      Identify TWO distinct, opposing categories in the text (e.g., "Causes vs Effects", "Protons vs Electrons", "Before 1900 vs After 1900").
      Generate ${config.pairCount} items that belong to either category A or category B.`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          categoryA: { type: Type.STRING, description: "Name of first category" },
          categoryB: { type: Type.STRING, description: "Name of second category" },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["A", "B"] },
              },
              required: ["text", "category"],
            },
          },
        },
        required: ["categoryA", "categoryB", "items"],
      };
      break;

    case 'ORDER':
      prompt = `${basePrompt}
      Identify a chronological sequence, a step-by-step process, or a ranked list in the text.
      Extract 5 to 8 distinct steps/events.
      Return them in the CORRECT order.`;

      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING, description: "The event description or step" },
          },
          required: ["content"],
        },
      };
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    let parsed = JSON.parse(text);

    // Post-processing for IDs
    if (config.gameMode === 'ORDER') {
       // Add correct indices
       parsed = parsed.map((item: any, index: number) => ({
         id: `item-${index}`,
         content: item.content,
         correctIndex: index
       }));
    } else if (config.gameMode === 'SORTER') {
      parsed.items = parsed.items.map((item: any, index: number) => ({
        ...item,
        id: `sort-${index}`
      }));
    } else if (Array.isArray(parsed)) {
      parsed = parsed.map((item: any, index: number) => ({
        ...item,
        id: `g-${index}`
      }));
    }

    return parsed;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
