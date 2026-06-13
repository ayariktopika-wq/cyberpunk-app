import React, { useState } from "react";
import { SkillNode, SkillAttribute } from "../types";
import { 
  GitCommit, 
  GitMerge, 
  Plus, 
  Trash2, 
  Award, 
  CheckCircle, 
  Unlock, 
  Lock, 
  Layers, 
  Sparkles, 
  Settings,
  HelpCircle,
  TrendingUp,
  Cpu,
  RefreshCw,
  Zap,
  Shield,
  Eye,
  Crosshair,
  UserCheck
} from "lucide-react";

interface SkillsTabProps {
  skills: SkillNode[];
  attributes: SkillAttribute[];
  skillPoints: number;
  attributePoints: number;
  onUpdateSkillPoints: (val: number) => void;
  onUpdateAttributePoints: (val: number) => void;
  onAddSkill: (
    name: string,
    description: string,
    branch: string,
    dependsOn: string[],
    requiredAttributeId?: string,
    requiredAttributeValue?: number,
    cost?: number,
    customId?: string
  ) => void;
  onToggleSkillPurchased: (id: string) => void;
  onDeleteSkill: (id: string) => void;
  onAddAttribute: (name: string, value: number, customId?: string) => void;
  onUpdateAttributeValue: (id: string, value: number) => void;
  onDeleteAttribute: (id: string) => void;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({
  skills,
  attributes,
  skillPoints,
  attributePoints,
  onUpdateSkillPoints,
  onUpdateAttributePoints,
  onAddSkill,
  onToggleSkillPurchased,
  onDeleteSkill,
  onAddAttribute,
  onUpdateAttributeValue,
  onDeleteAttribute
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillDesc, setSkillDesc] = useState("");
  const [skillBranch, setSkillBranch] = useState("");
  const [dependsOn, setDependsOn] = useState<string[]>([]);
  const [skillCost, setSkillCost] = useState(1);
  const [requiredAttrId, setRequiredAttrId] = useState("");
  const [requiredAttrValue, setRequiredAttrValue] = useState(3);

  const [attrName, setAttrName] = useState("");
  const [attrVal, setAttrVal] = useState(3);
  const [showAttrForm, setShowAttrForm] = useState(false);
  
  // Tab filters for Cyberpunk branches
  const [selectedBranchTab, setSelectedBranchTab] = useState<string>("all");

  // Helper to pre-populate Cyberpunk 2077 attributes and skill nodes
  const handleSeedCyberpunkDeck = () => {
    // 1. Clear current database entries
    attributes.forEach((a) => onDeleteAttribute(a.id));
    skills.forEach((s) => onDeleteSkill(s.id));

    // Reset points
    onUpdateSkillPoints(15);
    onUpdateAttributePoints(20);

    setTimeout(() => {
      // 2. Add default 5 cyberpunk attributes with custom static IDs
      onAddAttribute("Сила (Body)", 3, "cyber-body");
      onAddAttribute("Реакция (Reflexes)", 3, "cyber-reflex");
      onAddAttribute("Техническое умение (Tech)", 3, "cyber-tech");
      onAddAttribute("Интеллект (Intelligence)", 3, "cyber-intel");
      onAddAttribute("Хладнокровие (Cool)", 3, "cyber-cool");

      // 3. Add default connected skills!
      setTimeout(() => {
        // --- BODY SKILLS ---
        onAddSkill(
          "Регенерация (Regeneration)", 
          "Пассивно восстанавливает здоровье в бою на 10% каждые 3 секунды.", 
          "Сила (Body)", 
          [], 
          "cyber-body", 
          3, 
          1, 
          "cyber-regen"
        );
        onAddSkill(
          "Стальное сердце (Heart of Steel)", 
          "Повышает максимальное здоровье на 25% и выносливость на 15%.", 
          "Сила (Body)", 
          ["cyber-regen"], 
          "cyber-body", 
          6, 
          1, 
          "cyber-steelheart"
        );
        onAddSkill(
          "Дробовики: Разрушение", 
          "Выстрелы из дробовиков сбивают врагов с ног с вероятностью 40%.", 
          "Сила (Body)", 
          ["cyber-steelheart"], 
          "cyber-body", 
          12, 
          2, 
          "cyber-shotgun"
        );

        // --- REFLEXES SKILLS ---
        onAddSkill(
          "Мягкое приземление", 
          "Урон от падения уменьшается на 50%. Позволяет совершать прыжки с уклонением.", 
          "Реакция (Reflexes)", 
          [], 
          "cyber-reflex", 
          3, 
          1, 
          "cyber-softland"
        );
        onAddSkill(
          "Керезников (Kerenzikov)", 
          "Позволяет целиться и стрелять во время скольжения и уклонения, замедляя время на 60%.", 
          "Реакция (Reflexes)", 
          ["cyber-softland"], 
          "cyber-reflex", 
          8, 
          2, 
          "cyber-kerenzikov"
        );
        onAddSkill(
          "Синхро-ускоритель (Air Dash)", 
          "Позволяет совершать мощный рывок вперед прямо в воздухе во время прыжка.", 
          "Реакция (Reflexes)", 
          ["cyber-kerenzikov"], 
          "cyber-reflex", 
          15, 
          3, 
          "cyber-synchro"
        );

        // --- INTELLIGENCE SKILLS ---
        onAddSkill(
          "Netrunner v1.0", 
          "Разблокирует базовую возможность загружать вирусы и скрипты врагам.", 
          "Интеллект (Intelligence)", 
          [], 
          "cyber-intel", 
          3, 
          1, 
          "cyber-quicker"
        );
        onAddSkill(
          "Замыкание (Short Circuit)", 
          "Быстрый взлом наносит мощный электромагнитный урон микросхемам и имплантам противников.", 
          "Интеллект (Intelligence)", 
          ["cyber-quicker"], 
          "cyber-intel", 
          7, 
          1, 
          "cyber-shortcircuit"
        );
        onAddSkill(
          "Плавление синапсов (Synapse Burnout)", 
          "Вражеский мозг закипает, нанося колоссальный урон. +25% урона за каждый дебафф.", 
          "Интеллект (Intelligence)", 
          ["cyber-shortcircuit"], 
          "cyber-intel", 
          12, 
          2, 
          "cyber-synapse"
        );
        onAddSkill(
          "Протокол бреши (Breach Protocol)", 
          "Загружает скрипт Icepick, снижая стоимость оперативной памяти всех быстрых взломов на 30%.", 
          "Интеллект (Intelligence)", 
          ["cyber-synapse"], 
          "cyber-intel", 
          16, 
          3, 
          "cyber-breach"
        );

        // --- COOL SKILLS ---
        onAddSkill(
          "Крадущийся тигр", 
          "Повышает скорость передвижения в режиме скрытности на 30%.", 
          "Хладнокровие (Cool)", 
          [], 
          "cyber-cool", 
          3, 
          1, 
          "cyber-crouch"
        );
        onAddSkill(
          "Тихий киллер (Silent Strike)", 
          "Оружие с глушителем наносит на 65% больше урона при стрельбе из укрытия или из стелса.", 
          "Хладнокровие (Cool)", 
          ["cyber-crouch"], 
          "cyber-cool", 
          7, 
          1, 
          "cyber-silentkiller"
        );
        onAddSkill(
          "Удар из тени (Assassin)", 
          "Критический урон увеличивается на 40% при атаке ничего не подозревающих целей.", 
          "Хладнокровие (Cool)", 
          ["cyber-silentkiller"], 
          "cyber-cool", 
          12, 
          2, 
          "cyber-shadowstrike"
        );

        // --- TECHNICAL SKILLS & HYBRIDS ---
        onAddSkill(
          "Мастер-инженер", 
          "Снижает отдачу умного и технического оружия на 20%.", 
          "Техническое умение (Tech)", 
          [], 
          "cyber-tech", 
          3, 
          1, 
          "cyber-engineer"
        );
        onAddSkill(
          "Перегрузка имплантов", 
          "Разблокирует 2 дополнительных слота под киберимпланты и увеличивает лимит емкости на 50.", 
          "Техническое умение (Tech)", 
          ["cyber-engineer"], 
          "cyber-tech", 
          8, 
          2, 
          "cyber-implantoverload"
        );

        // --- SPECIAL HYBRID MULTI-BRANCH DEPENDENCY SKILLS (as requested by user!) ---
        onAddSkill(
          "💡 КИБЕРХАОС: УПРАВЛЕНИЕ РАЗУМОМ", 
          "Экстремальный гибридный скрипт! Перенаправляет нейронный трафик врагов. [Требует купленные Замыкание (Short Circuit) И Тихий киллер!]", 
          "Интеллект (Intelligence)", 
          ["cyber-shortcircuit", "cyber-silentkiller"], 
          "cyber-intel", 
          9, 
          2, 
          "cyber-chaos"
        );
        onAddSkill(
          "💡 СВЕРХПРОВОДНИКОВАЯ ДЕКА", 
          "Элитная надстройка нетраннера. Скрипты автоматически пробивают броню до 100%. [Требует купленные Плавление синапсов И Керезников!]", 
          "Техническое умение (Tech)", 
          ["cyber-synapse", "cyber-kerenzikov"], 
          "cyber-tech", 
          10, 
          3, 
          "cyber-overdrive"
        );
      }, 100);
    }, 100);
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim() || !skillBranch.trim()) return;

    onAddSkill(
      skillName, 
      skillDesc, 
      skillBranch, 
      dependsOn, 
      requiredAttrId || undefined, 
      requiredAttrId ? requiredAttrValue : undefined,
      skillCost
    );

    setSkillName("");
    setSkillDesc("");
    setSkillBranch("");
    setDependsOn([]);
    setSkillCost(1);
    setRequiredAttrId("");
    setRequiredAttrValue(3);
    setShowAddForm(false);
  };

  const handleCreateAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName.trim()) return;
    onAddAttribute(attrName, attrVal);
    setAttrName("");
    setAttrVal(3);
    setShowAttrForm(false);
  };

  const handleToggleDependency = (id: string) => {
    if (dependsOn.includes(id)) {
      setDependsOn(dependsOn.filter(d => d !== id));
    } else {
      if (dependsOn.length >= 2) {
        alert("В киберпанке навык может зависеть максимум от 2 родительских умений (ветвей)!");
        return;
      }
      setDependsOn([...dependsOn, id]);
    }
  };

  // Check if skill parameters permit purchasing
  const isAvailable = (skill: SkillNode) => {
    // 1. Check parent dependencies
    if (skill.dependsOn && skill.dependsOn.length > 0) {
      const parentCheck = skill.dependsOn.every(depId => {
        const depSkill = skills.find(s => s.id === depId);
        return depSkill ? depSkill.purchased : false;
      });
      if (!parentCheck) return false;
    }
    // 2. Check attribute requirement
    if (skill.requiredAttributeId) {
      const attr = attributes.find(a => a.id === skill.requiredAttributeId);
      if (!attr || attr.value < (skill.requiredAttributeValue || 0)) {
        return false;
      }
    }
    return true;
  };

  // Group skills by branch for tabs
  const branches = Array.from(new Set(skills.map(s => s.branch || "Общие"))).filter(Boolean);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full overflow-hidden font-sans text-xs" id="skills-deck-panel">
      
      {/* COLUMN 1: Attributes & Manual Point Tweaks */}
      <div className="xl:col-span-1 space-y-4 flex flex-col h-full bg-slate-900/60 p-4 border border-slate-800 rounded-2xl overflow-y-auto scrollbar-thin">
        
        {/* Core Deck Stats: Points Pools */}
        <div className="bg-slate-950 p-3.5 border border-rose-950/40 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-650/5 blur-3xl pointer-events-none" />
          <h3 className="text-[10px] font-mono uppercase tracking-wider text-rose-450 font-bold mb-3 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-rose-400" />
            <span>Баланс тактической деки</span>
          </h3>

          <div className="space-y-2.5">
            {/* Skill Points adjustment */}
            <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-850">
              <div>
                <span className="text-[9px] text-slate-500 font-bold font-mono uppercase">Очки Навыков (Skill Points)</span>
                <p className="text-sm font-bold font-mono text-slate-200 mt-0.5">{skillPoints}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onUpdateSkillPoints(skillPoints - 1)}
                  className="w-6 h-6 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-400 font-bold font-mono rounded transition flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => onUpdateSkillPoints(skillPoints + 1)}
                  className="w-6 h-6 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-rose-400 font-bold font-mono rounded transition flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Attribute Points adjustment */}
            <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-850">
              <div>
                <span className="text-[9px] text-slate-500 font-bold font-mono uppercase">Очки Спецификации (Attr Points)</span>
                <p className="text-sm font-bold font-mono text-indigo-400 mt-0.5">{attributePoints}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onUpdateAttributePoints(attributePoints - 1)}
                  className="w-6 h-6 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-400 font-bold font-mono rounded transition flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => onUpdateAttributePoints(attributePoints + 1)}
                  className="w-6 h-6 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-indigo-400 font-bold font-mono rounded transition flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Quick preset seed button */}
          <button
            onClick={handleSeedCyberpunkDeck}
            className="w-full mt-3 py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-450 hover:text-rose-400 rounded-lg text-[10px] font-bold font-mono uppercase transition flex items-center justify-center gap-1.5"
            title="Загрузить готовую схему навыков Cyberpunk 2077"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-400 animate-spin-slow" />
            <span>Инициализировать Деку Cyberpunk 2077</span>
          </button>
        </div>

        {/* Dynamic Attributes Editor list */}
        <div className="bg-slate-950/40 p-3.5 border border-slate-850 rounded-xl">
          <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
            <h4 className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Характеристики (Specs)</span>
            </h4>
            <button
              onClick={() => setShowAttrForm(!showAttrForm)}
              className="p-1 bg-slate-900 border border-slate-800 text-slate-450 hover:text-white rounded transition"
              title="Добавить характеристику"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {showAttrForm && (
            <form onSubmit={handleCreateAttribute} className="mb-3 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div>
                <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Название:</label>
                <input
                  type="text"
                  placeholder="Сила, Реакция, Магия..."
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center justify-between gap-2.5">
                <div>
                  <label className="block text-[9px] uppercase font-mono text-slate-500 mb-1">Значение:</label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={attrVal}
                    onChange={(e) => setAttrVal(parseInt(e.target.value) || 3)}
                    className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 self-end text-[10px] pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAttrForm(false)}
                    className="px-2.5 py-1.5 bg-slate-900 text-slate-500 rounded transition"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500 transition"
                  >
                    ОК
                  </button>
                </div>
              </div>
            </form>
          )}

          {attributes.length === 0 ? (
            <p className="text-[10px] text-slate-600 italic text-center py-4">Нажмите кнопку выше или инициируйте деку для разблокировки характеристик.</p>
          ) : (
            <div className="space-y-1.5">
              {attributes.map((attr) => (
                <div 
                  key={attr.id} 
                  className="p-2.5 bg-slate-950/80 border border-slate-850 hover:border-slate-800 rounded-lg flex items-center justify-between transition"
                  style={{ contentVisibility: "auto" }}
                >
                  <div className="font-mono">
                    <p className="text-xs font-bold text-slate-350">{attr.name}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Значение: {attr.value}/20</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateAttributeValue(attr.id, attr.value - 1)}
                      className="w-5 h-5 bg-slate-900 text-slate-450 hover:text-white hover:bg-slate-800 rounded font-bold transition flex items-center justify-center text-[10px]"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-rose-450 min-w-4 text-center">{attr.value}</span>
                    <button
                      onClick={() => onUpdateAttributeValue(attr.id, attr.value + 1)}
                      className="w-5 h-5 bg-slate-900 text-slate-450 hover:text-white hover:bg-slate-800 rounded font-bold transition flex items-center justify-center text-[10px]"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onDeleteAttribute(attr.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Static Prompt Sandbox Helper */}
        <div className="bg-rose-950/5 border border-rose-950/30 p-3.5 rounded-xl text-[11px] text-slate-400 leading-relaxed space-y-2">
          <div className="flex items-center gap-1.5 text-rose-450 font-bold uppercase font-mono text-[10px]">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Связь с Netrunner-ИИ</span>
          </div>
          <p>
            Спецификация Вашей деки напрямую транслируется Т-Баг. Попробуйте спросить её:
          </p>
          <div className="bg-slate-950 p-1.5 rounded border border-rose-950/20 font-mono text-[10px] text-rose-350 select-all">
            "Проанализируй мои очки Specs и скажи каков мой стиль игры: нетраннер, соло или ниндзя?"
          </div>
        </div>

      </div>

      {/* COLS 2-4: Interactive Multi-branch Skill Tree screen */}
      <div className="xl:col-span-3 flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Futuristic Dashboard Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono text-[8px] uppercase font-bold tracking-widest animate-pulse">
                kope_t-bug_os_v4.2
              </span>
              <span className="text-slate-600 font-mono text-[9px] hidden md:inline">|</span>
              <span className="text-[10px] text-slate-450 font-mono uppercase tracking-wider hidden md:inline">Сеть тактических скриптов</span>
            </div>
            <h2 className="text-base font-extrabold text-white tracking-wide mt-1 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" />
              <span>Древо Спец-Скриптов & Навыков</span>
            </h2>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-550 text-white rounded-lg transition font-mono uppercase font-bold tracking-wider text-[10px] flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? "Закрыть форму" : "Создать Скрипт"}</span>
          </button>
        </div>

        {/* Add custom skill complex form */}
        {showAddForm && (
          <div className="p-4 bg-slate-950 border-b border-slate-850 max-h-[70%] overflow-y-auto scrollbar-thin">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              <span>Конфигуратор нового скрипта (узла)</span>
            </h3>

            <form onSubmit={handleCreateSkill} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Branch name */}
                <div>
                  <label className="block text-[10px] font-bold font-mono uppercase text-slate-450 mb-1">Вкладка / Ветка навыков:</label>
                  <input
                    type="text"
                    placeholder="Напр., Сила (Body)"
                    value={skillBranch}
                    onChange={(e) => setSkillBranch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-650"
                    required
                  />
                  {branches.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {branches.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSkillBranch(b)}
                          className="text-[9px] bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-850 text-rose-400 px-1.5 py-0.5 rounded transition"
                        >
                          + {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Point cost */}
                <div>
                  <label className="block text-[10px] font-bold font-mono uppercase text-slate-450 mb-1">Стоимость (Очки навыков):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={skillCost}
                    onChange={(e) => setSkillCost(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    required
                  />
                </div>

                {/* Prerequisite Specs */}
                <div>
                  <label className="block text-[10px] font-bold font-mono uppercase text-slate-450 mb-1">Требуемая Характеристика:</label>
                  <select
                    value={requiredAttrId}
                    onChange={(e) => setRequiredAttrId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-350"
                  >
                    <option value="">-- Без требований --</option>
                    {attributes.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Prerequisite Spec Value */}
                {requiredAttrId && (
                  <div>
                    <label className="block text-[10px] font-bold font-mono uppercase text-slate-450 mb-1">Мин. уровень Specs:</label>
                    <input
                      type="number"
                      min="3"
                      max="20"
                      value={requiredAttrValue}
                      onChange={(e) => setRequiredAttrValue(parseInt(e.target.value) || 3)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Parents / Dependencies Checklist */}
              <div>
                <label className="block text-[10px] font-bold font-mono uppercase text-slate-450 mb-1">
                  Зависит от навыков (Максимум 2 parent-узла в деке):
                </label>
                {skills.length === 0 ? (
                  <p className="text-[10px] text-slate-650 italic">Сначала добавьте другие навыки, чтобы связать узлы с ними.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-24 overflow-y-auto p-2 bg-slate-950 border border-slate-850 rounded-lg scrollbar-thin">
                    {skills.map((s) => {
                      const isChecked = dependsOn.includes(s.id);
                      return (
                        <label 
                          key={s.id} 
                          className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition select-none ${
                            isChecked
                              ? "bg-rose-500/10 border-rose-500/40 text-rose-350"
                              : "bg-slate-900 border-slate-850 text-slate-450 hover:bg-slate-850"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleDependency(s.id)}
                            className="rounded accent-rose-500"
                          />
                          <div className="truncate">
                            <span className="text-[9px] uppercase font-mono block text-slate-500">[{s.branch}]</span>
                            <span className="text-[11px] font-semibold block truncate leading-tight">{s.name}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                <div>
                  <label className="block text-[10px] font-bold font-mono uppercase text-slate-450 mb-1">Название Скрипта / Узла:</label>
                  <input
                    type="text"
                    placeholder="Напр., Копирование памяти"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold font-mono uppercase text-slate-450 mb-1">Описание / Тактические свойства:</label>
                  <input
                    type="text"
                    placeholder="Какое преимущество или кибернетическое улучшение дает..."
                    value={skillDesc}
                    onChange={(e) => setSkillDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 font-mono uppercase bg-slate-900 text-slate-500 rounded hover:bg-slate-850 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-mono uppercase bg-rose-600 hover:bg-rose-550 text-white rounded font-extrabold transition"
                >
                  Интегрировать в дерево
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Multi-Tab Filter selection */}
        {branches.length > 0 && (
          <div className="p-3 bg-slate-950/60 border-b border-slate-850 scrollbar-none overflow-x-auto flex items-center gap-1.5">
            <button
              onClick={() => setSelectedBranchTab("all")}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded transition-all shrink-0 ${
                selectedBranchTab === "all"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  : "bg-slate-950 text-slate-450 border border-slate-850 hover:text-slate-200"
              }`}
            >
              🌌 Все ветки ({skills.length})
            </button>
            {branches.map(branch => (
              <button
                key={branch}
                onClick={() => setSelectedBranchTab(branch)}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded transition-all shrink-0 ${
                  selectedBranchTab === branch
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "bg-slate-950 text-slate-450 border border-slate-850 hover:text-slate-200"
                }`}
              >
                💾 {branch} ({skills.filter(s => s.branch === branch).length})
              </button>
            ))}
          </div>
        )}

        {/* Tree Render viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
          {skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center max-w-sm mx-auto">
              <Cpu className="w-12 h-12 text-rose-950/70 mb-3 animate-pulse" />
              <p className="font-bold text-slate-350 uppercase font-mono tracking-wider">Дека пуста</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Разверните готовую схему кнопкой <strong className="text-rose-400">Инициализировать Деку Cyberpunk 2077</strong> слева или соберите кастомную ветку с нуля!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {branches
                .filter(b => selectedBranchTab === "all" || b === selectedBranchTab)
                .map((branchName) => {
                  const branchSkills = skills.filter((s) => s.branch === branchName);

                  return (
                    <div key={branchName} className="space-y-3.5" style={{ contentVisibility: "auto" }}>
                      {/* Branch Category Label */}
                      <div className="flex items-center gap-2 border-b border-rose-950/30 pb-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                          {branchName} ({branchSkills.length})
                        </h4>
                      </div>

                      {/* Skills Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {branchSkills.map((skill) => {
                          const canBuy = isAvailable(skill);
                          const isBought = skill.purchased;

                          // Find dependency labels
                          const depNames = skill.dependsOn
                            .map((depId) => skills.find((s) => s.id === depId)?.name)
                            .filter(Boolean);

                          // Find attribute requirement text
                          let attrText = "";
                          if (skill.requiredAttributeId) {
                            const attrObj = attributes.find(a => a.id === skill.requiredAttributeId);
                            attrText = `${attrObj?.name || "Specs"} ${skill.requiredAttributeValue}+`;
                          }

                          return (
                            <div 
                              key={skill.id}
                              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-200 relative ${
                                isBought
                                  ? "bg-rose-950/15 border-rose-500 text-slate-200 shadow-md shadow-rose-950/10"
                                  : canBuy
                                  ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                                  : "bg-slate-950/70 border-slate-900 opacity-55 text-slate-500"
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-1.5 mb-2">
                                  {/* Buy toggle trigger */}
                                  <button
                                    onClick={() => onToggleSkillPurchased(skill.id)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold font-mono transition uppercase ${
                                      isBought
                                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50"
                                        : canBuy
                                        ? "bg-slate-950 hover:bg-slate-850 hover:text-white text-rose-400 border border-slate-850"
                                        : "bg-slate-950/20 text-slate-650 border-transparent cursor-not-allowed"
                                    }`}
                                  >
                                    {isBought ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 text-rose-400" />
                                        <span>АКТИВЕН</span>
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="w-3 h-3 text-rose-500" />
                                        <span>КУПИТЬ [{skill.cost || 1}]</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => onDeleteSkill(skill.id)}
                                    className="p-1 hover:bg-slate-950 rounded text-slate-650 hover:text-rose-400 transition"
                                    title="Удалить скрипт"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                <h5 className={`text-xs font-bold font-sans ${isBought ? "text-rose-300" : "text-slate-200"}`}>
                                  {skill.name}
                                </h5>

                                <p className="text-[11px] text-slate-400 font-sans mt-1 leading-normal">
                                  {skill.description}
                                </p>
                              </div>

                              {/* Attributes and Dependencies Footer widgets */}
                              <div className="mt-3.5 pt-2 border-t border-slate-850/80 flex flex-wrap gap-1.5 items-center justify-between text-[9px] font-mono">
                                
                                {/* Spec requirement display */}
                                {attrText && (
                                  <div className="flex items-center gap-1 text-slate-450 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">
                                    <Award className="w-2.5 h-2.5 text-indigo-400" />
                                    <span>Треб: {attrText}</span>
                                  </div>
                                )}

                                {/* Cost badge */}
                                <div className="text-slate-500 ml-auto">
                                  Затраты: <span className="text-rose-400 font-bold">{skill.cost || 1} очк.</span>
                                </div>
                              </div>

                              {/* Parental Dependency Lines Link */}
                              {depNames.length > 0 && (
                                <div className="mt-2 text-[9px] font-mono text-slate-500 border-t border-slate-850/40 pt-1.5">
                                  <p className="flex items-center gap-1">
                                    <GitMerge className="w-2.5 h-2.5 text-slate-500" />
                                    <span>Требует узлы:</span>
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {depNames.map((n, idx) => (
                                      <span 
                                        key={idx}
                                        className="bg-slate-950 text-rose-350/80 px-1 py-0.5 rounded border border-slate-850/50"
                                      >
                                        {n}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
