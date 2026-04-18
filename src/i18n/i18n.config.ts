import * as path from 'path';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';

export const DEFAULT_LANG =
  process.env.I18N_DEFAULT_LANG != null && process.env.I18N_DEFAULT_LANG !== ''
    ? process.env.I18N_DEFAULT_LANG.toLowerCase() === 'vi'
      ? 'vi'
      : 'en'
    : 'en';

// Both dev (src/i18n/) and prod (dist/src/i18n/) — __dirname points to same folder as JSON files
const i18nPath = path.join(__dirname, './');

export const I18nConfig = I18nModule.forRoot({
  fallbackLanguage: DEFAULT_LANG,
  loader: I18nJsonLoader,
  loaderOptions: {
    path: i18nPath,
    watch: process.env.NODE_ENV !== 'production',
  },
  resolvers: [
    new QueryResolver(['lang', 'l']),
    new HeaderResolver(['x-lang']),
    new CookieResolver(),
    AcceptLanguageResolver,
  ],
  logging: process.env.NODE_ENV !== 'production',
});

export const SUPPORTED_LANGUAGES = ['en', 'vi'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
