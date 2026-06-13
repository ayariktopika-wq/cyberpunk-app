import React, { useState } from "react";
import { InventoryItem } from "../types";
import { 
  Package, 
  Plus, 
  Minus, 
  Sword, 
  Activity, 
  Shirt, 
  Key, 
  HelpCircle, 
  Trash2, 
  Home, 
  Briefcase, 
  Sparkles,
  CheckCircle,
  EyeOff
} from "lucide-react";

interface InventoryTabProps {
  items: InventoryItem[];
  gameId: string;
  onAddItem: (item: Omit<InventoryItem, "id" | "gameId" | "createdAt">) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onToggleEquipped: (id: string) => void;
  onToggleLocation: (id: string) => void;
}

export function InventoryTab({
  items,
  gameId,
  onAddItem,
  onDeleteItem,
  onUpdateQuantity,
  onToggleEquipped,
  onToggleLocation
}: InventoryTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Form states to add custom items
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"weapon" | "cyberware" | "clothing" | "quest" | "other">("weapon");
  const [location, setLocation] = useState<"inventory" | "stash">("inventory");
  const [quantity, setQuantity] = useState(1);
  const [equipped, setEquipped] = useState(false);

  // Filter items belonged to current game session
  const filteredItems = items.filter((item) => {
    const isCategoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    const isLocationMatch = selectedLocation === "all" || item.location === selectedLocation;
    return isCategoryMatch && isLocationMatch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      description: description.trim() || "Нет описания",
      category,
      location,
      quantity: Math.max(1, quantity),
      equipped: category === "quest" ? false : equipped
    });

    // Reset Form
    setName("");
    setDescription("");
    setCategory("weapon");
    setLocation("inventory");
    setQuantity(1);
    setEquipped(false);
    setShowAddForm(false);
  };

  // Preset cyber blueprints/weapons list for cyber immersion
  const loadCyberPresets = () => {
    const presets = [
      { name: "Пистолет «Liberty» (Поношенный)", description: "Стандартный 9-мм пистолет производства Ночного Города. Дешевый, но безотказный.", category: "weapon" as const, location: "inventory" as const, quantity: 1, equipped: true },
      { name: "Куртка группы «SAMURAI»", description: "Кожаный бомбер с ярко светящимся неоновым логотипом культовой рок-группы.", category: "clothing" as const, location: "inventory" as const, quantity: 1, equipped: true },
      { name: "Клинки богомола Arasaka V.2", description: "Имплант в предплечья. Клинки из мономолекулярного волокна для быстрого ближнего боя.", category: "cyberware" as const, location: "inventory" as const, quantity: 1, equipped: true },
      { name: "Военный чип рефлексов «Kereznikov»", description: "Синхронизирует восприятие с нервной системой. Замедляет время при уклонениях.", category: "cyberware" as const, location: "stash" as const, quantity: 1, equipped: false },
      { name: "Развед-карта подворотни Кабуки", description: "Датчик зашифрованных тайников корпорации Кан-Тао в секторе 04.", category: "quest" as const, location: "inventory" as const, quantity: 1, equipped: false },
      { name: "Энергетический паек военный", description: "Концентрированная пищевая паста. На вкус как пластик, но сытно.", category: "other" as const, location: "inventory" as const, quantity: 5, equipped: false }
    ];

    presets.forEach((p) => {
      onAddItem(p);
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "weapon":
        return <Sword className="w-4 h-4 text-rose-450" />;
      case "cyberware":
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case "clothing":
        return <Shirt className="w-4 h-4 text-amber-400" />;
      case "quest":
        return <Key className="w-4 h-4 text-purple-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800/80 p-5 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Инвентарь & Домашний Сейф</span>
          </h2>
          <p className="text-[11px] text-slate-450 mt-1">
            Копите оружие, импланты, одежду и квестовую добычу. Напарник Ви видит эти вещи и комментирует их!
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 sm:pt-0">
          {items.length === 0 && (
            <button
              onClick={loadCyberPresets}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition uppercase tracking-wider"
              title="Загрузить тестовый стартовый набор экипировки"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Получить стартовый набор Ви</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg transition uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? "Закрыть добавить" : "Новый Предмет"}</span>
          </button>
        </div>
      </div>

      {/* Add Custom Item Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 animate-in slide-in-from-top-3 duration-200">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Спецификация Оружейного Бюро Киберпанка</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Название предмета</label>
              <input
                type="text"
                placeholder="Напр., Винтовка «Grad» Власова"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-slate-200 px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-slate-200 px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="weapon">⚔️ Оружие</option>
                <option value="cyberware">🔬 Имплант / Хром</option>
                <option value="clothing">🧥 Одежда / Броня</option>
                <option value="quest">🔑 Квестовый предмет</option>
                <option value="other">📦 Хлам / Расходники</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Описание / Статы / Лор</label>
            <textarea
              placeholder="Введите статы или художественное описание этой легендарной Cyber-находки..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Место хранения</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-slate-200 px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="inventory">🎒 С собой в инвентаре</option>
                <option value="stash">🏠 В сейфе на складе дома</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Количество</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-slate-200 px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={equipped}
                  disabled={category === "quest"}
                  onChange={(e) => setEquipped(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                />
                <span className="text-[10px] uppercase font-bold text-slate-400">Экипировано прямо сейчас</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-semibold"
            >
              Сохранить
            </button>
          </div>
        </form>
      )}

      {/* Filter Options */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold font-mono uppercase text-slate-500 px-1 ml-1">Категории:</span>
          {[
            { id: "all", label: "Все" },
            { id: "weapon", label: "Оружие" },
            { id: "cyberware", label: "🔬 Импланты" },
            { id: "clothing", label: "🧥 Одежда" },
            { id: "quest", label: "🔑 Квесты" },
            { id: "other", label: "📦 Разное" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-150 ${
                selectedCategory === cat.id
                  ? "bg-indigo-950/40 text-indigo-400 border-indigo-900/50"
                  : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-850 self-end md:self-auto">
          {[
            { id: "all", label: "Все места" },
            { id: "inventory", label: "🎒 Инвентарь" },
            { id: "stash", label: "🏠 Тайник" }
          ].map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all duration-150 ${
                selectedLocation === loc.id
                  ? "bg-slate-950 text-indigo-400 shadow"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Final grid display */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-850/50">
          <Package className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-xs text-slate-400">Предметы снаряжения не обнаружены</p>
          <p className="text-[10px] text-slate-550 mt-1">
            Настройте фильтры выбора или нажмите «Новый Предмет» выше, чтобы создать экипировку самостоятельно.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isEquippedVal = !!item.equipped;
            const isStashVal = item.location === "stash";

            return (
              <div
                key={item.id}
                className={`relative group bg-slate-950 border rounded-xl p-4.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                  isEquippedVal
                    ? "border-emerald-500/30 bg-emerald-950/5"
                    : isStashVal
                    ? "border-slate-850/80 bg-slate-950/40"
                    : "border-slate-850 bg-slate-950"
                }`}
              >
                {/* Category tag */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-850/60 p-1.5 px-2.5 rounded-lg">
                    {getCategoryIcon(item.category)}
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-300">
                      {item.category === "weapon" ? "ОРУЖИЕ" :
                       item.category === "cyberware" ? "ИМПЛАНТ" :
                       item.category === "clothing" ? "ОДЕЖДА" :
                       item.category === "quest" ? "КВЕСТ" : "РАЗНОЕ"}
                    </span>
                  </div>

                  {/* Status Indicator labels */}
                  <div className="flex items-center gap-1">
                    {isEquippedVal && (
                      <span className="flex items-center gap-0.5 text-[8.5px] font-extrabold tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-900/60 p-1 px-2 rounded uppercase font-mono">
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                        <span>НАДЕТО</span>
                      </span>
                    )}
                    <span className={`text-[8.5px] font-extrabold tracking-widest p-1 px-2 rounded uppercase font-mono border ${
                      isStashVal 
                        ? "bg-slate-900 text-amber-500 border-amber-950/40" 
                        : "bg-slate-900 text-cyan-400 border-cyan-950/40"
                    }`}>
                      {isStashVal ? "В ТАЙНИКЕ" : "В РЮКЗАКЕ"}
                    </span>
                  </div>
                </div>

                {/* Item description block */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                {/* Adjust items attributes/actions footer */}
                <div className="mt-4 pt-3.5 border-t border-slate-900 flex items-center justify-between gap-4">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold text-slate-550 uppercase tracking-widest font-mono">Штук:</span>
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-850 p-0.5 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 hover:text-white hover:bg-slate-950 text-slate-450 rounded transition"
                        title="Уменьшить количество"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-bold text-indigo-400 font-mono px-1 min-w-[14px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 hover:text-white hover:bg-slate-950 text-slate-450 rounded transition"
                        title="Увеличить количество"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Operational trigger links */}
                  <div className="flex items-center gap-1.5">
                    {item.category !== "quest" && (
                      <button
                        onClick={() => onToggleEquipped(item.id)}
                        className={`text-[9px] font-extrabold uppercase tracking-widest p-1.5 px-2.5 rounded transition font-mono border ${
                          isEquippedVal
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/20"
                            : "bg-slate-900 text-slate-400 border-slate-850 hover:text-slate-200"
                        }`}
                        title={isEquippedVal ? "Снять снаряжение" : "Экипировать / Надеть"}
                      >
                        {isEquippedVal ? "СНЯТЬ" : "НАДЕТЬ"}
                      </button>
                    )}

                    <button
                      onClick={() => onToggleLocation(item.id)}
                      className="text-[9px] font-extrabold uppercase tracking-widest p-1.5 px-2.5 bg-slate-900 text-slate-400 border border-slate-850 hover:text-slate-200 rounded transition font-mono"
                      title={isStashVal ? "Забрать с собой в рюкзак" : "Убрать на склад сейфа"}
                    >
                      {isStashVal ? "РЮКЗАК" : "ТАЙНИК"}
                    </button>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition"
                      title="Уничтожить предмет"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
