import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nContext } from 'nestjs-i18n/dist/i18n.context';
import { DEFAULT_LANG } from './i18n.config';

@Injectable()
export class I18nHelper {
  constructor(private readonly i18n: I18nService) {}

  async translate(
    key: string,
    args?: Record<string, unknown>,
    defaultValue?: string,
  ): Promise<string> {
    try {
      const lang = I18nContext.current()?.lang || DEFAULT_LANG;
      return await this.i18n.translate(key, {
        lang: lang as 'en' | 'vi',
        args,
        defaultValue,
      });
    } catch {
      return defaultValue || key;
    }
  }

  getCurrentLanguage(): string {
    return I18nContext.current()?.lang || DEFAULT_LANG;
  }

  async translateMany(
    keys: string[],
    args?: Record<string, unknown>,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const key of keys) {
      result[key] = await this.translate(key, args);
    }
    return result;
  }
}
