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
    { id: 'audio' as const, label: '音频', icon: Volume2 },
    { id: 'display' as const, label: '显示', icon: Monitor },
    { id: 'playback' as const, label: '播放', icon: Play },
    { id: 'notifications' as const, label: '通知', icon: Bell },
    { id: 'privacy' as const, label: '隐私', icon: Shield },
    { id: 'storage' as const, label: '存储', icon: HardDrive },
    { id: 'network' as const, label: '网络', icon: Wifi },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-spotify-dark rounded-xl w-full max-w-4xl h-[80vh] flex overflow-hidden shadow-2xl">
        <div className="w-64 bg-black/30 p-4 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 px-4">设置</h2>
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
            重置设置
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
              <h3 className="text-2xl font-bold text-white mb-6">音频设置</h3>
              
              <SettingItem label="播放音量" description="调整默认播放音量">
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

              <SettingItem label="均衡器预设" description="选择音频均衡预设">
                <select
                  value={audio.equalizerPreset}
                  onChange={(e) => setAudioSetting('equalizerPreset', e.target.value)}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="flat">平坦</option>
                  <option value="bass">低音增强</option>
                  <option value="treble">高音增强</option>
                  <option value="vocal">人声增强</option>
                  <option value="rock">摇滚</option>
                  <option value="jazz">爵士</option>
                  <option value="classical">古典</option>
                  <option value="electronic">电子</option>
                  <option value="custom">自定义</option>
                </select>
              </SettingItem>

              <SettingItem label="低音" description="自定义低频增益">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audio.customEqualizer.bass}
                  onChange={(e) => setAudioSetting('customEqualizer', { ...audio.customEqualizer, bass: Number(e.target.value) })}
                  className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                />
              </SettingItem>

              <SettingItem label="中音" description="自定义中频增益">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audio.customEqualizer.mid}
                  onChange={(e) => setAudioSetting('customEqualizer', { ...audio.customEqualizer, mid: Number(e.target.value) })}
                  className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                />
              </SettingItem>

              <SettingItem label="高音" description="自定义高频增益">
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
                label="自动播放"
                description="应用启动时自动开始播放"
                checked={audio.autoPlay}
                onChange={(checked) => setAudioSetting('autoPlay', checked)}
              />

              <ToggleSetting
                label="交叉淡入淡出"
                description="曲目切换时平滑过渡"
                checked={audio.crossfade}
                onChange={(checked) => setAudioSetting('crossfade', checked)}
              />

              {audio.crossfade && (
                <SettingItem label="淡入淡出时长" description="设置交叉淡入淡出的持续时间">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={audio.crossfadeDuration}
                    onChange={(e) => setAudioSetting('crossfadeDuration', Number(e.target.value))}
                    className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                  />
                  <span className="text-spotify-lightGray text-sm mt-1">{audio.crossfadeDuration}秒</span>
                </SettingItem>
              )}

              <ToggleSetting
                label="音量标准化"
                description="自动调整音量为一致水平"
                checked={audio.normalizeVolume}
                onChange={(checked) => setAudioSetting('normalizeVolume', checked)}
              />

              <ToggleSetting
                label="单声道音频"
                description="将所有音频混合为单声道"
                checked={audio.monoAudio}
                onChange={(checked) => setAudioSetting('monoAudio', checked)}
              />

              <ToggleSetting
                label="空间音频"
                description="启用杜比全景声效果"
                checked={audio.spatialAudio}
                onChange={(checked) => setAudioSetting('spatialAudio', checked)}
              />
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">显示设置</h3>
              
              <SettingItem label="主题" description="选择应用界面主题">
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
                      {theme === 'dark' ? '深色' : theme === 'light' ? '浅色' : '自动'}
                    </button>
                  ))}
                </div>
              </SettingItem>

              <SettingItem label="字体大小" description="调整界面字体大小">
                <select
                  value={display.fontSize}
                  onChange={(e) => setDisplaySetting('fontSize', e.target.value as 'small' | 'medium' | 'large')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </SettingItem>

              <SettingItem label="语言" description="选择界面显示语言">
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
                label="紧凑模式"
                description="使用更紧凑的界面布局"
                checked={display.compactMode}
                onChange={(checked) => setDisplaySetting('compactMode', checked)}
              />

              <ToggleSetting
                label="显示专辑封面"
                description="在播放器中显示专辑封面"
                checked={display.showAlbumArt}
                onChange={(checked) => setDisplaySetting('showAlbumArt', checked)}
              />

              <ToggleSetting
                label="显示歌词"
                description="在播放时显示同步歌词"
                checked={display.showLyrics}
                onChange={(checked) => setDisplaySetting('showLyrics', checked)}
              />

              <SettingItem label="歌词来源" description="选择歌词获取方式">
                <select
                  value={display.lyricsSource}
                  onChange={(e) => setDisplaySetting('lyricsSource', e.target.value as 'local' | 'synced')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="local">本地歌词</option>
                  <option value="synced">在线同步</option>
                </select>
              </SettingItem>

              <SettingItem label="动画速度" description="调整界面动画速度">
                <select
                  value={display.animationSpeed}
                  onChange={(e) => setDisplaySetting('animationSpeed', e.target.value as 'slow' | 'normal' | 'fast')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="slow">慢</option>
                  <option value="normal">正常</option>
                  <option value="fast">快</option>
                </select>
              </SettingItem>

              <ToggleSetting
                label="减少动画"
                description="减少界面动画效果以提高性能"
                checked={display.reducedMotion}
                onChange={(checked) => setDisplaySetting('reducedMotion', checked)}
              />
            </div>
          )}

          {activeTab === 'playback' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">播放设置</h3>
              
              <SettingItem label="快进时长" description="设置单次快进的秒数">
                <select
                  value={playback.skipForwardAmount}
                  onChange={(e) => setPlaybackSetting('skipForwardAmount', Number(e.target.value))}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="5">5秒</option>
                  <option value="10">10秒</option>
                  <option value="15">15秒</option>
                  <option value="30">30秒</option>
                </select>
              </SettingItem>

              <SettingItem label="快退时长" description="设置单次快退的秒数">
                <select
                  value={playback.skipBackwardAmount}
                  onChange={(e) => setPlaybackSetting('skipBackwardAmount', Number(e.target.value))}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="5">5秒</option>
                  <option value="10">10秒</option>
                  <option value="15">15秒</option>
                  <option value="30">30秒</option>
                </select>
              </SettingItem>

              <ToggleSetting
                label="随机播放"
                description="启用随机播放顺序"
                checked={playback.shuffle}
                onChange={(checked) => setPlaybackSetting('shuffle', checked)}
              />

              <SettingItem label="循环模式" description="设置播放结束后的行为">
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
                      {mode === 'none' ? '关闭' : mode === 'all' ? '全部循环' : '单曲循环'}
                    </button>
                  ))}
                </div>
              </SettingItem>

              <ToggleSetting
                label="无缝播放"
                description="曲目切换时消除间隙"
                checked={playback.gaplessPlayback}
                onChange={(checked) => setPlaybackSetting('gaplessPlayback', checked)}
              />

              <ToggleSetting
                label="自动播放相似歌曲"
                description="播放结束时自动推荐相似歌曲"
                checked={playback.autoplaySimilar}
                onChange={(checked) => setPlaybackSetting('autoplaySimilar', checked)}
              />

              <ToggleSetting
                label="启动时恢复播放"
                description="应用启动时恢复上次播放位置"
                checked={playback.resumeOnStartup}
                onChange={(checked) => setPlaybackSetting('resumeOnStartup', checked)}
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">通知设置</h3>
              
              <ToggleSetting
                label="启用通知"
                description="允许应用发送通知"
                checked={notifications.enabled}
                onChange={(checked) => setNotificationSetting('enabled', checked)}
              />

              <ToggleSetting
                label="新曲目提醒"
                description="播放新曲目时显示通知"
                checked={notifications.newTrackAlert}
                onChange={(checked) => setNotificationSetting('newTrackAlert', checked)}
              />

              <ToggleSetting
                label="下载完成通知"
                description="下载完成时发送通知"
                checked={notifications.downloadComplete}
                onChange={(checked) => setNotificationSetting('downloadComplete', checked)}
              />

              <ToggleSetting
                label="社交动态"
                description="接收关注者的动态更新"
                checked={notifications.socialUpdates}
                onChange={(checked) => setNotificationSetting('socialUpdates', checked)}
              />

              <ToggleSetting
                label="音效"
                description="播放界面操作音效"
                checked={notifications.soundEffects}
                onChange={(checked) => setNotificationSetting('soundEffects', checked)}
              />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">隐私设置</h3>
              
              <ToggleSetting
                label="显示动态"
                description="允许他人查看你的听歌动态"
                checked={privacy.showActivity}
                onChange={(checked) => setPrivacySetting('showActivity', checked)}
              />

              <ToggleSetting
                label="显示听歌统计"
                description="在个人资料中显示听歌统计数据"
                checked={privacy.showListeningStats}
                onChange={(checked) => setPrivacySetting('showListeningStats', checked)}
              />

              <ToggleSetting
                label="数据分析"
                description="允许收集使用数据以改进服务"
                checked={privacy.analyticsEnabled}
                onChange={(checked) => setPrivacySetting('analyticsEnabled', checked)}
              />

              <ToggleSetting
                label="历史记录"
                description="保存播放历史记录"
                checked={privacy.historyTracking}
                onChange={(checked) => setPrivacySetting('historyTracking', checked)}
              />
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">存储设置</h3>
              
              <SettingItem label="缓存大小限制" description="设置最大缓存存储空间">
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

              <SettingItem label="缓存过期时间" description="设置缓存保留的天数">
                <select
                  value={storage.maxCacheAge}
                  onChange={(e) => setStorageSetting('maxCacheAge', Number(e.target.value))}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="7">7天</option>
                  <option value="14">14天</option>
                  <option value="30">30天</option>
                  <option value="60">60天</option>
                  <option value="90">90天</option>
                </select>
              </SettingItem>

              <SettingItem label="下载音质" description="选择离线下载的音乐质量">
                <select
                  value={storage.downloadQuality}
                  onChange={(e) => setStorageSetting('downloadQuality', e.target.value as 'low' | 'medium' | 'high' | 'very-high')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="low">低 (96 kbps)</option>
                  <option value="medium">中 (160 kbps)</option>
                  <option value="high">高 (320 kbps)</option>
                  <option value="very-high">极高 (FLAC)</option>
                </select>
              </SettingItem>

              <ToggleSetting
                label="自动下载"
                description="自动下载新添加的歌曲"
                checked={storage.autoDownload}
                onChange={(checked) => setStorageSetting('autoDownload', checked)}
              />

              <ToggleSetting
                label="仅WiFi下载"
                description="仅在连接WiFi时下载内容"
                checked={storage.downloadOnWifiOnly}
                onChange={(checked) => setStorageSetting('downloadOnWifiOnly', checked)}
              />
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">网络设置</h3>
              
              <SettingItem label="流媒体音质" description="选择在线播放的音乐质量">
                <select
                  value={network.streamingQuality}
                  onChange={(e) => setNetworkSetting('streamingQuality', e.target.value as 'low' | 'medium' | 'high' | 'very-high' | 'lossless')}
                  className="bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                >
                  <option value="low">低 (96 kbps)</option>
                  <option value="medium">中 (160 kbps)</option>
                  <option value="high">高 (320 kbps)</option>
                  <option value="very-high">极高 (FLAC)</option>
                  <option value="lossless">无损 (Hi-Res)</option>
                </select>
              </SettingItem>

              <ToggleSetting
                label="启用代理"
                description="使用代理服务器连接"
                checked={network.proxyEnabled}
                onChange={(checked) => setNetworkSetting('proxyEnabled', checked)}
              />

              {network.proxyEnabled && (
                <SettingItem label="代理服务器地址" description="输入代理服务器的URL">
                  <input
                    type="text"
                    value={network.proxyUrl}
                    onChange={(e) => setNetworkSetting('proxyUrl', e.target.value)}
                    placeholder="http://proxy.example.com:8080"
                    className="w-full bg-spotify-gray text-white px-4 py-2 rounded-lg border border-white/10 focus:border-spotify-green focus:outline-none"
                  />
                </SettingItem>
              )}

              <SettingItem label="带宽限制" description="限制最大带宽使用 (0为不限制)">
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
                  {network.bandwidthLimit === 0 ? '不限制' : `${network.bandwidthLimit} Mbps`}
                </span>
              </SettingItem>

              <ToggleSetting
                label="预加载歌词"
                description="播放时预先加载歌词"
                checked={network.preFetchLyrics}
                onChange={(checked) => setNetworkSetting('preFetchLyrics', checked)}
              />

              <ToggleSetting
                label="预加载专辑"
                description="预先加载相邻曲目"
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
