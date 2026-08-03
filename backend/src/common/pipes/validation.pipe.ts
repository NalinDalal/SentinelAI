import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown) {
    if (!value || typeof value !== 'object') {
      return value;
    }

    const object = plainToInstance(Object, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    if (errors.length > 0) {
      const messages = errors
        .map((error: ValidationError) => {
          if (error.constraints) {
            return Object.values(error.constraints);
          }
          return Object.values(error.children ?? {}).flatMap(
            (child: ValidationError) => Object.values(child.constraints ?? {}),
          );
        })
        .flat();

      throw new BadRequestException(messages);
    }

    return value;
  }
}