/**
 * Calculates estimated reading time based on an average rate of 200 words per minute.
 */
export function calculateReadingTime(text: string): string {
  if (!text || !text.trim()) {
    return '0s';
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const seconds = Math.max(1, Math.round((words / 200) * 60));

  if (seconds < 60) {
    return `${seconds} segundos`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remainingSeconds}s`;
}

/**
 * Copies text to the clipboard safely.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-secure context or older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch {
    return false;
  }
}

/**
 * Formats a timestamp into human-readable Spanish text.
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Recién';
  }
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const d = new Date(timestamp);
    const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `Hoy, ${timeStr}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    const d = new Date(timestamp);
    const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `Ayer, ${timeStr}`;
  }

  const dateObj = new Date(timestamp);
  return dateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
