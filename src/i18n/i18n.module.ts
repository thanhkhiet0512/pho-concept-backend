import { Global, Module } from '@nestjs/common';
import { I18nHelper } from './i18n.helper';

@Global()
@Module({
  providers: [I18nHelper],
  exports: [I18nHelper],
})
export class I18nAppModule {}
