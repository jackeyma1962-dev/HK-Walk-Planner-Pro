import { GoogleGenAI, Type } from "@google/genai";
import type { Route } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API 金鑰未設定。請在您的部署環境中設定 API_KEY 環境變數。");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const routeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      routeName: {
        type: Type.STRING,
        description: '路線的描述性名稱，例如「途經維多利亞公園」。',
      },
      totalDistanceKm: {
        type: Type.NUMBER,
        description: '路線的總步行距離（公里）。',
      },
      path: {
        type: Type.ARRAY,
        description: '代表路線步行路徑的緯度和經度座標陣列。',
        items: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER, description: '緯度' },
            lng: { type: Type.NUMBER, description: '經度' },
          },
          required: ['lat', 'lng'],
        },
      },
      restStops: {
        type: Type.ARRAY,
        description: '沿途建議的休息點陣列。',
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: '休息點的名稱或描述，例如「公園長凳」或「咖啡店」。',
            },
            distanceFromPreviousKm: {
              type: Type.NUMBER,
              description: '從上一個點（起點或上一個休息點）到此休息點的距離（公里）。',
            },
            location: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER, description: '緯度' },
                lng: { type: Type.NUMBER, description: '經度' },
              },
              required: ['lat', 'lng'],
            },
          },
          required: ['name', 'distanceFromPreviousKm', 'location'],
        },
      },
    },
    required: ['routeName', 'totalDistanceKm', 'path', 'restStops'],
  },
};

export const getWalkingRoutes = async (
  start: string,
  end: string,
  restIntervalKm: number
): Promise<Route[]> => {
  const prompt = `
    你是一位專業的香港路線規劃師。你的任務是為使用者規劃步行路線。

    請根據以下要求，找出兩條由香港的「${start}」步行至「${end}」的不同路線：

    1.  **路線數量**: 提供兩條不同的步行路線。
    2.  **休息點**: 在每條路線上，大約每 ${restIntervalKm} 公里規劃一個合理的休息點（例如公園、咖啡店、公共長椅等）。計算並提供每個休息點與前一個點（起點或其他休息點）之間的確切距離。
    3.  **輸出格式**: 你的回覆必須是嚴格的 JSON 格式，且符合我提供的 JSON Schema。不要包含任何 Markdown 語法（例如 \`\`\`json）。JSON 陣列中應包含兩個代表路線的物件。
    4.  **數據準確性**: 提供準確的地理座標（緯度和經度）用於繪製路線圖和標示休息點。路線應為適合步行的路徑，例如人行道、公園小徑等。

    請立即生成 JSON 輸出。
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: routeSchema,
        }
    });

    const jsonText = response.text.trim();
    const routes: Route[] = JSON.parse(jsonText);
    
    if (!Array.isArray(routes) || routes.length === 0) {
      throw new Error("AI 未能提供有效的路線。");
    }

    return routes;
  } catch (error) {
    console.error("調用 Gemini API 時出錯:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("AI 回應的格式無效，無法解析路線。");
    }
    throw new Error("無法從 AI 獲取路線建議，請稍後再試。");
  }
};
