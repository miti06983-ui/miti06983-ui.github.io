export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isValidAudioFile = (file: File): boolean => {
  const validExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
  const extension = getFileExtension(file.name);
  return validExtensions.includes(extension);
};
