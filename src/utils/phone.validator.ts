import {registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import { helper } from './helper';

/**
 * Validates a phone number using the SAME rules as `helper.f❯ I have metis template, in admin panel, i want you to search the web and find me out the flag phone number field validation lib that will compactiable with it "react-phone-number-input
  "ormatPhoneNumber`,
 * which is the single source of truth for phone handling across the app.
 *
 * A value is accepted if `helper.formatPhoneNumber` can normalize it without
 * throwing (i.e. it is a non-empty numeric string, optionally prefixed with
 * `+`). The helper itself takes care of prepending `+`/country code and
 * padding short numbers to at least 10 digits, so those cases are valid input.
 *
 * When a value fails, the global ValidationPipe rejects the request with
 * HTTP 400 and the message "invalid phone number".
 */
@ValidatorConstraint({ name: 'isValidPhone', async: false })
export class IsValidPhoneConstraint implements ValidatorConstraintInterface {
    validate(value: unknown): boolean {
        if (typeof value !== 'string') return false;

        try {
            helper.formatPhoneNumber(value);
            return true;
        } catch {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments): string {
        if (typeof args.value !== 'string') {
            return 'Invalid phone number: the value must be a text string of digits.';
        }

        try {
            helper.formatPhoneNumber(args.value);
        } catch (error) {
            return error instanceof Error ? error.message : 'Invalid phone number.';
        }

        return 'Invalid phone number.';
    }
}

export function IsValidPhone(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidPhoneConstraint,
        });
    };
}
