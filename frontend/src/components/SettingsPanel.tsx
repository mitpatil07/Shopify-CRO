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
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-stone-200 text-stone-750 hover:bg-stone-50 hover:text-stone-900 transition-all text-sm shadow-sm font-medium"
      >
        <Settings className={`h-4 w-4 ${showSettings ? 'rotate-90' : ''} transition-transform`} />
        API Settings
      </button>
      
      {showSettings && (
        <div className="absolute right-0 mt-2 w-80 p-4 rounded-xl glass-panel border-stone-200 shadow-xl z-50 animate-slide-up">
          <h3 className="text-sm font-bold text-stone-900 mb-2 font-sans">Nvidia API Key</h3>
          <p className="text-stone-500 text-xs mb-3 leading-relaxed">
            Provides temporary API access. If left empty, the server's local environment key will be used instead.
          </p>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="nvapi-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-650"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
