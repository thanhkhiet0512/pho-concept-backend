import axios, { AxiosError } from 'axios';
import Transport from 'winston-transport';

const TELEGRAM_MAX = 4096;
const JSON_INDENT = 2;
const MAX_STACK_LEN = 3000;
const MAX_STACK_LINES = 35;

function safeStringify(value: unknown, _maxDepth = 6): string {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(
      value,
      function (_key, val) {
        if (!val || typeof val !== 'object') return val;
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
        if (val instanceof Error) {
          return { name: val.name, message: val.message, stack: val.stack };
        }
        return val;
      },
      JSON_INDENT,
    );
  } catch {
    return String(value);
  }
}

function escapeMarkdownV2(text: string): string {
  if (!text) return '';
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

function codeBlock(lang: string, content: string): string {
  const safe = content.replace(/```/g, '``\\`');
  return `\`\`\`${lang}\n${safe}\n\`\`\``;
}

function trimStack(input: unknown): string {
  if (!input) return '';
  const raw = typeof input === 'string' ? input : safeStringify(input);
  const lines = raw.split('\n').slice(0, MAX_STACK_LINES).join('\n');
  return lines.length > MAX_STACK_LEN ? lines.slice(0, MAX_STACK_LEN) + '\n... (truncated)' : lines;
}

function splitTelegramText(text: string): string[] {
  if (text.length <= TELEGRAM_MAX) return [text];
  const chunks: string[] = [];
  let buf = '';
  for (const p of text.split('\n\n')) {
    const piece = p + '\n\n';
    if ((buf + piece).length > TELEGRAM_MAX) {
      if (buf) chunks.push(buf.trimEnd());
      buf = piece;
    } else {
      buf += piece;
    }
  }
  if (buf.trim()) chunks.push(buf.trimEnd());
  const final: string[] = [];
  for (const c of chunks) {
    if (c.length <= TELEGRAM_MAX) { final.push(c); continue; }
    for (let i = 0; i < c.length; i += TELEGRAM_MAX) final.push(c.slice(i, i + TELEGRAM_MAX));
  }
  return final;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const EMOJI: Record<LogLevel, string> = {
  error: '🔴',
  warn: '⚠️',
  info: 'ℹ️',
  debug: '🐛',
};

export async function sendTelegramNotification(
  message: string,
  options: { level?: LogLevel; details?: unknown; token?: string; chatId?: string } = {},
): Promise<void> {
  const { level = 'info', details, token, chatId } = options;
  if (!token || !chatId) return;

  const emoji = EMOJI[level] ?? 'ℹ️';
  const title = `${emoji} *${escapeMarkdownV2(level.toUpperCase())}*`;
  const msg = escapeMarkdownV2(message || 'No message');
  const parts: string[] = [title, '', msg];

  const stackStr = trimStack(details);
  if (stackStr) parts.push('', '*Stack:*', codeBlock('json', stackStr));

  const text = parts.join('\n');
  const messages = splitTelegramText(text);

  try {
    for (const m of messages) {
      await axios.post(
        `https://api.telegram.org/bot${token}/sendMessage`,
        { chat_id: chatId, text: m, parse_mode: 'MarkdownV2', disable_web_page_preview: true },
        { timeout: 10000 },
      );
    }
  } catch (err) {
    const error = err as AxiosError;
    console.error('Telegram notification failed:', error.response?.data ?? error.message);
  }
}

export interface TelegramTransportOptions extends Transport.TransportStreamOptions {
  token?: string;
  chatId?: string;
}

export class TelegramTransport extends Transport {
  private readonly token?: string;
  private readonly chatId?: string;

  constructor(opts?: TelegramTransportOptions) {
    super(opts);
    this.token = opts?.token;
    this.chatId = opts?.chatId;
  }

  log(info: Record<string, unknown>, callback: () => void): void {
    setImmediate(() => this.emit('logged', info));

    const level = (typeof info.level === 'string' ? info.level.toLowerCase() : 'info') as LogLevel;
    const message = typeof info.message === 'string' ? info.message : safeStringify(info.message);
    const details = info.error ?? info.stack ?? info.trace ?? null;

    void sendTelegramNotification(message, {
      level,
      details,
      token: this.token,
      chatId: this.chatId,
    });

    callback();
  }
}
