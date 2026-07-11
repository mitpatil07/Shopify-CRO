import { Settings, Eye, EyeOff } from 'lucide-react';

interface SettingsPanelProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showKey: boolean;
  setShowKey: (show: boolean) => void;
}

export default function SettingsPanel({
  apiKey,
  setApiKey,
  showSettings,
  setShowSettings,
  showKey,
  setShowKey,
}: SettingsPanelProps) {
  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors text-sm"
      >
        <Settings className={`h-4 w-4 ${showSettings ? 'rotate-90' : ''} transition-transform`} />
        API Settings
      </button>
      
      {showSettings && (
        <div className="absolute right-0 mt-2 w-80 p-4 rounded-xl glass-panel border-indigo-500/20 shadow-2xl z-50 animate-slide-up">
          <h3 className="text-sm font-semibold text-slate-200 mb-2 font-sans">Nvidia API Key</h3>
          <p className="text-slate-400 text-xs mb-3 leading-relaxed">
            Provides temporary API access. If left empty, the server's local environment key will be used instead.
          </p>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="nvapi-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
