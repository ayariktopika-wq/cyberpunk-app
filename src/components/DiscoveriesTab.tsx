import React, { useState } from "react";
import { Discovery, DiscoveryCategory, DiaryEntry } from "../types";
import { 
  Plus, 
  Crosshair, // Заказы (Gigs)
  Flag, // Квесты (Quests)
  Heart, // Отношения (Relationships)
  User, // Персонаж (Characters)
  Cpu, // Импланты (Cyberware)
  Search, // Зацепки / Улики (Clues)
  Trash2, 
  Check, 
  X, 
  Edit, 
  Sparkles, 
  AlertTriangle,
  BookOpen,
  Calendar
} from "lucide-react";

interface DiscoveriesTabProps {
  discoveries: Discovery[];
  diaryEntries: DiaryEntry[];
  onDeleteDiaryEntry: (id: string) => void;
  onAddDiscovery: (category: DiscoveryCategory, title: string, description: string, importance: Discovery["importance"]) => void;
  onAcceptDiscovery: (id: string) => void;
  onDeclineDiscovery: (id: string) => void;
  onDeleteDiscovery: (id: string) => void;
  onUpdateDiscovery: (id: string, title: string, description: string, category: DiscoveryCategory, importance: Discovery["importance"]) => void;
}

export const DiscoveriesTab: React.FC<DiscoveriesTabProps> = ({
  discoveries,
  diaryEntries = [],
  onDeleteDiaryEntry,
  onAddDiscovery,
  onAcceptDiscovery,
  onDeclineDiscovery,
  onDeleteDiscovery,
  onUpdateDiscovery
}) => {
  const [subTab, setSubTab] = useState<"gear" | "diary">("gear");
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for adding/editing
  const [formCategory, setFormCategory] = useState<DiscoveryCategory>("quest");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImportance, setFormImportance] = useState<Discovery["importance"]>("normal");

  const categoryLabels: Record<DiscoveryCategory, { label: string; icon: any; color: string; bg: string; borderColor: string }> = {
    gig: { label: "Заказ", icon: Crosshair, color: "text-[#fcee0a]", bg: "bg-[#fcee0a]/10", borderColor: "border-[#fcee0a]/50" },
    quest: { label: "Квест", icon: Flag, color: "text-[#00f0ff]", bg: "bg-[#00f0ff]/10", borderColor: "border-[#00f0ff]/50" },
    relationship: { label: "Отношения", icon: Heart, color: "text-[#ff00ff]", bg: "bg-[#ff00ff]/10", borderColor: "border-[#ff00ff]/50" },
    character: { label: "Персонаж", icon: User, color: "text-[#ff9900]", bg: "bg-[#ff9900]/10", borderColor: "border-[#ff9900]/50" },
    cyberware: { label: "Имплант", icon: Cpu, color: "text-[#00ff66]", bg: "bg-[#00ff66]/10", borderColor: "border-[#00ff66]/50" },
    clue: { label: "Зацепка", icon: Search, color: "text-rose-450", bg: "bg-rose-950/20", borderColor: "border-rose-500/50" }
  };

  const handleOpenAddForm = () => {
    setFormCategory("quest");
    setFormTitle("");
    setFormDescription("");
    setFormImportance("normal");
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleOpenEditForm = (item: Discovery) => {
    setEditingId(item.id);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormImportance(item.importance);
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    if (editingId) {
      onUpdateDiscovery(editingId, formTitle, formDescription, formCategory, formImportance);
    } else {
      onAddDiscovery(formCategory, formTitle, formDescription, formImportance);
    }
    setShowAddForm(false);
  };

  const filteredDiscoveries = discoveries.filter(
    (dis) => (activeCategory === "all" || dis.category === activeCategory)
  );

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.15)]" id="discoveries-journal-view">
      {/* Tab Header with cyberpunk aesthetic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#0e0e12] border-b border-cyan-500/20 relative gap-4">
        <div className="absolute right-4 top-2 pointer-events-none opacity-20 hidden md:block">
          <span className="text-[10px] font-mono text-cyan-500">SECURE_DATAPACK // CLASSIFIED</span>
        </div>
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-[#fcee0a] font-mono block mb-1">
            🖥️ ДЕКА НЕТРАННЕРА // БАЗА ДАННЫХ
          </span>
          <h2 className="text-lg font-black text-white tracking-tight uppercase">Игровой журнал & Зацепки</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tab selection hooks */}
          <div className="flex bg-black/60 p-0.5 rounded-lg border border-slate-805 font-mono">
            <button
              onClick={() => setSubTab("gear")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                subTab === "gear"
                  ? "bg-cyan-500/10 text-[#00f0ff]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🎒 Снаряжение
            </button>
            <button
              onClick={() => setSubTab("diary")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                subTab === "diary"
                  ? "bg-cyan-500/10 text-[#00f0ff]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📓 Дневник ({diaryEntries.length})
            </button>
          </div>

          {subTab === "gear" && (
            <button
              onClick={handleOpenAddForm}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-[#fcee0a] hover:bg-[#ebd300] text-black rounded-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-mono tracking-wider"
            >
              <Plus className="w-4 h-4 text-black stroke-[3px]" />
              <span>ДОБАВИТЬ ЗАПИСЬ</span>
            </button>
          )}
        </div>
      </div>

      {/* Cyberpunk Category selector - ONLY rendered if in 'gear' subtab */}
      {subTab === "gear" && (
        <div className="flex p-3 bg-[#0d0d10] border-b border-cyan-500/20 overflow-x-auto gap-2 scrollbar-none items-center font-mono">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded transition shrink-0 border ${
              activeCategory === "all"
                ? "bg-[#00f0ff] border-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800"
            }`}
          >
            ВСЕ ({discoveries.length})
          </button>
          {(Object.keys(categoryLabels) as DiscoveryCategory[]).map((cat) => {
            const cfg = categoryLabels[cat];
            const count = discoveries.filter((d) => d.category === cat).length;
            const Icon = cfg.icon;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded transition shrink-0 border uppercase ${
                  isActive
                    ? "bg-slate-900 text-white border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "bg-black text-slate-400 hover:text-slate-200 border-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                <span className={isActive ? cfg.color : ""}>{cfg.label} ({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content area based on subTab */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#08080a] relative">
        {/* Ambient background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-40"></div>

        {subTab === "diary" ? (
          /* DIARY LOGS VIEW */
          <div className="space-y-5 relative z-10 font-mono">
            <h4 className="text-xs font-black font-mono tracking-wider text-[#00f0ff] flex items-center gap-1.5 uppercase mb-4">
              <span>[+] ХРОНО_ЛОГИ СЕССИЙ (БОРТОВОЙ ЖУРНАЛ КВЕСТОВ)</span>
            </h4>

            {diaryEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-450 text-center border border-dashed border-cyan-500/10 rounded-xl">
                <BookOpen className="w-10 h-10 text-cyan-500/30 mb-3 animate-pulse" />
                <p className="text-sm font-bold text-slate-300 uppercase">ЖУРНАЛ ПУСТ</p>
                <p className="text-xs text-slate-500 mt-2 max-w-sm px-6 font-sans">
                  Здесь сохраняются сводки ваших дней. Кликните на кнопку **"Закончить день"** в шапке чата по завершении игровой сессии, чтобы ИИ сгенерировал атмосферный лог пройденного!
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {[...diaryEntries].reverse().map((entry) => (
                  <div 
                    key={entry.id}
                    className="relative bg-black/75 hover:bg-[#0c0c11] border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl p-5 md:p-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-150"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-3 mb-3.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-cyan-950/40 text-[#00f0ff] border border-cyan-900/60 font-black text-[10px] rounded uppercase tracking-widest leading-none">
                          {entry.dateString || "ДЕНЬ_X"}
                        </span>
                        <h4 className="text-sm font-black text-[#fcee0a] uppercase tracking-wide">
                          {entry.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm("Вы действительно хотите удалить эту дневниковую запись?")) {
                              onDeleteDiaryEntry(entry.id);
                            }
                          }}
                          className="p-1 px-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded border border-transparent hover:border-red-900/30 transition text-[10px] font-bold"
                          title="Стереть запись дня"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap select-text selection:bg-cyan-900/40 tracking-wide font-normal">
                      {entry.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* GEAR & DISCOVERIES VIEW */
          <div className="space-y-6 relative z-10">
            {/* Form Overlay */}
            {showAddForm && (
              <div className="bg-[#111116] border border-[#fcee0a]/50 rounded-xl p-5 shadow-[0_0_15px_rgba(252,238,10,0.1)] transition-all font-mono mb-6">
                <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-[#fcee0a] text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  REWRITE_MEM_BANK
                </div>
                <h3 className="text-sm font-black text-[#fcee0a] mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{editingId ? "⚡ РЕДАКТИРОВАТЬ ЗАПИСЬ" : "⚡ СОЗДАТЬ НОВЫЙ ДАТАФАЙЛ"}</span>
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Тип файла</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as DiscoveryCategory)}
                        className="w-full bg-[#070709] border border-cyan-500/30 text-slate-200 rounded px-3 py-2 text-xs focus:border-[#fcee0a]"
                      >
                        <option value="quest">🕹️ Квест / Задание</option>
                        <option value="gig">🎯 Заказ (Gig)</option>
                        <option value="relationship">💖 Отношения</option>
                        <option value="character">👤 Персонаж / Фракция</option>
                        <option value="cyberware">💾 Имплант / Экипировка</option>
                        <option value="clue">💡 Зацепка / Аналитика</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Код Важности</label>
                      <select
                        value={formImportance}
                        onChange={(e) => setFormImportance(e.target.value as Discovery["importance"])}
                        className="w-full bg-[#070709] border border-cyan-500/30 text-slate-200 rounded px-3 py-2 text-xs focus:border-[#fcee0a]"
                      >
                        <option value="normal">🟢 ОБЫЧНЫЙ ЛОГ</option>
                        <option value="major">🔵 ВАЖНЫЙ ЛОКАЛ</option>
                        <option value="critical">🔴 КРИТИЧЕСКИЙ СЕКТОР</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Идентификатор / Заголовок</label>
                    <input
                      type="text"
                      placeholder="Заголовок информации..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-[#070709] border border-cyan-500/30 text-white rounded px-3.5 py-2 text-xs focus:border-[#fcee0a] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Суть расшифровки / Лог-сведения</label>
                    <textarea
                      placeholder="Введите описание, детали, зацепки или уязвимости..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[#070709] border border-cyan-500/30 text-white rounded px-3.5 py-2 text-xs focus:border-[#fcee0a] outline-none resize-none"
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-xs bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded transition"
                    >
                      ОТМЕНА
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs bg-[#fcee0a] text-black font-black hover:bg-[#ebd300] rounded transition"
                    >
                      {editingId ? "БИНДИТЬ_ИЗМЕНЕНИЯ" : "СОДЕРЖАТЬ_В_БАЗУ"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* AI Recommendations */}
            {discoveries.some((d) => d.isAIGenerated && !d.accepted) && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono tracking-wider text-[#00f0ff] flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 animate-spin text-[#00f0ff]" style={{ animationDuration: '3s' }} />
                  <span>[!] ПОТОК ИНФЛЮКСА АССИСТЕНТА (РЕКОМЕНДОВАНО К ИНТЕГРАЦИИ)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoveries
                    .filter((d) => d.isAIGenerated && !d.accepted)
                    .map((item) => {
                      const Icon = categoryLabels[item.category]?.icon || Search;
                      const cfg = categoryLabels[item.category] || categoryLabels.clue;
                      return (
                        <div 
                          key={item.id} 
                          className="relative bg-black/45 border border-[#00f0ff]/40 rounded-xl p-4 flex flex-col justify-between hover:border-[#00f0ff] transition-all shadow-[0_0_10px_rgba(0,240,255,0.05)] duration-200 animate-pulse hover:animate-none font-mono"
                        >
                          <div className="absolute top-2 right-2 text-[8px] text-[#00f0ff]/50">
                            AI_SUGGEST_v2.0
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${cfg.bg} ${cfg.color} border ${cfg.borderColor}`}>
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 font-bold uppercase rounded ${
                                item.importance === 'critical' ? 'text-[#ff0055] bg-red-950/40 border border-red-900/60' : 
                                item.importance === 'major' ? 'text-amber-400 bg-amber-950/40 border border-amber-900/60' : 'text-slate-400'
                              }`}>
                                {item.importance === 'critical' ? 'CRITICAL_BUG' : item.importance === 'major' ? 'HIGH_PRIO' : 'INFO'}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">{item.description}</p>
                          </div>

                          <div className="flex gap-2 mt-4 pt-3 border-t border-cyan-500/10">
                            <button
                              onClick={() => onAcceptDiscovery(item.id)}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-black bg-[#00f0ff] hover:bg-[#00d0ff] border border-cyan-400 rounded transition font-black uppercase"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                              <span>ИНТЕГРИРОВАТЬ</span>
                            </button>
                            <button
                              onClick={() => onDeclineDiscovery(item.id)}
                              className="flex items-center justify-center p-1.5 text-slate-400 hover:text-[#ff0055] hover:bg-[#ff0055]/10 border border-transparent hover:border-[#ff0055]/30 rounded transition"
                              title="Удалить рекомендацию"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Default checked logs */}
            <div className="space-y-3">
              <h4 className="text-xs font-black font-mono tracking-wider text-slate-400 flex items-center gap-1.5 uppercase">
                <span>[+] АНАЛИЗИРУЕМЫЙ СЕКТОР ЖУРНАЛА</span>
              </h4>
              
              {filteredDiscoveries.filter((d) => !d.isAIGenerated || d.accepted).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center border border-dashed border-cyan-500/10 rounded-xl font-mono">
                  <Search className="w-10 h-10 text-cyan-500/40 mb-3 animate-pulse" />
                  <p className="text-sm font-bold text-slate-300 uppercase">ДЕКА ПУСТА</p>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-sm px-6 font-sans">
                    База данных чиста. Создайте файл вручную или запустите мониторинг, чтобы Netrun-ИИ ассистент обнаружил скрытые зацепки, заказы и квесты!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredDiscoveries
                    .filter((d) => !d.isAIGenerated || d.accepted)
                    .map((item) => {
                      const cfg = categoryLabels[item.category] || categoryLabels.clue;
                      const Icon = cfg.icon;
                      const isCritical = item.importance === "critical";
                      const isMajor = item.importance === "major";

                      return (
                        <div 
                          key={item.id}
                          className={`group bg-black/70 hover:bg-[#0c0c10] border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl p-4 flex flex-col justify-between transition-all duration-300 shadow-md ${
                            isCritical 
                              ? "border-l-4 border-l-[#ff0055]" 
                              : isMajor 
                                ? "border-l-4 border-l-[#fcee0a]" 
                                : "border-l-4 border-l-[#00f0ff]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${cfg.bg} ${cfg.color} border ${cfg.borderColor} font-mono`}>
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                              
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditForm(item)}
                                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 transition"
                                  title="Редактировать"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteDiscovery(item.id)}
                                  className="text-slate-400 hover:text-[#ff0055] p-1 rounded hover:bg-slate-900 transition"
                                  title="Очистить лог"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-sm font-black text-slate-100 line-clamp-2 uppercase font-mono tracking-tight">{item.title}</h4>
                            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-sans whitespace-pre-wrap">{item.description}</p>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            {item.importance !== "normal" && (
                              <span className={`flex items-center gap-1 font-bold uppercase ${
                                isCritical ? "text-[#ff0055] animate-pulse" : "text-[#fcee0a]"
                              }`}>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {item.importance === "critical" ? "КРИТИЧЕСКИЙ" : "ПРИОРИТЕТ"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
