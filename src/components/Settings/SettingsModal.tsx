import React, { useState } from 'react';
import { X, Volume2, Monitor, Play, Bell, Shield, HardDrive, Wifi, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettingsStore } from '../../store/useSettingsStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'audio' | 'display' | 'playback' | 'notifications' | 'privacy' | 'storage' | 'network';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio');
  
  const {
    audio, display, playback, notifications, privacy, storage, network,
    setAudioSetting, setDisplaySetting, setPlaybackSetting, setNotificationSetting,
    setPrivacySetting, setStorageSetting, setNetworkSetting, resetSettings
  } = useSettingsStore();

  if (!isOpen) return null;

  const tabs = [
    { id: 'audio' as const, label: 'Audio', icon: Volume2 },
    { id: 'display' as const, label: 'Display', icon: Monitor },
    { id: 'playback' as const, label: 'Playback', icon: Play },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
    { id: 'storage' as const, label: 'Storage', icon: HardDrive },
    { id: 'network' as const, label: 'Network', icon: Wifi },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-spotify-dark rounded-xl w-full max-w-4xl h-[80vh] flex overflow-hidden shadow-2xl">
        <div className="w-64 bg-black/30 p-4 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 px-4">Settings</h2>
          <nav className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  activeTab === tab.id
                    ? "bg-spotify-green text-black font-semibold"
                    : "text-spotify-lightGray hover:bg-white/10 hover:text-white"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
          <button
            onClick={resetSettings}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-lg transition-all mt-4"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-spotify-lightGray hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {activeTab === 'audio' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Audio Settings</h3>
              
              <SettingItem label="Playback Volume" description="Adjust default playback volume">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audio.volume}
                  onChange={(e) => setAudioSetting('volume', Number(e.target.value))}
                  className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                />
                <span className="text-spotify-lightGray text-sm mt-1">{audio.volume}%</span>
              </SettingItem>

              <SettingItem label="Equalizer Preset" description="Select audio equalizer preset">
                <select
                  value={audio.equalizerPreset}
                  onChange={(e) => setAudioSetting('equalizerPreset', e.target.value)}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="flat">Flat</option>
                  <option value="bass">Bass Boost</option>
                  <option value="treble">Treble Boost</option>
                  <option value="vocal">Vocal Boost</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classical</option>
                  <option value="electronic">Electronic</option>
                  <option value="custom">Custom</option>
                </select>
              </SettingItem>

              <SettingItem label="Bass" description="Custom low frequency gain">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audio.customEqualizer.bass}
                  onChange={(e) => setAudioSetting('customEqualizer', { ...audio.customEqualizer, bass: Number(e.target.value) })}
                  className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                />
              </SettingItem>

              <SettingItem label="Mid" description="Custom mid frequency gain">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audio.customEqualizer.mid}
                  onChange={(e) => setAudioSetting('customEqualizer', { ...audio.customEqualizer, mid: Number(e.target.value) })}
                  className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                />
              </SettingItem>

              <SettingItem label="Treble" description="Custom high frequency gain">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audio.customEqualizer.treble}
                  onChange={(e) => setAudioSetting('customEqualizer', { ...audio.customEqualizer, treble: Number(e.target.value) })}
                  className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                />
              </SettingItem>

              <ToggleSetting
                label="Auto Play"
                description="Automatically start playback on app launch"
                checked={audio.autoPlay}
                onChange={(checked) => setAudioSetting('autoPlay', checked)}
              />

              <ToggleSetting
                label="Crossfade"
                description="Smooth transition between tracks"
                checked={audio.crossfade}
                onChange={(checked) => setAudioSetting('crossfade', checked)}
              />

              {audio.crossfade && (
                <SettingItem label="Crossfade Duration" description="Set crossfade transition duration">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={audio.crossfadeDuration}
                    onChange={(e) => setAudioSetting('crossfadeDuration', Number(e.target.value))}
                    className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                  />
                  <span className="text-spotify-lightGray text-sm mt-1">{audio.crossfadeDuration}s</span>
                </SettingItem>
              )}

              <ToggleSetting
                label="Volume Normalization"
                description="Automatically adjust volume to consistent level"
                checked={audio.normalizeVolume}
                onChange={(checked) => setAudioSetting('normalizeVolume', checked)}
              />

              <ToggleSetting
                label="Mono Audio"
                description="Mix all audio to mono"
                checked={audio.monoAudio}
                onChange={(checked) => setAudioSetting('monoAudio', checked)}
              />

              <ToggleSetting
                label="Spatial Audio"
                description="Enable Dolby Atmos effect"
                checked={audio.spatialAudio}
                onChange={(checked) => setAudioSetting('spatialAudio', checked)}
              />
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Display Settings</h3>
              
              <SettingItem label="Theme" description="Choose app interface theme">
                <div className="flex gap-2">
                  {(['dark', 'light', 'auto'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setDisplaySetting('theme', theme)}
                      className={cn(
                        "px-4 py-2 rounded-lg transition-all",
                        display.theme === theme
                          ? "bg-spotify-green text-black font-semibold"
                          : "bg-spotify-gray text-white hover:bg-white/20"
                      )}
                    >
                      {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'Auto'}
                    </button>
                  ))}
                </div>
              </SettingItem>

              <SettingItem label="Font Size" description="Adjust interface font size">
                <select
                  value={display.fontSize}
                  onChange={(e) => setDisplaySetting('fontSize', e.target.value as 'small' | 'medium' | 'large')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </SettingItem>

              <SettingItem label="Language" description="Choose interface display language">
                <select
                  value={display.language}
                  onChange={(e) => setDisplaySetting('language', e.target.value)}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="zh">简体中文</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </select>
              </SettingItem>

              <ToggleSetting
                label="Compact Mode"
                description="Use more compact interface layout"
                checked={display.compactMode}
                onChange={(checked) => setDisplaySetting('compactMode', checked)}
              />

              <ToggleSetting
                label="Show Album Art"
                description="Display album artwork in player"
                checked={display.showAlbumArt}
                onChange={(checked) => setDisplaySetting('showAlbumArt', checked)}
              />

              <ToggleSetting
                label="Show Lyrics"
                description="Display synced lyrics during playback"
                checked={display.showLyrics}
                onChange={(checked) => setDisplaySetting('showLyrics', checked)}
              />

              <SettingItem label="Lyrics Source" description="Choose lyrics retrieval method">
                <select
                  value={display.lyricsSource}
                  onChange={(e) => setDisplaySetting('lyricsSource', e.target.value as 'local' | 'synced')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="local">Local Lyrics</option>
                  <option value="synced">Online Synced</option>
                </select>
              </SettingItem>

              <SettingItem label="Animation Speed" description="Adjust interface animation speed">
                <select
                  value={display.animationSpeed}
                  onChange={(e) => setDisplaySetting('animationSpeed', e.target.value as 'slow' | 'normal' | 'fast')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </SettingItem>

              <ToggleSetting
                label="Reduced Motion"
                description="Reduce interface animations for better performance"
                checked={display.reducedMotion}
                onChange={(checked) => setDisplaySetting('reducedMotion', checked)}
              />
            </div>
          )}

          {activeTab === 'playback' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Playback Settings</h3>
              
              <SettingItem label="Skip Forward Duration" description="Set seconds to skip forward">
                <select
                  value={playback.skipForwardAmount}
                  onChange={(e) => setPlaybackSetting('skipForwardAmount', Number(e.target.value))}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                </select>
              </SettingItem>

              <SettingItem label="Skip Backward Duration" description="Set seconds to skip backward">
                <select
                  value={playback.skipBackwardAmount}
                  onChange={(e) => setPlaybackSetting('skipBackwardAmount', Number(e.target.value))}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                </select>
              </SettingItem>

              <ToggleSetting
                label="Shuffle Playback"
                description="Enable random playback order"
                checked={playback.shuffle}
                onChange={(checked) => setPlaybackSetting('shuffle', checked)}
              />

              <SettingItem label="Repeat Mode" description="Set behavior when playback ends">
                <div className="flex gap-2">
                  {(['none', 'all', 'one'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPlaybackSetting('repeatMode', mode)}
                      className={cn(
                        "px-4 py-2 rounded-lg transition-all",
                        playback.repeatMode === mode
                          ? "bg-spotify-green text-black font-semibold"
                          : "bg-spotify-gray text-white hover:bg-white/20"
                      )}
                    >
                      {mode === 'none' ? 'Off' : mode === 'all' ? 'Repeat All' : 'Repeat One'}
                    </button>
                  ))}
                </div>
              </SettingItem>

              <ToggleSetting
                label="Gapless Playback"
                description="Eliminate gaps between tracks"
                checked={playback.gaplessPlayback}
                onChange={(checked) => setPlaybackSetting('gaplessPlayback', checked)}
              />

              <ToggleSetting
                label="Autoplay Similar Songs"
                description="Auto-recommend similar songs when playback ends"
                checked={playback.autoplaySimilar}
                onChange={(checked) => setPlaybackSetting('autoplaySimilar', checked)}
              />

              <ToggleSetting
                label="Resume on Startup"
                description="Resume last playback position on app launch"
                checked={playback.resumeOnStartup}
                onChange={(checked) => setPlaybackSetting('resumeOnStartup', checked)}
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Notification Settings</h3>
              
              <ToggleSetting
                label="Enable Notifications"
                description="Allow app to send notifications"
                checked={notifications.enabled}
                onChange={(checked) => setNotificationSetting('enabled', checked)}
              />

              <ToggleSetting
                label="New Track Alert"
                description="Show notification when playing new track"
                checked={notifications.newTrackAlert}
                onChange={(checked) => setNotificationSetting('newTrackAlert', checked)}
              />

              <ToggleSetting
                label="Download Complete"
                description="Send notification when download completes"
                checked={notifications.downloadComplete}
                onChange={(checked) => setNotificationSetting('downloadComplete', checked)}
              />

              <ToggleSetting
                label="Social Updates"
                description="Receive updates from followers"
                checked={notifications.socialUpdates}
                onChange={(checked) => setNotificationSetting('socialUpdates', checked)}
              />

              <ToggleSetting
                label="Sound Effects"
                description="Play sound effects for interface actions"
                checked={notifications.soundEffects}
                onChange={(checked) => setNotificationSetting('soundEffects', checked)}
              />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Privacy Settings</h3>
              
              <ToggleSetting
                label="Show Activity"
                description="Allow others to view your listening activity"
                checked={privacy.showActivity}
                onChange={(checked) => setPrivacySetting('showActivity', checked)}
              />

              <ToggleSetting
                label="Show Listening Stats"
                description="Display listening statistics on profile"
                checked={privacy.showListeningStats}
                onChange={(checked) => setPrivacySetting('showListeningStats', checked)}
              />

              <ToggleSetting
                label="Analytics"
                description="Allow usage data collection to improve service"
                checked={privacy.analyticsEnabled}
                onChange={(checked) => setPrivacySetting('analyticsEnabled', checked)}
              />

              <ToggleSetting
                label="History Tracking"
                description="Save playback history"
                checked={privacy.historyTracking}
                onChange={(checked) => setPrivacySetting('historyTracking', checked)}
              />
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Storage Settings</h3>
              
              <SettingItem label="Cache Size Limit" description="Set maximum cache storage space">
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={storage.cacheSize}
                  onChange={(e) => setStorageSetting('cacheSize', Number(e.target.value))}
                  className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                />
                <span className="text-spotify-lightGray text-sm mt-1">{storage.cacheSize} MB</span>
              </SettingItem>

              <SettingItem label="Cache Expiry" description="Set number of days to keep cache">
                <select
                  value={storage.maxCacheAge}
                  onChange={(e) => setStorageSetting('maxCacheAge', Number(e.target.value))}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </SettingItem>

              <SettingItem label="Download Quality" description="Choose offline music download quality">
                <select
                  value={storage.downloadQuality}
                  onChange={(e) => setStorageSetting('downloadQuality', e.target.value as 'low' | 'medium' | 'high' | 'very-high')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="low">Low (96 kbps)</option>
                  <option value="medium">Medium (160 kbps)</option>
                  <option value="high">High (320 kbps)</option>
                  <option value="very-high">Very High (FLAC)</option>
                </select>
              </SettingItem>

              <ToggleSetting
                label="Auto Download"
                description="Automatically download newly added songs"
                checked={storage.autoDownload}
                onChange={(checked) => setStorageSetting('autoDownload', checked)}
              />

              <ToggleSetting
                label="WiFi Only Download"
                description="Only download content when connected to WiFi"
                checked={storage.downloadOnWifiOnly}
                onChange={(checked) => setStorageSetting('downloadOnWifiOnly', checked)}
              />
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Network Settings</h3>
              
              <SettingItem label="Streaming Quality" description="Choose online playback music quality">
                <select
                  value={network.streamingQuality}
                  onChange={(e) => setNetworkSetting('streamingQuality', e.target.value as 'low' | 'medium' | 'high' | 'very-high' | 'lossless')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="low">Low (96 kbps)</option>
                  <option value="medium">Medium (160 kbps)</option>
                  <option value="high">High (320 kbps)</option>
                  <option value="very-high">Very High (FLAC)</option>
                  <option value="lossless">Lossless (Hi-Res)</option>
                </select>
              </SettingItem>

              <ToggleSetting
                label="Enable Proxy"
                description="Use proxy server for connections"
                checked={network.proxyEnabled}
                onChange={(checked) => setNetworkSetting('proxyEnabled', checked)}
              />

              {network.proxyEnabled && (
                <SettingItem label="Proxy Server Address" description="Enter proxy server URL">
                  <input
                    type="text"
                    value={network.proxyUrl}
                    onChange={(e) => setNetworkSetting('proxyUrl', e.target.value)}
                    placeholder="http://proxy.example.com:8080"
                    className="w-full bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                  />
                </SettingItem>
              )}

              <SettingItem label="Bandwidth Limit" description="Limit maximum bandwidth usage (0 = unlimited)">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={network.bandwidthLimit}
                  onChange={(e) => setNetworkSetting('bandwidthLimit', Number(e.target.value))}
                  className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                />
                <span className="text-spotify-lightGray text-sm mt-1">
                  {network.bandwidthLimit === 0 ? 'Unlimited' : `${network.bandwidthLimit} Mbps`}
                </span>
              </SettingItem>

              <ToggleSetting
                label="Pre-fetch Lyrics"
                description="Pre-load lyrics during playback"
                checked={network.preFetchLyrics}
                onChange={(checked) => setNetworkSetting('preFetchLyrics', checked)}
              />

              <ToggleSetting
                label="Preload Albums"
                description="Pre-load adjacent tracks"
                checked={network.preloadAlbums}
                onChange={(checked) => setNetworkSetting('preloadAlbums', checked)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SettingItemProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ label, description, children }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <div>
        <h4 className="text-white font-semibold">{label}</h4>
        <p className="text-spotify-lightGray text-sm">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ label, description, checked, onChange }) => (
  <div className="flex justify-between items-center">
    <div>
      <h4 className="text-white font-semibold">{label}</h4>
      <p className="text-spotify-lightGray text-sm">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-14 h-8 rounded-full transition-colors",
        checked ? "bg-spotify-green" : "bg-spotify-gray"
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-lg",
          checked ? "left-7" : "left-1"
        )}
      />
    </button>
  </div>
);

export default SettingsModal;
