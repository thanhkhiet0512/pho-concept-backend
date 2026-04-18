import type { ValidationError, ValidationPipeOptions } from '@nestjs/common';
import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANG } from '../i18n/i18n.config';

function translateConstraint(constraint: string, constraintValue: unknown): string {
  if (
    typeof constraintValue === 'object' &&
    constraintValue !== null &&
    typeof (constraintValue as Record<string, unknown>).message === 'string' &&
    ((constraintValue as Record<string, unknown>).message as string).trim() !== ''
  ) {
    return (constraintValue as Record<string, unknown>).message as string;
  }

  try {
    const i18n = I18nContext.current();
    const lang = i18n?.lang || DEFAULT_LANG;
    const translationKey = `validation.CONSTRAINTS.${constraint}`;
    const args = typeof constraintValue === 'object' ? { ...constraintValue as object } : {};
    const translated = i18n?.t(translationKey, { args, lang });

    if (translated && typeof translated === 'string' && translated !== translationKey) {
      return translated;
    }
  } catch {
    // fallback
  }

  return typeof constraintValue === 'string' ? constraintValue : 'Validation failed';
}

function generateErrors(errors: ValidationError[]): Record<string, unknown> {
  return errors.reduce<Record<string, unknown>>((accumulator, currentValue) => {
    const hasChildren = (currentValue.children?.length ?? 0) > 0;
    const hasConstraints =
      currentValue.constraints && Object.keys(currentValue.constraints).length > 0;

    if (hasChildren && hasConstraints) {
      const constraintMessages = Object.entries(currentValue.constraints ?? {}).map(
        ([key, value]) => translateConstraint(key, value),
      );
      accumulator[currentValue.property] = {
        errors: constraintMessages.join(', '),
        details: generateErrors(currentValue.children ?? []),
      };
    } else if (hasChildren) {
      accumulator[currentValue.property] = generateErrors(currentValue.children ?? []);
    } else if (hasConstraints) {
      const constraintMessages = Object.entries(currentValue.constraints ?? {}).map(
        ([key, value]) => translateConstraint(key, value),
      );
      accumulator[currentValue.property] = constraintMessages.join(', ');
    } else {
      try {
        const i18n = I18nContext.current();
        accumulator[currentValue.property] =
          i18n?.t('validation.MESSAGES.VALIDATION_FAILED') ||
          (DEFAULT_LANG === 'vi' ? 'Xác thực dữ liệu thất bại' : 'Validation failed');
      } catch {
        accumulator[currentValue.property] =
          DEFAULT_LANG === 'vi' ? 'Xác thực dữ liệu thất bại' : 'Validation failed';
      }
    }

    return accumulator;
  }, {});
}

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  transformOptions: { enableImplicitConversion: true },
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) => {
    const details = generateErrors(errors);
    const firstMessage = Object.values(details)[0];
    const message =
      typeof firstMessage === 'string'
        ? firstMessage
        : DEFAULT_LANG === 'vi'
          ? 'Dữ liệu không hợp lệ'
          : 'Invalid input';
    return new UnprocessableEntityException({ message, details });
  },
};

export default validationOptions;
