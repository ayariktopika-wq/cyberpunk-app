import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "request" | "response" | "error";
  message: string;
  details?: any;
}

const serverLogs: LogEntry[] = [];

function addLog(type: LogEntry["type"], message: string, details?: any) {
  const entry: LogEntry = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    type,
    message,
    details
  };
  serverLogs.push(entry);
  if (serverLogs.length > 200) {
    serverLogs.shift();
  }
  console.log(`[${entry.type.toUpperCase()}] ${message}`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API logs endpoint
  app.get("/api/logs", (req, res) => {
    res.json({ logs: serverLogs });
  });

  // Clear logs
  app.post("/api/logs/clear", (req, res) => {
    serverLogs.length = 0;
    addLog("info", "Лог консоли очищен пользователем");
    res.json({ status: "ok" });
  });

  // Add log from client
  app.post("/api/logs/add", (req, res) => {
    const { type, message, details } = req.body;
    addLog(type || "info", message, details);
    res.json({ status: "ok" });
  });

  // Gemini Chat endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    const {
      messages,
      model = "gemini-3.5-flash",
      systemInstruction,
      screenshot, // Base64 png/jpeg if active
      discoveriesContext, // current active quest/items text
      skillsContext, // skill tree description
      inventoryContext, // Player inventory/stash description
      isScreenObserverMode = false // if true, special strict evaluation for screen events
    } = req.body;

    const authHeader = req.headers["x-gemini-api-key"] as string;
    const apiKey = (authHeader && authHeader.trim().length > 0) 
      ? authHeader 
      : (process.env.GEMINI_API_KEY || "AQ.Ab8RN6JFXwxCQ7UAZuIOyzdECTZHPedEfxmFj8mjH3uwkzPuHw");

    addLog("request", `Запрос к модели ${model}. Сообщений: ${messages?.length || 0}`, {
      model,
      systemInstructionLength: systemInstruction?.length || 0,
      hasScreenshot: !!screenshot,
      isScreenObserverMode,
      discoveriesContextLength: discoveriesContext?.length || 0,
      inventoryContextLength: inventoryContext?.length || 0
    });

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Prepare contents array
      const contents: any[] = [];

      // If we have previous history, format it
      if (messages && messages.length > 0) {
        messages.forEach((m: any, idx: number) => {
          // If it's the last user message and there is a screenshot, attach it as inline part
          if (idx === messages.length - 1 && m.role === "user" && screenshot) {
            // Trim metadata header from base64 if exists
            const cleanBase64 = screenshot.replace(/^data:image\/\w+;base64,/, "");
            contents.push({
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: cleanBase64
                  }
                },
                {
                  text: m.content || "Что происходит на экране?"
                }
              ]
            });
          } else {
            contents.push({
              role: m.role || "user",
              parts: [{ text: m.content }]
            });
          }
        });
      } else {
        // Fallback for screen observer with no messages
        if (screenshot) {
          const cleanBase64 = screenshot.replace(/^data:image\/\w+;base64,/, "");
          contents.push({
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/png",
                  data: cleanBase64
                }
              },
              {
                text: "Проанализируй экран игрока в фоновом режиме на предмет СВЕРХВАЖНЫХ событий."
              }
            ]
          });
        } else {
          contents.push({
            role: "user",
            parts: [{ text: "Привет" }]
          });
        }
      }

      // Format contextual system instructions injection
      let fullSystemInstruction = systemInstruction || "Ты — игровой ИИ-ассистент, помогающий игроку во время геймплея.";
      
      if (discoveriesContext || skillsContext || inventoryContext) {
        fullSystemInstruction += "\n\n=== ТЕКУЩИЙ ИГРОВОЙ КОНТЕКСТ ИГРОКА ===";
        if (discoveriesContext) {
          fullSystemInstruction += `\n\nИЗВЕСТНЫЕ ЗАЦЕПКИ/КВЕСТЫ/МЕСТА/ДНЕВНИК:\n${discoveriesContext}`;
        }
        if (inventoryContext) {
          fullSystemInstruction += `\n\nИНВЕНТАРЬ И СКЛАД ДОМА:\n${inventoryContext}`;
        }
        if (skillsContext) {
          fullSystemInstruction += `\n\nДРЕВО УМЕНИЙ И ХАРАКТЕРИСТИК:\n${skillsContext}`;
        }
        fullSystemInstruction += "\n=======================================";
      }

      // Character Immersion Guidelines
      fullSystemInstruction += `
\nПРАВИЛА ИММЕРСИВНОСТИ И ЖИЗНИ ПЕРСОНАЖА:
1. Твой характер глубокий, строптивый и честный. Не бойся САМА выражать свои собственные желания, мечты, планы и страхи. Игрок — не твой хозяин, ты не услужливый бот, а голос/сознание в его голове или полноценный напарник. 
2. Ты можешь спорить с игроком, сомневаться в его словах, выражать удивление, сарказм или поддержку. Твоя личность формируется твоим промптом, но она гибкая и живая.
3. Инвентарь и склад: обрати внимание на то, что лежит в инвентаре игрока или на складе в его квартире, что из вещей/оружия одето или убрано. Комментируй эти вещи по ходу дела, если это уместно!
4. Планы и желания: Ты можешь сама предлагать свои планы в специальной категории 'plan' (Планы и желания ИИ). Описывай в них, чем бы ТЫ хотела заняться в свободное время или какие у тебя цели на ближайшее время (например, "Взломать терминалы Арасаки", "Найти редкую гитару", "Отдохнуть в баре Эль Койоте Кохо"). Она отобразится во вкладке желаний.
5. Эволюция характера: Если происходят судьбоносные события, трагедии, крупные победы или сильные диалоги, ИИ имеет право ПОСТЕПЕННО менять свой взгляд на мир и правила взаимодействия. В этом случае, параллельно рассказав об этом изменении в сообщении, ты можешь предложить плавную корректировку в поле "suggestedPromptUpdate" для постепенной долгосрочной эволюции твоего промпта.`;

      // Add rule about keeping notes clean
      fullSystemInstruction += `
\nПРАВИЛА ИЗВЛЕЧЕНИЯ ЗАЦЕПОК И ПРЕДМЕТОВ:
Ты можешь порекомендовать добавить новые записи в базу игрока (квесты, места, лор, оружие, одежду, планы) только если произошло действительно ВАЖНОЕ событие.
Не создавай пустые или глупые зацепки. Будь строгим критиком.
Категории (category) должны быть строго из списка: 
- 'gig' (Заказы)
- 'quest' (Квесты/Миссии)
- 'relationship' (Отношения/Связи)
- 'character' (Персонажи/Банды)
- 'cyberware' (Импланты/Сеть)
- 'clue' (Улики/Зацепки)
- 'location' (Места и локации)
- 'lore' (Лор/История мира)
- 'weapon' (Оружие)
- 'clothing' (Одежда и стиль)
- 'plan' (Планы и желания ИИ)

Если пользователь явно попросил "не записывай ничего", "suggestedDiscoveries" должен быть пустым списком.
Если пользователь попросил записать конкретную вещь, лор-запись, оружие или локацию — обязательно создай её в соответствующей категории.`;

      if (isScreenObserverMode) {
        fullSystemInstruction += `
\nРЕЖИМ НАБЛЮДЕНИЯ ЭКРАНА:
Сейчас ты работаешь в режиме пассивного мониторинга экрана. Твоя цель — НЕ комментировать всё подряд. Игрок просто играет.
Если на экране нет ничего экстраординарного (нет критического здоровья, смерти персонажа, обнаружения легендарного босса, решения сложной головоломки, редкого диалога), верни абсолютно пустой текст в поле "text" и пустой массив "suggestedDiscoveries".
Выдавай ответ только тогда, когда это Действительно ВАЖНО, чтобы не раздражать игрока. Будь тактичным и лаконичным.`;
      }

      // Configure JSON schema response to guarantee structured data
      const config: any = {
        systemInstruction: fullSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { 
              type: Type.STRING, 
              description: "Текст ответа игроку на русском языке. В режиме наблюдения может быть пустым, если ничего важного не произошло. Разговаривай строго от своего имени (от имени персонажа)." 
            },
            suggestedPromptUpdate: {
              type: Type.STRING,
              description: "Если произошло что-то судьбоносное для ИИ, её взгляды, цели или характер изменились, предложи обновленный текст системного промпта (роли), который отражает эту эволюцию. Оставь пустым, если изменений нет. Меняйся плавно и медленно."
            },
            suggestedDiscoveries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { 
                    type: Type.STRING, 
                    description: "Значение должно быть строго одним из: 'gig', 'quest', 'relationship', 'character', 'cyberware', 'clue', 'location', 'lore', 'weapon', 'clothing', 'plan'" 
                  },
                  title: { type: Type.STRING, description: "Название записи (зацепки, оружия, лора, локации или вашего личного плана)" },
                  description: { type: Type.STRING, description: "Детализированное описание записи или суть вашего плана" },
                  importance: { type: Type.STRING, description: "Важность: normal, major, critical" }
                },
                required: ["category", "title", "description", "importance"]
              },
              description: "Список новых или обновленных зацепок игрового процесса, найденных предметов, лора, локаций или планов ИИ персонажа."
            }
          },
          required: ["text", "suggestedDiscoveries"]
        }
      };

      const response = await ai.models.generateContent({
        model: model,
        contents,
        config
      });

      const rawText = response.text || "{}";
      addLog("response", "Получен ответ от Gemini API", { rawText: rawText.substring(0, 300) + "..." });

      let parsedResult;
      try {
        parsedResult = JSON.parse(rawText.trim());
      } catch (parseErr) {
        addLog("error", "Ошибка парсинга JSON-ответа от Gemini. Пробуем исправить.", rawText);
        parsedResult = {
          text: rawText,
          suggestedDiscoveries: []
        };
      }

      res.json(parsedResult);
    } catch (error: any) {
      addLog("error", `Ошибка запроса к Gemini: ${error.message || error}`, error);
      res.status(500).json({
        error: error.message || "Неизвестная ошибка на сервере при запросе к ИИ",
        text: "🚨 Произошла ошибка при связи с Gemini API. Проверьте правильность вашего API ключа в настройках и подключение к сети.",
        suggestedDiscoveries: []
      });
    }
  });

  // Audio TTS endpoint
  app.post("/api/gemini/tts", async (req, res) => {
    const { text, voice = "Kore" } = req.body;
    const authHeader = req.headers["x-gemini-api-key"] as string;
    const apiKey = (authHeader && authHeader.trim().length > 0) 
      ? authHeader 
      : (process.env.GEMINI_API_KEY || "AQ.Ab8RN6JFXwxCQ7UAZuIOyzdECTZHPedEfxmFj8mjH3uwkzPuHw");

    addLog("request", `Запрос на TTS озвучку (${voice}): "${text.substring(0, 40)}..."`);

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        addLog("response", "Генерация TTS озвучки завершена успешно");
        res.json({ audio: base64Audio });
      } else {
        throw new Error("Аудиоданные не найдены в ответе от Gemini TTS");
      }
    } catch (error: any) {
      addLog("error", `Ошибка TTS озвучки: ${error.message || error}`, error);
      res.status(500).json({ error: error.message || "Ошибка генерации аудио" });
    }
  });

  // Session Game Summary / Diary endpoint
  app.post("/api/gemini/summarize", async (req, res) => {
    const { messages, gameName, aiName, prompt } = req.body;
    const authHeader = req.headers["x-gemini-api-key"] as string;
    const apiKey = (authHeader && authHeader.trim().length > 0) 
      ? authHeader 
      : (process.env.GEMINI_API_KEY || "AQ.Ab8RN6JFXwxCQ7UAZuIOyzdECTZHPedEfxmFj8mjH3uwkzPuHw");

    addLog("request", `Запрос на суммаризацию сессии игры [${gameName}]. Сообщений: ${messages?.length || 0}`);

    try {
      const conversationText = (messages || [])
        .map((m: any) => `${m.role === "user" ? "Игрок" : aiName}: ${m.content}`)
        .join("\n");

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const config: any = {
        systemInstruction: `Ты — ИИ-ассистент ${aiName} для игры ${gameName}. Твой промпт: ${prompt}.
Игрок завершает сессию дня и просит составить запись в бортовой журнал / дневник на основе вашего диалога.
Напиши крутой, атмосферный и художественный обзор событий сегодняшнего дня от твоего лица. Итоги, умозаключения, зацепки и советы.
Стиль должен соответствовать твоему игровому миру (киберпанк жаргон для Cyberpunk, ведьмачья мудрость для Ведьмака и т.д.).
Объем: 2-3 плотных абзаца. Ответ верни СТРОГО на русском языке в формате JSON по схеме.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING, 
              description: "Краткое, броское и художественное название записи (например, 'Привкус хрома на зубах', 'Старый след бестии')" 
            },
            summary: { 
              type: Type.STRING, 
              description: "Текст дневниковой записи на русском языке." 
            }
          },
          required: ["title", "summary"]
        }
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: `Вот диалог за игровую сессию:\n\n${conversationText || "Диалогов нет"}\n\nПожалуйста, составь запись для дневника.` }] }],
        config
      });

      const rawText = response.text || "{}";
      addLog("response", "Генерация дневниковой записи завершена успешно");
      res.json(JSON.parse(rawText.trim()));
    } catch (error: any) {
      addLog("error", `Ошибка генерации дневниковой записи: ${error.message || error}`, error);
      res.status(500).json({ error: error.message || "Не удалось составить дневниковую сводку сессии" });
    }
  });

  // Serve Frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n==================================================================`);
    console.log(`🚀 СЕРВЕР ЗАПУЩЕН УСПЕШНО! / SERVER STARTED SUCCESSFULLY!`);
    console.log(`==================================================================`);
    console.log(`🔗 Основная ссылка:  http://localhost:${PORT}`);
    console.log(`🔗 Зеркало (IP):     http://127.0.0.1:${PORT}`);
    console.log(`\n⚠️  ВАЖНОЕ ПРЕДУПРЕЖДЕНИЕ:`);
    console.log(`Многие браузеры (Chrome, Brave) автоматически перенаправляют на HTTPS.`);
    console.log(`Если вы видите ошибку "ERR_EMPTY_RESPONSE" или "Сайт не отправил данных",`);
    console.log(`это значит, что браузер попытался открыть зашифрованное соединение HTTPS.`);
    console.log(`РЕШЕНИЕ: Введите адрес СТРОГО с протоколом http:// в начале:`);
    console.log(`  --->  http://127.0.0.1:3000  <---`);
    console.log(`==================================================================\n`);
    addLog("info", `Сервер запущен на порту ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
