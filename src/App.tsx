import React, { useState, useEffect, useRef } from "react";
import { 
  GameChat, 
  ChatMessage, 
  Discovery, 
  DiscoveryCategory, 
  SkillNode, 
  SkillAttribute, 
  DiaryEntry,
  LogEntry,
  InventoryItem
} from "./types";
import { DiscoveriesTab } from "./components/DiscoveriesTab";
import { SkillsTab } from "./components/SkillsTab";
import { ConsoleTab } from "./components/ConsoleTab";
import { InventoryTab } from "./components/InventoryTab";
import { 
  Gamepad2, 
  MessageSquare, 
  Compass, 
  Award, 
  Terminal, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  Image as ImageIcon,
  Send, 
  Plus, 
  Settings, 
  Check, 
  X, 
  Trash2, 
  ExternalLink, 
  Key, 
  Tv, 
  Sparkles, 
  Loader2,
  Copy,
  Edit,
  Package
} from "lucide-react";

// Pre-defined default models for free tier selection
const AVAILABLE_MODELS = [
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash (Рекомендуется, быстрый)", isFree: true },
  { id: "gemini-3.5-flash-8b", name: "Gemini 3.5 Flash-8b (Экономный, быстрый)", isFree: true },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", isFree: true },
];

const PREBUILT_VOICES = [
  { id: "Kore", name: "Kore (Энергичный)" },
  { id: "Aoede", name: "Aoede (Мягкий)" },
  { id: "Puck", name: "Puck (Игривый)" },
  { id: "Fenrir", name: "Fenrir (Суровый)" },
  { id: "native", name: "Мужской / Женский (Голос браузера)" }
];

export default function App() {
  // Current tab view: 'chat' | 'discoveries' | 'skills' | 'console' | 'inventory'
  const [activeTab, setActiveTab] = useState<"chat" | "discoveries" | "skills" | "console" | "inventory">("chat");

  // Game Chats State
  const [chats, setChats] = useState<GameChat[]>(() => {
    const cached = localStorage.getItem("ai_game_chats");
    if (cached) return JSON.parse(cached);
    return [
      {
        id: "default-cyberpunk",
        name: "Cyberpunk 2077",
        aiName: "T-Bug (НЕТРАННЕР ИИ)",
        prompt: "Ты — Т-Баг, легендарный нетраннер Найт-Сити и ИИ-ассистент в деке игрока. Твоя специфика: комментировать действия на экране (скриншоты, трансляция), помогать находить уязвимости, импланты, анализировать заказы (gigs) фиксеров, квесты и персонажей. Пиши в крутом, уверенном стиле киберпанка. Используй жаргон: 'лёд', 'дека', 'скрипты', 'подсеть', 'подгрузить память', 'Ви'. Будь лаконичной, острой на язык и давай крутые тактические хакерские советы.",
        model: "gemini-3.5-flash",
        messages: [
          {
            id: "init",
            role: "model",
            content: "Сессия расшифровки активна. Я подключилась к твоей оптике Кироси. Прими заказ Реджины Джонс или вкачай навыки в деке, и мы покажем этим корпам, из какого теста сделаны.",
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: "default-witcher",
        name: "Ведьмак 3",
        aiName: "Весемир (ИИ)",
        prompt: "Ты — Весемир, старый умудренны опытом ведьмак. Твоя роль — комментировать только СВЕРХВАЖНЫЕ события, давать ценные советы по алхимии, монстрам, уязвимостям во время боя и следить за выполнением квестов игрока. Будь краток и грубоват, но заботлив как дедушка.",
        model: "gemini-3.5-flash",
        messages: [
          {
            id: "init",
            role: "model",
            content: "Здравствуй, ученик. Я здесь, чтобы приглядывать за твоим мечом и ведьмачьим чутьем. Показывай экран или говори, когда нужна помощь против бестий.",
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    return chats[0]?.id || "";
  });

  // Global Discoveries Base
  const [discoveries, setDiscoveries] = useState<Discovery[]>(() => {
    const cached = localStorage.getItem("ai_game_discoveries");
    if (cached) return JSON.parse(cached);
    return [];
  });

  // Global Skills Base
  const [skills, setSkills] = useState<SkillNode[]>(() => {
    const cached = localStorage.getItem("ai_game_skills");
    if (cached) return JSON.parse(cached);
    return [];
  });

  // Global Attributes Base
  const [attributes, setAttributes] = useState<SkillAttribute[]>(() => {
    const cached = localStorage.getItem("ai_game_attributes");
    if (cached) return JSON.parse(cached);
    return [];
  });

  // Global Diary State
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    const cached = localStorage.getItem("ai_game_diary_entries");
    if (cached) return JSON.parse(cached);
    return [];
  });

  // Global Inventory State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const cached = localStorage.getItem("ai_game_inventory");
    if (cached) return JSON.parse(cached);
    return [];
  });

  // Active audio stop tracking states
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Editing current Prompt/Game modal states
  const [showEditPromptModal, setShowEditPromptModal] = useState<boolean>(false);
  const [editingChatName, setEditingChatName] = useState<string>("");
  const [editingChatAIName, setEditingChatAIName] = useState<string>("");
  const [editingChatPrompt, setEditingChatPrompt] = useState<string>("");
  const [editingChatModel, setEditingChatModel] = useState<string>("");

  // Cyberpunk Commentary Mode: "full" | "critical" | "silent" | "off" | "manual"
  const [commentaryMode, setCommentaryMode] = useState<"full" | "critical" | "silent" | "off" | "manual">(() => {
    return (localStorage.getItem("ai_commentary_mode") as any) || "full";
  });

  // Skill Points per session
  const [skillPoints, setSkillPoints] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem("cyber_skill_points");
    return cached ? JSON.parse(cached) : {};
  });

  // Attribute Points per session
  const [attributePoints, setAttributePoints] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem("cyber_attribute_points");
    return cached ? JSON.parse(cached) : {};
  });

  // Server Log list for the debug console
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // User configured API Secret
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem("user_gemini_api_key") || "";
  });

  // TTS Settings
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("Kore");

  // Interaction State
  const [inputText, setInputText] = useState("");
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Screen Sharing stream state for AI Observer Mode
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isObserverModeActive, setIsObserverModeActive] = useState(false);
  const [observerFrequency, setObserverFrequency] = useState<number>(10); // seconds
  const [observerStatus, setObserverStatus] = useState<string>("Готов к запуску");

  // Speech Recognition state
  const [isRecognizing, setIsRecognizing] = useState(false);

  // UI modal forms toggles
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  // Form states for creating/editing game chats
  const [newChatName, setNewChatName] = useState("");
  const [newChatAIName, setNewChatAIName] = useState("");
  const [newChatPrompt, setNewChatPrompt] = useState("");
  const [newChatModel, setNewChatModel] = useState("gemini-3.5-flash");

  // Ref holders
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const observerTimerRef = useRef<any>(null);

  // Cache persistence safely wrapped in try-catches
  useEffect(() => {
    try {
      localStorage.setItem("ai_game_chats", JSON.stringify(chats));
    } catch (e) {
      console.warn("Превышена квота локального хранилища для чатов", e);
    }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem("ai_game_discoveries", JSON.stringify(discoveries));
    } catch (e) {
      console.warn("Превышена квота локального хранилища для зацепок", e);
    }
  }, [discoveries]);

  useEffect(() => {
    try {
      localStorage.setItem("ai_game_diary_entries", JSON.stringify(diaryEntries));
    } catch (e) {
      console.warn("Превышена квота локального хранилища для дневников", e);
    }
  }, [diaryEntries]);

  useEffect(() => {
    try {
      localStorage.setItem("ai_game_skills", JSON.stringify(skills));
    } catch (e) {
      console.warn("Превышена квота локального хранилища для умений", e);
    }
  }, [skills]);

  useEffect(() => {
    try {
      localStorage.setItem("ai_game_attributes", JSON.stringify(attributes));
    } catch (e) {
      console.warn("Превышена квота локального хранилища для характеристик", e);
    }
  }, [attributes]);

  useEffect(() => {
    try {
      localStorage.setItem("ai_game_inventory", JSON.stringify(inventoryItems));
    } catch (e) {
      console.warn("Превышена квота локального хранилища для инвентаря", e);
    }
  }, [inventoryItems]);

  useEffect(() => {
    try {
      localStorage.setItem("ai_commentary_mode", commentaryMode);
    } catch (e) {}
  }, [commentaryMode]);

  useEffect(() => {
    localStorage.setItem("cyber_skill_points", JSON.stringify(skillPoints));
  }, [skillPoints]);

  useEffect(() => {
    localStorage.setItem("cyber_attribute_points", JSON.stringify(attributePoints));
  }, [attributePoints]);

  useEffect(() => {
    localStorage.setItem("user_gemini_api_key", customApiKey);
  }, [customApiKey]);

  // Fetch console logs from backend
  const fetchConsoleLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // safe fallback
    }
  };

  // Helper to append custom info to debug netrunner terminal
  const addLog = (type: LogEntry["type"], message: string) => {
    const entry: LogEntry = {
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs((prev) => [entry, ...prev]);
  };

  useEffect(() => {
    fetchConsoleLogs();
    const interval = setInterval(fetchConsoleLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync scroll on chat modification
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  // Web Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "ru-RU";

      rec.onstart = () => {
        setIsRecognizing(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsRecognizing(false);
      };

      rec.onend = () => {
        setIsRecognizing(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleSpeechInput = () => {
    if (!recognitionRef.current) {
      alert("Голосовой ввод не поддерживается вашим браузером или отключен.");
      return;
    }

    if (isRecognizing) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Convert Chat text to speak
  const speakText = async (textToSpeak: string) => {
    if (!isVoiceEnabled || !textToSpeak) return;

    // First stop any ongoing voice output
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);

    if (selectedVoice === "native") {
      const u = new SpeechSynthesisUtterance(textToSpeak);
      u.lang = "ru-RU";
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    } else {
      try {
        const res = await fetch("/api/gemini/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Gemini-API-Key": customApiKey
          },
          body: JSON.stringify({ text: textToSpeak, voice: selectedVoice })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.audio) {
            const audioObj = new Audio(`data:audio/wav;base64,${data.audio}`);
            activeAudioRef.current = audioObj;
            audioObj.onended = () => setIsSpeaking(false);
            audioObj.onerror = () => setIsSpeaking(false);
            audioObj.play();
          } else {
            setIsSpeaking(false);
          }
        } else {
          setIsSpeaking(false);
        }
      } catch (err) {
        console.error("Gemini TTS Error, trying Native fallback:", err);
        const u = new SpeechSynthesisUtterance(textToSpeak);
        u.lang = "ru-RU";
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      }
    }
  };

  const stopSpeaking = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const captureScreenSnapshot = () => {
    if (!screenStream || !videoRef.current || !displayCanvasRef.current) {
      alert("Трансляция экрана не активна. Пожалуйста, запустите слежение в сайдбаре слева.");
      return;
    }
    const video = videoRef.current;
    const canvas = displayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = 1024; // high-quality screen snapshot
      canvas.height = (video.videoHeight / video.videoWidth) * 1024;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Img = canvas.toDataURL("image/jpeg", 0.85);
      setAttachedImageBase64(base64Img);
      setObserverStatus(`Кадр клиппирован вручную: ${new Date().toLocaleTimeString()}`);
    } else {
      alert("В данный момент медиаданные экрана не готовы. Пожалуйста, подождите или перезапустите слежение.");
    }
  };

  const finishDayAndCreateDiarySummary = async () => {
    const currentMessages = activeChat?.messages || [];
    // Only summarize messages that aren't system/initial greeting placeholders
    const playMessages = currentMessages.filter((m) => m.id !== "init" && !m.id.startsWith("init-") && m.content);
    if (playMessages.length === 0) {
      alert("В сегодняшней сессии еще нет сообщений для обобщения.");
      return;
    }

    if (!confirm("Вы действительно хотите завершить игровой день? Все диалоги за сегодня будут обобщены в 'Дневник', а текущая ветка чата очистится для оптимизации работы AI.")) {
      return;
    }

    setLoadingAI(true);
    addLog("request", "Запущен процесс суммаризации игрового дня...");
    try {
      const res = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gemini-API-Key": customApiKey
        },
        body: JSON.stringify({
          messages: playMessages.map((m) => ({ role: m.role, content: m.content })),
          gameName: activeChat.name,
          aiName: activeChat.aiName,
          prompt: activeChat.prompt
        })
      });

      if (!res.ok) {
        throw new Error("Не удалось связаться с сервером суммаризации.");
      }

      const data = await res.json();
      if (!data.summary) {
        throw new Error("Неверный формат ответа суммаризации.");
      }

      // Create new diary entry
      const newEntry: DiaryEntry = {
        id: "diary-" + Math.random().toString(36).substring(2, 9),
        gameId: activeChatId,
        title: data.title || `События дня - ${new Date().toLocaleDateString()}`,
        summary: data.summary,
        dateString: `День ${diaryEntries.filter(e => e.gameId === activeChatId).length + 1}`,
        createdAt: new Date().toISOString()
      };

      setDiaryEntries((prev) => [...prev, newEntry]);
      addLog("response", `Создан новый лист бортового журнала: ${newEntry.title}`);

      // Reset messages with a fresh welcoming greeting
      const welcomingMessage: ChatMessage = {
        id: "init-" + Math.random().toString(36).substring(2, 9),
        role: "model",
        content: `🌅 **Предыдущий игровой день успешно завершен!**\n\nЯ обобщила все события, зацепки и диалоги в твоем **Дневнике воспоминаний** (раздел "Зацепки & Снаряжение"). Все характеристики, инвентарь и выученные навыки сохранены!\n\nКонтекст очищен, поэтому я готова к новым приключениям без провисания памяти. О чём пойдет речь сегодня?`,
        timestamp: new Date().toISOString()
      };

      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c.id === activeChatId) {
            return { ...c, messages: [welcomingMessage] };
          }
          return c;
        })
      );

      // Open discoveries tab so the user can see their fresh diary entry!
      setActiveTab("discoveries");
      alert(`🎉 День успешно завершен!\nНовая дневниковая запись "${newEntry.title}" добавлена во вкладку "Зацепки & Снаряжение".`);
    } catch (err: any) {
      addLog("error", `Ошибка при суммаризации дня: ${err.message || err}`);
      alert(`⚠️ Не удалось завершить день: ${err.message || err}`);
    } finally {
      setLoadingAI(false);
    }
  };

  // File Attachment & Keyboard Paste base64 listener
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      convertToBase64(file);
    }
  };

  const convertToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDimension = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedResult = canvas.toDataURL("image/jpeg", 0.75);
          setAttachedImageBase64(compressedResult);
          addLog("info", `Прикреплённое изображение оптимизировано: сжато до ${width}x${height}`);
        } else {
          setAttachedImageBase64(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement | HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault(); // Prevent default text/binary paste into text input
          const file = items[i].getAsFile();
          if (file) {
            convertToBase64(file);
          }
          break; // Process only one image at a time
        }
      }
    }
  };

  // Chat Actions
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSendMessage = async (textOverride?: string, customScreenshotBase64?: string) => {
    const textMsg = textOverride !== undefined ? textOverride : inputText;
    const screenshotToSend = customScreenshotBase64 || attachedImageBase64;

    if (!textMsg.trim() && !screenshotToSend) return;

    // Build the user message object
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: textMsg,
      timestamp: new Date().toISOString(),
      screenshot: screenshotToSend || undefined
    };

    // Append to current chat content
    const updatedChats = chats.map((c) => {
      if (c.id === activeChatId) {
        return { ...c, messages: [...c.messages, userMessage] };
      }
      return c;
    });
    setChats(updatedChats);

    if (textOverride === undefined) {
      setInputText("");
      setAttachedImageBase64(null);
    }
    setLoadingAI(true);

    // Build Context strings to nourish Gemini prompt intelligently
    // Gather discoveries context in a clean textual shape
    const listDiscoveries = discoveries.filter((d) => d.gameId === activeChatId && (!d.isAIGenerated || d.accepted));
    const discoveriesContext = listDiscoveries.length > 0 
      ? listDiscoveries.map((d) => `- [${d.category.toUpperCase()} / Важность: ${d.importance}] ${d.title}: ${d.description}`).join("\n")
      : "В журнале пока нет сохраненных записей.";

    // Gather inventory context
    const listInventory = inventoryItems.filter((item) => item.gameId === activeChatId);
    const inventoryContext = listInventory.length > 0
      ? listInventory.map((item) => `- [${item.category.toUpperCase()} / Размещение: ${item.location === "inventory" ? "При себе" : "В тайнике"}${item.equipped ? " (Экипировано)" : ""}] ${item.name}: ${item.description} (${item.quantity} шт)`).join("\n")
      : "Инвентарь и склад дома абсолютно пусты.";

    // Gather skill building list to nourish Gemini advice
    const listSkills = skills.filter((s) => s.gameId === activeChatId);
    const listAttributes = attributes.filter((a) => a.gameId === activeChatId);
    let skillsContext = "";
    if (listAttributes.length > 0) {
      skillsContext += "Характеристики:\n" + listAttributes.map((a) => `- ${a.name}: ${a.value}`).join("\n") + "\n";
    }
    if (listSkills.length > 0) {
      skillsContext += "Навыки:\n" + listSkills.map((s) => `- [Ветка: ${s.branch}] ${s.name} (${s.purchased ? "ПРИОБРЕТЕН" : "НЕ куплен"})${s.dependsOn.length > 0 ? `, Зависит от: ${s.dependsOn.join(", ")}` : ""}: ${s.description}`).join("\n");
    } else {
      skillsContext += "Древо умений пока абсолютно пусто.";
    }

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gemini-API-Key": customApiKey
        },
        body: JSON.stringify({
          model: activeChat?.model || "gemini-3.5-flash",
          systemInstruction: activeChat?.prompt || "Ты — игровой ИИ-ассистент.",
          messages: updatedChats.find((c) => c.id === activeChatId)?.messages.map((m) => ({
            role: m.role,
            content: m.content
          })),
          screenshot: screenshotToSend || undefined,
          discoveriesContext,
          skillsContext,
          inventoryContext,
          isScreenObserverMode: false
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Add Model AI generated reply to chat
      const modelMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "model",
        content: data.text || "...",
        timestamp: new Date().toISOString()
      };

      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c.id === activeChatId) {
            return { ...c, messages: [...c.messages, modelMessage] };
          }
          return c;
        })
      );

      // Handle AI suggested self-evolution prompt changes
      if (data.suggestedPromptUpdate && data.suggestedPromptUpdate.trim().length > 0) {
        const cleanPrompt = data.suggestedPromptUpdate.trim();
        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === activeChatId) {
              return { ...c, prompt: cleanPrompt };
            }
            return c;
          })
        );
        addLog("info", `🔄 Личность ${activeChat?.aiName || "Ви"} претерпела эволюцию! Системный промпт изменён ею в реальном времени. Новый промпт: "${cleanPrompt.substring(0, 100)}..."`);
      }

      // Handle AI proposed discoveries recommendations
      if (data.suggestedDiscoveries && data.suggestedDiscoveries.length > 0) {
        const mapped: Discovery[] = data.suggestedDiscoveries.map((dis: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          gameId: activeChatId,
          category: dis.category as DiscoveryCategory,
          title: dis.title,
          description: dis.description,
          importance: dis.importance || "normal",
          createdAt: new Date().toISOString(),
          isAIGenerated: true,
          accepted: false
        }));

        setDiscoveries((prevDis) => [...prevDis, ...mapped]);
        // Switch to discoveries tab briefly if AI detected something very major, or suggest looking
      }

      // Audio speak if enabled
      if (data.text) {
        speakText(data.text);
      }
    } catch (err: any) {
      console.error(err);
      // Append fallback error notification to chat logs
      const errMessage: ChatMessage = {
        id: "err-" + Math.random().toString(36).substring(2, 5),
        role: "model",
        content: `🚨 Ошибка связи: ${err.message || 'не удалось получить ответ'}. Проверьте введенный API-ключ в настройках.`,
        timestamp: new Date().toISOString()
      };
      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c.id === activeChatId) {
            return { ...c, messages: [...c.messages, errMessage] };
          }
          return c;
        })
      );
    } finally {
      setLoadingAI(false);
    }
  };

  // Screen Observer Frame Grabbing Loop
  const startScreenObserverMode = async () => {
    try {
      if (screenStream) {
        // Stop current
        stopScreenObserverMode();
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "window" },
        audio: false
      });

      setScreenStream(stream);
      setIsObserverModeActive(true);
      if (observerFrequency > 0) {
        setObserverStatus(`Наблюдение активно. Частота кадров: 1 раз в ${observerFrequency} сек.`);
      } else {
        setObserverStatus("Трансляция активна. Авто-мониторинг выключен (0с). Делайте скриншоты вручную кнопкой у ввода.");
      }

      // Link to local video element so we can draw frame
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start looping interval if not manual and frequency is greater than 0
      if (commentaryMode !== "manual" && observerFrequency > 0) {
        observerTimerRef.current = setInterval(() => {
          captureAndAnalyzeFrame(stream);
        }, observerFrequency * 1000);
        setObserverStatus(`Наблюдение активно. Частота кадров: 1 раз в ${observerFrequency} сек.`);
      } else if (observerFrequency === 0) {
        setObserverStatus("Трансляция активна. Ожидание ручной отправки снимков (0 сек).");
      } else {
        setObserverStatus("Трансляция активна. Авто-комментарии выключены (ручной скриншот кнопкой).");
      }

      // Listen for stream stop from browser native overlay UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenObserverMode();
      };
    } catch (err: any) {
      alert(`Ошибка доступа к экрану: ${err.message || err}`);
      setObserverStatus("Ошибка запуска");
    }
  };

  const stopScreenObserverMode = () => {
    if (observerTimerRef.current) {
      clearInterval(observerTimerRef.current);
      observerTimerRef.current = null;
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    setScreenStream(null);
    setIsObserverModeActive(false);
    setObserverStatus("Наблюдение выключено");
  };

  // Capture current stream screenshot and query Gemini
  const captureAndAnalyzeFrame = async (stream: MediaStream) => {
    if (commentaryMode === "off") {
      stopScreenObserverMode();
      return;
    }
    if (!videoRef.current || !displayCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = displayCanvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = 640; // optimized resolution for fast processing
      canvas.height = (video.videoHeight / video.videoWidth) * 640;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Img = canvas.toDataURL("image/jpeg", 0.7);

      // Feed observations quietly
      setObserverStatus(`Захват кадра: ${new Date().toLocaleTimeString()}. Анализ ИИ...`);

      // Gather discoveries context 
      const listDiscoveries = discoveries.filter((d) => d.gameId === activeChatId && (!d.isAIGenerated || d.accepted));
      const discoveriesContext = listDiscoveries.length > 0 
        ? listDiscoveries.map((d) => `- [${d.category.toUpperCase()}] ${d.title}: ${d.description}`).join("\n")
        : "";

      // Gather inventory context
      const listInventory = inventoryItems.filter((item) => item.gameId === activeChatId);
      const inventoryContext = listInventory.length > 0
        ? listInventory.map((item) => `- [${item.category.toUpperCase()} / Размещение: ${item.location === "inventory" ? "При себе" : "В тайнике"}${item.equipped ? " (Экипировано)" : ""}] ${item.name}: ${item.description} (${item.quantity} шт)`).join("\n")
        : "";

      // Gather skill tree status 
      const listSkills = skills.filter((s) => s.gameId === activeChatId);
      const listAttributes = attributes.filter((a) => a.gameId === activeChatId);
      let skillsContext = "";
      if (listAttributes.length > 0) {
        skillsContext += "Характеристики:\n" + listAttributes.map((a) => `- ${a.name}: ${a.value}`).join("\n") + "\n";
      }
      if (listSkills.length > 0) {
        skillsContext += "Навыки:\n" + listSkills.map((s) => `- ${s.name} (${s.purchased ? "ПРИОБРЕТЕН" : "НЕ куплен"})`).join("\n");
      }

      try {
        const response = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Gemini-API-Key": customApiKey
          },
          body: JSON.stringify({
            model: activeChat?.model || "gemini-3.5-flash",
            systemInstruction: activeChat?.prompt || "Ты — пассивный игровой ИИ-наблюдатель.",
            messages: [], // Empty history for purely context-less background monitoring
            screenshot: base64Img,
            discoveriesContext,
            skillsContext,
            inventoryContext,
            isScreenObserverMode: true
          })
        });

        const data = await response.json();

        // Handle AI suggested self-evolution prompt changes in background
        if (data.suggestedPromptUpdate && data.suggestedPromptUpdate.trim().length > 0) {
          const cleanPrompt = data.suggestedPromptUpdate.trim();
          setChats((prevChats) =>
            prevChats.map((c) => {
              if (c.id === activeChatId) {
                return { ...c, prompt: cleanPrompt };
              }
              return c;
            })
          );
          addLog("info", `🔄 Личность ${activeChat?.aiName || "Ви"} претерпела эволюцию во время наблюдения экрана! Её системный промпт изменён ею в реальном времени. Новый промпт: "${cleanPrompt.substring(0, 100)}..."`);
        }

        // ScreenObserver responds with either text or null. 
        // If text is not empty and not basic, we treat it as an event trigger!
        if (data.text && data.text.trim().length > 0) {
          const silentMode = commentaryMode === "silent";
          const criticalOnly = commentaryMode === "critical";

          // If critical mode, filter the message text
          const hasCriticalKeywords = /критич|опасн|вниман|угроз|alert|danger|critical|warn/i.test(data.text);
          const shouldPost = !silentMode && (!criticalOnly || hasCriticalKeywords);

          if (shouldPost) {
            setObserverStatus(`ИИ заметил важное событие! ${new Date().toLocaleTimeString()}`);
            
            const modelMessage: ChatMessage = {
              id: "screen-" + Math.random().toString(36).substring(2, 9),
              role: "model",
              content: `👁️ [Наблюдение экрана] ${data.text}`,
              timestamp: new Date().toISOString(),
              screenshot: base64Img // Keep picture thumbnail
            };

            setChats((prevChats) =>
              prevChats.map((c) => {
                if (c.id === activeChatId) {
                  return { ...c, messages: [...c.messages, modelMessage] };
                }
                return c;
              })
            );

            // Voice speak if enabled
            speakText(data.text);
          } else {
            setObserverStatus(`Кадр проанализирован: (${commentaryMode}) залогировано в подсеть. ${new Date().toLocaleTimeString()}`);
          }
        } else {
          setObserverStatus(`Кадр проанализирован: ничего критического. ${new Date().toLocaleTimeString()}`);
        }

        // Catch suggestions (always allowed to gather silently in discoveries tab!)
        if (data.suggestedDiscoveries && data.suggestedDiscoveries.length > 0) {
          const mapped: Discovery[] = data.suggestedDiscoveries.map((dis: any) => ({
            id: Math.random().toString(36).substring(2, 9),
            gameId: activeChatId,
            category: dis.category as DiscoveryCategory,
            title: dis.title,
            description: dis.description,
            importance: dis.importance || "normal",
            createdAt: new Date().toISOString(),
            isAIGenerated: true,
            accepted: false
          }));

          setDiscoveries((prev) => [...prev, ...mapped]);
        }

      } catch (err) {
        console.error("Frame observer analysis error:", err);
        setObserverStatus("Временная ошибка сети ИИ");
      }
    }
  };

  // Add discovery manually
  const addDiscovery = (category: DiscoveryCategory, title: string, description: string, importance: Discovery["importance"]) => {
    const newItem: Discovery = {
      id: Math.random().toString(36).substring(2, 9),
      gameId: activeChatId,
      category,
      title,
      description,
      importance,
      createdAt: new Date().toISOString(),
      isAIGenerated: false,
      accepted: true
    };
    setDiscoveries([...discoveries, newItem]);
  };

  const acceptDiscovery = (id: string) => {
    setDiscoveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, accepted: true } : d))
    );
  };

  const declineDiscovery = (id: string) => {
    setDiscoveries((prev) => prev.filter((d) => d.id !== id));
  };

  const deleteDiscovery = (id: string) => {
    setDiscoveries((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDiscovery = (id: string, title: string, description: string, category: DiscoveryCategory, importance: Discovery["importance"]) => {
    setDiscoveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title, description, category, importance } : d))
    );
  };

  // Inventory Management Mutators
  const addInventoryItem = (itemData: Omit<InventoryItem, "id" | "gameId" | "createdAt">) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: "inv-" + Math.random().toString(36).substring(2, 9),
      gameId: activeChatId,
      createdAt: new Date().toISOString()
    };
    setInventoryItems((prev) => [...prev, newItem]);
    addLog("info", `🎒 Добавлен новый предмет: ${newItem.name} (${newItem.quantity} шт) - ${newItem.location === "inventory" ? "при себе" : "на складе"}`);
  };

  const deleteInventoryItem = (id: string) => {
    const found = inventoryItems.find((item) => item.id === id);
    if (found) {
      setInventoryItems((prev) => prev.filter((item) => item.id !== id));
      addLog("info", `🗑️ Предмет удален: ${found.name}`);
    }
  };

  const updateInventoryItemQuantity = (id: string, delta: number) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const toggleInventoryItemEquipped = (id: string) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newEquipped = !item.equipped;
          return { ...item, equipped: newEquipped };
        }
        return item;
      })
    );
  };

  const toggleInventoryItemLocation = (id: string) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newLocation = item.location === "inventory" ? "stash" : "inventory";
          const newEquipped = newLocation === "stash" ? false : item.equipped;
          return { ...item, location: newLocation, equipped: newEquipped };
        }
        return item;
      })
    );
  };

  // Skill Management
  const addSkill = (
    name: string,
    description: string,
    branch: string,
    deps: string[],
    requiredAttributeId?: string,
    requiredAttributeValue?: number,
    cost: number = 1,
    customId?: string
  ) => {
    const newSkill: SkillNode = {
      id: customId || ("skill-" + Math.random().toString(36).substring(2, 8)),
      gameId: activeChatId,
      name,
      description,
      branch,
      purchased: false,
      dependsOn: deps,
      requiredAttributeId,
      requiredAttributeValue,
      cost
    };
    setSkills((prev) => [...prev, newSkill]);
  };

  const toggleSkillPurchased = (id: string) => {
    setSkills((prev) => {
      const skill = prev.find((s) => s.id === id);
      if (!skill) return prev;

      const actId = activeChatId;
      const currentSkillPoints = skillPoints[actId] ?? 10;
      const isPurchased = skill.purchased;

      if (!isPurchased) {
        // We are trying to purchase it!
        const cost = skill.cost || 1;
        if (currentSkillPoints < cost) {
          alert(`Недостаточно очков навыков! Требуется: ${cost}, доступно: ${currentSkillPoints}`);
          return prev;
        }

        // Check required attribute
        if (skill.requiredAttributeId) {
          const attr = attributes.find((a) => a.id === skill.requiredAttributeId);
          const reqVal = skill.requiredAttributeValue || 0;
          if (!attr || attr.value < reqVal) {
            alert(`Для этого импланта / скрипта требуется характеристика [${attr?.name || "Характеристика"}] не ниже ${reqVal} ур.!`);
            return prev;
          }
        }

        // Check parent dependencies (supports up to 2, or more)
        if (skill.dependsOn && skill.dependsOn.length > 0) {
          const unsatisfied = skill.dependsOn.some((depId) => {
            const depSkill = prev.find((s) => s.id === depId);
            return !depSkill || !depSkill.purchased;
          });
          if (unsatisfied) {
            alert("Невозможно активировать: Предыдущие связанные скрипты / узлы еще не куплены!");
            return prev;
          }
        }

        // Deduct points
        setSkillPoints((p) => ({ ...p, [actId]: Math.max(0, currentSkillPoints - cost) }));
        return prev.map((s) => (s.id === id ? { ...s, purchased: true } : s));

      } else {
        // Refund it recursively!
        const cost = skill.cost || 1;
        const skillsToRefund: string[] = [];
        
        const findDependents = (skillId: string) => {
          prev.forEach((s) => {
            if (s.purchased && s.dependsOn && s.dependsOn.includes(skillId)) {
              if (!skillsToRefund.includes(s.id)) {
                skillsToRefund.push(s.id);
                findDependents(s.id);
              }
            }
          });
        };

        findDependents(id);
        skillsToRefund.push(id); // include self

        let totalRefund = 0;
        const nextSkills = prev.map((s) => {
          if (skillsToRefund.includes(s.id)) {
            if (s.purchased) {
              totalRefund += s.cost || 1;
            }
            return { ...s, purchased: false };
          }
          return s;
        });

        setSkillPoints((p) => ({ ...p, [actId]: currentSkillPoints + totalRefund }));
        
        if (skillsToRefund.length > 1) {
          alert(`Сброшен этот навык и ещё ${skillsToRefund.length - 1} поднавык(а/ов). Возвращено очков: ${totalRefund}`);
        } else {
          alert(`Навык возвращен. Получено: ${totalRefund} очк. навыков`);
        }

        return nextSkills;
      }
    });
  };

  const deleteSkill = (id: string) => {
    setSkills((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s) => ({
          ...s,
          dependsOn: s.dependsOn.filter((depId) => depId !== id)
        }))
    );
  };

  // Attributes Management
  const addAttribute = (name: string, value: number, customId?: string) => {
    const newAttr: SkillAttribute = {
      id: customId || ("attr-" + Math.random().toString(36).substring(2, 8)),
      gameId: activeChatId,
      name,
      value
    };
    setAttributes((prev) => [...prev, newAttr]);
  };

  const updateAttributeValue = (id: string, value: number) => {
    setAttributes((prevAttrs) => {
      const activeAttr = prevAttrs.find((a) => a.id === id);
      if (!activeAttr) return prevAttrs;
      
      const isIncrease = value > activeAttr.value;
      const actId = activeChatId;
      const currentAttrPoints = attributePoints[actId] ?? 7;

      if (isIncrease) {
        if (currentAttrPoints < 1) {
          alert("Недостаточно запасных очков характеристик в деке!");
          return prevAttrs;
        }
        setAttributePoints((prev) => ({ ...prev, [actId]: Math.max(0, currentAttrPoints - 1) }));
      } else {
        if (value < 3) {
          alert("Базовая спецификация не может быть ниже 3!");
          return prevAttrs;
        }
        setAttributePoints((prev) => ({ ...prev, [actId]: currentAttrPoints + 1 }));
      }

      const nextAttrs = prevAttrs.map((a) => (a.id === id ? { ...a, value } : a));

      // Check if any skills are violated on decrease
      if (!isIncrease) {
        const skillsToRefund: string[] = [];
        
        skills.forEach((s) => {
          if (s.purchased && s.requiredAttributeId === id) {
            if (value < (s.requiredAttributeValue || 0)) {
              skillsToRefund.push(s.id);
            }
          }
        });

        if (skillsToRefund.length > 0) {
          // Recursively find child skills depending on those
          const findDependents = (skillId: string) => {
            skills.forEach((s) => {
              if (s.purchased && s.dependsOn && s.dependsOn.includes(skillId)) {
                if (!skillsToRefund.includes(s.id)) {
                  skillsToRefund.push(s.id);
                  findDependents(s.id);
                }
              }
            });
          };

          const initialViolatedCount = skillsToRefund.length;
          for (let i = 0; i < initialViolatedCount; i++) {
            findDependents(skillsToRefund[i]);
          }

          let totalRefund = 0;
          setSkills((prevSkills) => {
            return prevSkills.map((s) => {
              if (skillsToRefund.includes(s.id)) {
                if (s.purchased) totalRefund += s.cost || 1;
                return { ...s, purchased: false };
              }
              return s;
            });
          });

          if (totalRefund > 0) {
            setSkillPoints((p) => ({ ...p, [actId]: (p[actId] ?? 10) + totalRefund }));
            setTimeout(() => {
              alert(`⚠️ Снижение уровня заблокировало требования имплантов / скриптов. Сброшено: ${skillsToRefund.length} навык(ов), возвращено очков: ${totalRefund}`);
            }, 100);
          }
        }
      }

      return nextAttrs;
    });
  };

  const deleteAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  // Create customized Game Chat session
  const createNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    const newChat: GameChat = {
      id: "game-" + Math.random().toString(36).substring(2, 9),
      name: newChatName,
      aiName: newChatAIName.trim() || "Игровой Ассистент",
      prompt: newChatPrompt.trim() || "Ты — мудрый советник по прохождению данной игры.",
      model: newChatModel,
      messages: [
        {
          id: "init",
          role: "model",
          content: `Приветствую в новой игровой сессии [${newChatName}]! Я буду твоим преданным помощником. О чем мы поговорим сначала?`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    setChats([...chats, newChat]);
    setActiveChatId(newChat.id);
    setNewChatName("");
    setNewChatAIName("");
    setNewChatPrompt("");
    setShowConfigModal(false);
  };

  const deleteChatSession = (id: string) => {
    if (chats.length <= 1) {
      alert("Нельзя удалить последнюю игровую сессию. Создайте другую, чтобы удалить эту.");
      return;
    }
    const filtered = chats.filter((c) => c.id !== id);
    setChats(filtered);
    // clean up associated discoveries and skills is optional, better to keep them if people want reimport
    setActiveChatId(filtered[0].id);
  };

  const clearServerLogs = async () => {
    try {
      await fetch("/api/logs/clear", { method: "POST" });
      fetchConsoleLogs();
    } catch {
      // safe fallback
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* Hidden layout support elements */}
      <video ref={videoRef} className="hidden" muted playsInline />
      <canvas ref={displayCanvasRef} className="hidden" />

      {/* Top Navigation Frame */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-indigo-600 rounded-xl shadow-lg ring-1 ring-white/10">
            <Gamepad2 className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-mono font-bold">Панель Игрока v2.6.4</span>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
              Игровой ИИ-Ассистент
            </h1>
          </div>
        </div>

        {/* Global Action toggles */}
        <div className="flex items-center gap-2.5">
          
          {/* API Key Configure Button */}
          <button
            onClick={() => {
              const res = prompt("Введите ваш личный Gemini API ключ, если хотите использовать его (по умолчанию встроен бесплатный):", customApiKey);
              if (res !== null) setCustomApiKey(res);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              customApiKey 
                ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40" 
                : "bg-slate-950 text-indigo-400 border-indigo-900/40 hover:bg-indigo-950/40"
            }`}
            title="Настройки ключа Gemini API"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{customApiKey ? "Свой ключ активен" : "Подключить свой API Ключ"}</span>
          </button>

          {/* Quick Guide to download code as folders */}
          <button
            onClick={() => setShowInstallGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-900/50 text-slate-300 rounded-lg transition"
            title="Как запустить у себя на ПК"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Скачать на ПК</span>
          </button>
        </div>
      </header>

      {/* Main App Grid View */}
      <main className="flex-1 w-full max-w-8xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left column sidebar: Game chats list selector & Screen observer toggle */}
        <section className="lg:col-span-3 flex flex-col gap-5 h-full min-h-[250px] lg:max-h-[calc(100vh-140px)]">
          
          {/* Active Screen Observer Box */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tv className={`w-5 h-5 ${isObserverModeActive ? "text-emerald-400" : "text-slate-450"}`} />
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Мониторинг Экрана</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-tight">Трансляция для анализа ИИ</p>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full ${isObserverModeActive ? "bg-emerald-500 animate-ping" : "bg-slate-700"}`} />
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 font-mono leading-relaxed">
              {observerStatus}
            </p>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Частота:</span>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="5"
                  value={observerFrequency}
                  onChange={(e) => setObserverFrequency(parseInt(e.target.value))}
                  className="w-20 accent-rose-500"
                  disabled={isObserverModeActive}
                />
                <span className="text-xs font-bold font-mono text-rose-450">{observerFrequency === 0 ? "0с (ручной)" : `${observerFrequency}с`}</span>
              </div>

              {/* Advanced Commentary switch options */}
              <div className="pt-2 border-t border-slate-850">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono block mb-1">Режим комментариев:</span>
                <div className="grid grid-cols-4 gap-0.5 p-0.5 bg-slate-950 rounded-lg border border-slate-850">
                  {(["full", "critical", "manual", "off"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCommentaryMode(mode)}
                      className={`py-1 text-[8px] font-extrabold font-mono rounded uppercase transition-all ${
                        commentaryMode === mode
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                      title={
                        mode === "full" ? "Автоматический: комментирует геймплей с периодичностью" :
                        mode === "critical" ? "Лишь важные системные угрозы и тревоги" :
                        mode === "manual" ? "Ручной: стрим запущен, но ИИ комментирует только когда вы жмете кнопку 'Кинуть скрин' у чата" :
                        "Выключить разбор и наблюдение экрана"
                      }
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startScreenObserverMode}
                disabled={commentaryMode === "off"}
                className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
                  commentaryMode === "off"
                    ? "opacity-40 cursor-not-allowed bg-slate-950 border border-slate-900 text-slate-600"
                    : isObserverModeActive
                    ? "bg-rose-950/25 hover:bg-rose-950/35 border border-rose-900 text-rose-400"
                    : "bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isObserverModeActive ? "Остановить трансляцию" : commentaryMode === "off" ? "Трансляция OFF" : "Начать трансляцию"}</span>
              </button>
            </div>
          </div>

          {/* Game Sessions Board */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Игровые миры</h3>
              <button
                onClick={() => setShowConfigModal(true)}
                className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                title="Новая игра"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-thin">
              {chats.map((ch) => {
                const isActive = ch.id === activeChatId;
                const discCount = discoveries.filter((d) => d.gameId === ch.id && (!d.isAIGenerated || d.accepted)).length;

                return (
                  <div
                    key={ch.id}
                    onClick={() => setActiveChatId(ch.id)}
                    className={`group w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isActive
                        ? "bg-indigo-950/20 border-indigo-500/70 shadow-md shadow-indigo-950/15"
                        : "bg-slate-950/50 hover:bg-slate-900 border-slate-850 hover:border-slate-800 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-white line-clamp-1">{ch.name}</span>
                        {chats.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Вы уверены, что хотите удалить сессию ${ch.name}?`)) {
                                deleteChatSession(ch.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 p-0.5 transition"
                            title="Удалить сессию"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-450 mt-1 flex items-center gap-1 font-mono">
                        <span>Ассистент:</span>
                        <span className="text-indigo-400 font-semibold">{ch.aiName}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-850/50 mt-2.5 pt-2 text-[9px] font-mono text-slate-500 font-bold uppercase">
                      <span>{ch.model}</span>
                      <span className="text-rose-450">{discCount} зацепок</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Columns: Tab selections & Content Panels */}
        <section className="lg:col-span-9 flex flex-col h-full min-h-[500px] lg:max-h-[calc(100vh-140px)]">
          
          {/* Secondary dynamic Header / Tab Navigator */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-850 p-3 rounded-2xl mb-4 shadow-sm">
            
            {/* View navigation links */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition ${
                  activeTab === "chat"
                    ? "bg-slate-950 text-indigo-400 border border-indigo-500/20 shadow-inner"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Основной Чат ИИ</span>
              </button>

              <button
                onClick={() => setActiveTab("discoveries")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition relative ${
                  activeTab === "discoveries"
                    ? "bg-slate-950 text-indigo-400 border border-indigo-500/20 shadow-inner"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Зацепки & Снаряжение</span>
                
                {/* Visual indicator of pending unaccepted AI suggestions */}
                {discoveries.some((d) => d.gameId === activeChatId && d.isAIGenerated && !d.accepted) && (
                  <span className="absolute -top-1.5 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("skills")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition ${
                  activeTab === "skills"
                    ? "bg-slate-950 text-indigo-400 border border-indigo-500/20 shadow-inner"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Древо Умений</span>
              </button>

              <button
                onClick={() => setActiveTab("inventory")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition ${
                  activeTab === "inventory"
                    ? "bg-slate-950 text-indigo-400 border border-indigo-500/20 shadow-inner"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Снаряжение & Склад</span>
              </button>

              <button
                onClick={() => setActiveTab("console")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition ${
                  activeTab === "console"
                    ? "bg-slate-950 text-indigo-400 border border-indigo-500/20 shadow-inner"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Консоль</span>
              </button>
            </div>

            {/* Speaking voice configuration switches */}
            <div className="flex items-center gap-3.5 bg-slate-950/60 p-2 rounded-xl border border-slate-850">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={`p-1.5 rounded-lg transition ${
                    isVoiceEnabled
                      ? "text-rose-400 bg-rose-950/30"
                      : "text-slate-500 bg-slate-900"
                  }`}
                  title={isVoiceEnabled ? "Голос включен" : "Голос отключен"}
                >
                  {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide hidden sm:inline">озвучка</span>
              </div>

              {isVoiceEnabled && (
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-slate-900/60 border border-slate-800 text-[10px] text-slate-350 rounded px-2 py-0.5"
                >
                  {PREBUILT_VOICES.map((vo) => (
                    <option key={vo.id} value={vo.id}>
                      {vo.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Dynamic Tab Switchboard */}
          <div className="flex-1 min-h-0">
            {activeTab === "chat" && (
              <div className="flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="chat-stream-panel">
                
                {/* Active Chat Header */}
                <div className="p-4 bg-slate-950 border-b border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Мир / Игра:</span>
                      <span className="text-sm text-indigo-400 font-extrabold truncate">{activeChat?.name}</span>
                      
                      {/* Quick Edit Prompt Trigger */}
                      <button
                        onClick={() => {
                          setEditingChatName(activeChat?.name || "");
                          setEditingChatAIName(activeChat?.aiName || "T-Bug");
                          setEditingChatPrompt(activeChat?.prompt || "");
                          setEditingChatModel(activeChat?.model || "gemini-3.5-flash");
                          setShowEditPromptModal(true);
                        }}
                        className="p-1 px-1.5 text-[10px] text-indigo-400 hover:text-white hover:bg-indigo-950/40 border border-indigo-900/30 rounded transition flex items-center gap-1 font-semibold"
                        title="Редактировать промпт и имя ИИ"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Настроить роль</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-450 mt-1 truncate" title={activeChat?.prompt}>
                      Голос: <span className="text-slate-300 font-mono">{activeChat?.aiName}</span> • Промт: "{activeChat?.prompt}"
                    </p>
                  </div>
                  
                  {/* Status Badges and Clear/Summarize Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Speaks & Stop speak indicator */}
                    {isSpeaking && (
                      <button
                        onClick={stopSpeaking}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-950/40 border border-rose-800 text-rose-400 rounded-lg animate-pulse hover:bg-rose-900/40 transition-all font-mono"
                        title="Остановить озвучку ИИ"
                      >
                        <VolumeX className="w-3 h-3" />
                        <span>Стоп Голос</span>
                      </button>
                    )}

                    {/* AI status badges */}
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 px-2.5 rounded-lg">
                      {loadingAI ? (
                        <div className="flex items-center gap-1" title="ИИ обрабатывает запрос">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                          <span className="text-[9px] font-bold font-mono text-indigo-400 uppercase tracking-widest">Анализ...</span>
                        </div>
                      ) : isSpeaking ? (
                        <div className="flex items-center gap-1" title="ИИ озвучивает ответ">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span className="text-[9px] font-bold font-mono text-rose-450 uppercase tracking-widest">Диктует</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1" title="ИИ готов к общению">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-widest">Готов</span>
                        </div>
                      )}
                    </div>

                    {/* Finish Day Session Button */}
                    <button
                      onClick={finishDayAndCreateDiarySummary}
                      disabled={loadingAI}
                      className="px-3 py-1 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-700/50 hover:border-indigo-650 text-indigo-400 hover:text-indigo-200 rounded-lg text-[9px] font-extrabold uppercase tracking-widest font-mono transition-all"
                      title="АРХИВИРОВАНИЕ ДНЯ: Сжать текущие сообщения дня в одну запись Дневника, сохранив характеристики и сбросив лог диалога"
                    >
                      🌅 Закончить день
                    </button>
                  </div>
                </div>

                {/* Messages Streams */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-900/40 scrollbar-thin">
                  {activeChat?.messages.map((m) => {
                    const isModel = m.role === "model";
                    return (
                      <div 
                        key={m.id}
                        className={`flex gap-3 max-w-4xl ${isModel ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs uppercase ${
                          isModel 
                            ? "bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white" 
                            : "bg-slate-750 text-slate-200"
                        }`}>
                          {isModel ? activeChat.aiName[0] : "И"}
                        </div>

                        {/* Speech Bubble */}
                        <div className={`rounded-2xl p-4 text-xs leading-relaxed max-w-prose space-y-2.5 ${
                          isModel 
                            ? "bg-slate-950 border border-slate-850/80 text-slate-250 rounded-tl-none" 
                            : "bg-gradient-to-br from-indigo-600 to-indigo-750 text-white rounded-tr-none shadow-md shadow-indigo-950/20"
                        }`}>
                          
                          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-1 max-w-full">
                            <span className="font-bold text-[10px] uppercase font-mono tracking-wider opacity-85">
                              {isModel ? activeChat.aiName : "Игрок"}
                            </span>
                            <span className="text-[9px] opacity-60 font-mono">
                              {new Date(m.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          {m.screenshot && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-800 max-w-xs mt-1.5 self-start bg-slate-900">
                              <img src={m.screenshot} alt="Кадр экрана" className="max-h-48 w-auto object-cover" />
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur text-[8px] font-mono text-white/95 px-1 rounded uppercase tracking-wider">
                                Скриншот
                              </div>
                            </div>
                          )}

                          <div className="whitespace-pre-wrap font-sans select-text select-all-double selection:bg-indigo-900/40 leading-relaxed font-normal">
                            {m.content}
                          </div>

                          {isModel && (
                            <button
                              onClick={() => speakText(m.content)}
                              className="text-[10px] text-indigo-400 hover:text-white mt-2 flex items-center gap-1 hover:underline transition-all"
                              title="Озвучить"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Озвучить фразу</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {loadingAI && (
                    <div className="flex gap-3 justify-start mr-auto items-center animate-pulse">
                      <div className="w-8 h-8 rounded-xl bg-slate-850 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-indigo-450 animate-spin" />
                      </div>
                      <div className="bg-slate-950 border border-slate-850 text-xs text-slate-500 rounded-2xl rounded-tl-none p-3 max-w-[200px] flex items-center gap-1.5">
                        <span>{activeChat?.aiName} думает...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Attached image preview thumbnail bar */}
                {attachedImageBase64 && (
                  <div className="bg-slate-950 p-2.5 border-t border-slate-850 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-800">
                        <img src={attachedImageBase64} alt="Загружено" className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Изображение прикреплено</p>
                        <p className="text-[10px] text-slate-500 font-mono">ИИ увидит её при следующей отправке</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachedImageBase64(null)}
                      className="p-1 px-2.5 text-xs text-rose-450 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition"
                    >
                      Убрать
                    </button>
                  </div>
                )}

                {/* Message Input Controls block */}
                <div className="p-4 bg-slate-950 border-t border-slate-850/80 flex flex-wrap md:flex-nowrap items-center gap-3">
                  
                  {/* Manual screen capture from active stream if observer is running */}
                  {isObserverModeActive && (
                    <button
                      type="button"
                      onClick={captureScreenSnapshot}
                      className="flex items-center justify-center p-3 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/20 border border-cyan-950/30 rounded-2xl transition shrink-0 font-mono"
                      title="Кинуть скрин экрана (захватить текущее состояние трансляции)"
                    >
                      <Camera className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span className="hidden md:inline ml-1.5 text-[10px] font-extrabold uppercase tracking-widest">Кинуть скрин</span>
                    </button>
                  )}

                  {/* File attach button */}
                  <label className="flex items-center justify-center p-3 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-850 rounded-2xl cursor-pointer transition shrink-0">
                    <ImageIcon className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Speech input button */}
                  <button
                    onClick={toggleSpeechInput}
                    className={`p-3 rounded-2xl border transition shrink-0 ${
                      isRecognizing
                        ? "bg-rose-600 border-rose-500 text-white animate-pulse"
                        : "text-slate-400 hover:text-white hover:bg-slate-900 border-slate-850"
                    }`}
                    title={isRecognizing ? "Идет запись..." : "Голосовой ввод"}
                  >
                    {isRecognizing ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  {/* Input line on keyboard */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      onPaste={handlePasteEvent}
                      placeholder="Напишите вопрос ИИ или вставьте скриншот с экрана (Ctrl+V)..."
                      className="w-full bg-slate-900 border border-slate-850 text-slate-200 rounded-2xl px-5 py-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-505 outline-none font-sans"
                    />

                    {/* Speech active whisper */}
                    {isRecognizing && (
                      <span className="absolute right-4 top-3 text-[10px] font-mono uppercase text-rose-500 tracking-wider">
                        🎤 говорите...
                      </span>
                    )}
                  </div>

                  {/* Send Action */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={(!inputText.trim() && !attachedImageBase64) || loadingAI}
                    className="p-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-2xl transition shadow-lg shadow-indigo-950/20 disabled:opacity-40 shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "discoveries" && (
              <DiscoveriesTab
                discoveries={discoveries.filter((d) => d.gameId === activeChatId)}
                diaryEntries={diaryEntries.filter((e) => e.gameId === activeChatId)}
                onDeleteDiaryEntry={(id) => setDiaryEntries((prev) => prev.filter((e) => e.id !== id))}
                onAddDiscovery={addDiscovery}
                onAcceptDiscovery={acceptDiscovery}
                onDeclineDiscovery={declineDiscovery}
                onDeleteDiscovery={deleteDiscovery}
                onUpdateDiscovery={updateDiscovery}
              />
            )}

            {activeTab === "skills" && (
              <SkillsTab
                skills={skills.filter((s) => s.gameId === activeChatId)}
                attributes={attributes.filter((a) => a.gameId === activeChatId)}
                skillPoints={skillPoints[activeChatId] ?? 10}
                attributePoints={attributePoints[activeChatId] ?? 7}
                onUpdateSkillPoints={(val) => setSkillPoints(prev => ({ ...prev, [activeChatId]: val }))}
                onUpdateAttributePoints={(val) => setAttributePoints(prev => ({ ...prev, [activeChatId]: val }))}
                onAddSkill={addSkill}
                onToggleSkillPurchased={toggleSkillPurchased}
                onDeleteSkill={deleteSkill}
                onAddAttribute={addAttribute}
                onUpdateAttributeValue={updateAttributeValue}
                onDeleteAttribute={deleteAttribute}
              />
            )}

            {activeTab === "inventory" && (
              <InventoryTab
                items={inventoryItems.filter((item) => item.gameId === activeChatId)}
                gameId={activeChatId}
                onAddItem={addInventoryItem}
                onDeleteItem={deleteInventoryItem}
                onUpdateQuantity={updateInventoryItemQuantity}
                onToggleEquipped={toggleInventoryItemEquipped}
                onToggleLocation={toggleInventoryItemLocation}
              />
            )}

            {activeTab === "console" && (
              <ConsoleTab
                logs={logs}
                onClearLogs={clearServerLogs}
                onRefreshLogs={fetchConsoleLogs}
              />
            )}
          </div>
        </section>
      </main>

      {/* MODAL 1: Create customized game chat */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in font-sans fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5 text-indigo-500" />
              <span>Добавить новую игру в ИИ-Ассистент</span>
            </h3>

            <form onSubmit={createNewChat} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">Название Игры</label>
                <input
                  type="text"
                  placeholder="Напр., Skyrim, Minecraft, Cyberpunk..."
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-455 mb-1">Имя Вашего ИИ-Персонажа</label>
                <input
                  type="text"
                  placeholder="Напр., Мудрый маг, Тактик, Кортана..."
                  value={newChatAIName}
                  onChange={(e) => setNewChatAIName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-455 mb-1">Выбрать ИИ Модель</label>
                <select
                  value={newChatModel}
                  onChange={(e) => setNewChatModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  {AVAILABLE_MODELS.map((mo) => (
                    <option key={mo.id} value={mo.id}>
                      {mo.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-455 mb-1">Промт ИИ / Инструкции Роли</label>
                <textarea
                  placeholder="Опишите характер, манеру речи и задачи ИИ. К какому настроению стремиться..."
                  value={newChatPrompt}
                  onChange={(e) => setNewChatPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-755 text-slate-350 rounded-xl transition font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl transition font-bold"
                >
                  Создать сессию
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit current game prompt & character name */}
      {showEditPromptModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in font-sans fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
              <Edit className="w-5 h-5 text-indigo-400" />
              <span>Редактировать промпт и роль ИИ</span>
            </h3>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setChats((prevChats) =>
                  prevChats.map((c) => {
                    if (c.id === activeChatId) {
                      return {
                        ...c,
                        name: editingChatName,
                        aiName: editingChatAIName,
                        prompt: editingChatPrompt,
                        model: editingChatModel
                      };
                    }
                    return c;
                  })
                );
                setShowEditPromptModal(false);
                addLog("info", `Роль ИИ для игры '${editingChatName}' успешно перенастроена. Новый промпт: "${editingChatPrompt.substring(0, 40)}..."`);
                alert("🎉 Системная роль и промпт ИИ успешно обновлены!");
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Название Игры</label>
                <input
                  type="text"
                  value={editingChatName}
                  onChange={(e) => setEditingChatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Имя Вашего ИИ-Персонажа</label>
                <input
                  type="text"
                  value={editingChatAIName}
                  onChange={(e) => setEditingChatAIName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">ИИ Модель</label>
                <select
                  value={editingChatModel}
                  onChange={(e) => setEditingChatModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  {AVAILABLE_MODELS.map((mo) => (
                    <option key={mo.id} value={mo.id}>
                      {mo.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Промт ИИ / Характер и Контекст у роли</label>
                <textarea
                  value={editingChatPrompt}
                  onChange={(e) => setEditingChatPrompt(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none font-mono"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditPromptModal(false)}
                  className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl transition font-bold"
                >
                  Сохранить настройки
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Guide on how to download and execute locally on PC */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl animate-in font-sans fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] scrollbar-thin">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
              <ExternalLink className="w-5 h-5 text-indigo-400" />
              <span>Инструкция по установке и запуску на локальном ПК</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                Вы можете скачать это приложение полностью со всеми файлами в виде ZIP, настроить запуск в один клик и играть с ИИ локально у себя на компьютере!
              </p>

              <div>
                <span className="font-bold text-white block mb-1">Шаг 1: Скачивание проекта</span>
                <p>Экспортируйте данный Workspace в Zip-архив с помощью меню настроек справа сверху и распакуйте в любую удобную пустую папку на вашем ПК.</p>
              </div>

              <div>
                <span className="font-bold text-white block mb-1">Шаг 2: Установка окружения Node.js</span>
                <p>Убедитесь, что у вас установлен Node.js (версия 18 или выше). Вы можете скачать его с официального веб-сайта nodejs.org.</p>
              </div>

              <div>
                <span className="font-bold text-white block mb-1 font-mono">Шаг 3: Быстрый запуск в один клик</span>
                <p>Откройте консоль у себя в папке с проектом и запустите две команды:</p>
                <pre className="p-3 bg-slate-950 rounded-lg text-indigo-300 border border-slate-850 mt-1 select-all font-mono whitespace-pre-wrap">
                  npm install
                </pre>
                <pre className="p-3 bg-slate-950 rounded-lg text-indigo-300 border border-slate-850 mt-1 select-all font-mono whitespace-pre-wrap">
                  npm run dev
                </pre>
              </div>

              <div>
                <span className="font-bold text-white block mb-1">Шаг 4: Настройка переменной окружения</span>
                <p>Создайте файл <code className="font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-800 text-rose-350">.env</code> в вашей корневой папке и разместите там ваш ключ Gemini, чтобы не вводить его каждый раз вручную:</p>
                <pre className="p-3 bg-slate-950 rounded-lg text-rose-300 border border-slate-850 mt-1 font-mono whitespace-pre text-[11px] block">
{`GEMINI_API_KEY="AQ.Ab8RN6JFXwxCQ7UAZuIOyzdECTZHPedEfxmFj8mjH3uwkzPuHw"
NODE_ENV="development"`}
                </pre>
              </div>

              <div className="bg-indigo-950/20 p-3 rounded-lg border border-indigo-900/35">
                <span className="font-bold text-indigo-400 block mb-1">🎉 Особенности для стримов и игр:</span>
                <p>На локальном ПК браузер позволит вам транслировать любое окно запущенной игры, эмулятор, YouTube стрим или весь экран целиком. ИИ будет пассивно мониторить прохождение с выбранной частотой.</p>
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-850 mt-4">
              <button
                onClick={() => setShowInstallGuideModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                Понятно, продолжить игру
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
