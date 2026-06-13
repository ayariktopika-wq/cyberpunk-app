import React, { useState } from "react";
import { LogEntry } from "../types";
import { Terminal, Trash2, Search, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface ConsoleTabProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onRefreshLogs: () => void;
}

export const ConsoleTab: React.FC<ConsoleTabProps> = ({ logs, onClearLogs, onRefreshLogs }) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesSearch = 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono" id="console-logs-panel">
      {/* Console Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200">Отладочная консоль ИИ-ассистента</h2>
          <span className="px-2 py-0.5 text-xs text-indigo-400 bg-indigo-950/50 border border-indigo-900 rounded">
            {logs.length} записей
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            title="Обновить журнал"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Обновить</span>
          </button>
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистить</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900 border-b border-slate-850">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск по логам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-slate-700"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {["all", "request", "response", "info", "error"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                filterType === type
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:bg-slate-900"
              }`}
            >
              {type === "all" ? "Все" : type === "request" ? "Запросы (→)" : type === "response" ? "Ответы (←)" : type === "info" ? "Инфо" : "Ошибки (❌)"}
            </button>
          ))}
        </div>
      </div>

      {/* Logs stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-950 scrollbar-thin">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-500 text-center m-auto h-full">
            <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm">Логи в данной категории отсутствуют</p>
            <p className="text-xs text-slate-600 mt-1">Здесь будут отображаться запросы к API, процесс распознавания и ошибки</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isError = log.type === "error";
            const isReq = log.type === "request";
            const isResp = log.type === "response";

            const typeColor = isError 
              ? "text-rose-400 bg-rose-950/20" 
              : isReq 
                ? "text-emerald-400 bg-emerald-950/20" 
                : isResp 
                  ? "text-amber-400 bg-amber-950/20" 
                  : "text-blue-400 bg-blue-950/20";

            return (
              <div 
                key={log.id} 
                className={`p-3 rounded-lg border text-xs leading-relaxed transition ${
                  isError 
                    ? "bg-rose-950/10 border-rose-900/30 text-rose-300" 
                    : "bg-slate-900/60 border-slate-850 text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div 
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => log.details && toggleExpand(log.id)}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="text-slate-600 shrink-0 font-medium whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 tracking-wider ${typeColor}`}>
                      {log.type === "request" ? "REQ" : log.type === "response" ? "RESP" : log.type === "info" ? "INFO" : "ERR"}
                    </span>
                    <span className="font-medium break-words text-slate-200">
                      {log.message}
                    </span>
                  </div>

                  {log.details && (
                    <div className="text-slate-500 shrink-0 hover:text-slate-300 transition">
                      {expandedLogId === log.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded JSON Details */}
                {expandedLogId === log.id && log.details && (
                  <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-md overflow-x-auto">
                    <pre className="text-[11px] text-slate-400 font-mono select-text max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
