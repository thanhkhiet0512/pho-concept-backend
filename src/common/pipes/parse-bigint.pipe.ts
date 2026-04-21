import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint | undefined> {
  transform(value: string | undefined): bigint | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`'${value}' is not a valid integer ID`);
    }
  }
}
