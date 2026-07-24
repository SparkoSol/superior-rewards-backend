export class helper {
    static convertToSeconds(dateTimeString: string) {
        // Create a Date object from the date-time string
        const date = new Date(dateTimeString);

        // Convert to seconds by dividing milliseconds by 1000
        return Math.floor(date.getTime() / 1000);
    }

    static convertSecondIntoUTCDataTime(timeInSeconds: string) {
        const date = new Date(timeInSeconds);

        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const seconds = date.getUTCSeconds();
        const millisecondsPart = date.getUTCMilliseconds();

        return `${year}-${month < 10 ? '0' : ''}${month}-${
            day < 10 ? '0' : ''
        }${day}T${hours < 10 ? '0' : ''}${hours}:${
            minutes < 10 ? '0' : ''
        }${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${millisecondsPart}Z`;
    }

    static addCustomDelay(date: Date, delayInMinutes: number) {
        return new Date(date.getTime() + delayInMinutes * 60 * 1000);
    }

    static getDifferenceInSeconds(isExpired: boolean, date1: string, date2: string) {
        if (isExpired || !date1 || !date2) {
            return 0;
        }
        const d1 = new Date(date1).getTime();
        const d2 = new Date(date2).getTime();
        const differenceInS = Math.abs(d2 - d1);
        return Math.floor(differenceInS / 1000);
    }

    static capitalizeFirstChar(inputString: string) {
        const words = inputString.split(' ');

        const capitalizedWords = words.map((word) => {
            if (word.length > 0) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            } else {
                return '';
            }
        });

        return capitalizedWords.join(' ');
    }

    static formatPhoneNumber(phone: string) {
        // The single stored format is always: `+<countryCode><number>`
        // e.g. "+923036473659", "+16579362785".

        // ---- Step 1: strip separators (spaces, '/', '(', ')', '-', '.') from
        // start, end and in between, e.g. "876 457 1617", "876-990-3041",
        // "(876) 990-3041", "1035.1727". ----
        const cleaned = (phone ?? '').replace(/[\s()\/.-]/g, '');

        if (cleaned.length === 0) {
            throw new Error(
                'Invalid phone number: the field is empty. Please enter a phone number with at least 10 digits.'
            );
        }

        // ---- Step 2: allow at most a single leading '+'; everything else must
        // be digits. A '+' anywhere but the start, or any letter/symbol (e.g.
        // "JACKSON", "xxxxxxx") is rejected. ----
        const hasPlus = cleaned.startsWith('+');
        const digitsPart = hasPlus ? cleaned.slice(1) : cleaned;

        if (!/^\d+$/.test(digitsPart)) {
            throw new Error(
                `Invalid phone number "${phone}": it contains characters that are not allowed. ` +
                    "A phone number may only contain digits, with an optional single '+' at the start. " +
                    "Please remove any letters or symbols (e.g. '*', or a '+' in the middle)."
            );
        }

        // ---- Step 3a: if the number already starts with '+', the frontend's
        // intl phone input has already provided the country code. Keep it as-is
        // (no leading-zero strip, no default country code) — just return it in
        // the canonical `+<countryCode><number>` form. ----
        if (hasPlus) {
            return `+${digitsPart}`;
        }

        // ---- Step 3b: no '+' provided. If the first digit is a leading '0',
        // drop it; otherwise leave it untouched. Then require at least 10 digits. ----
        const normalized = digitsPart.startsWith('0') ? digitsPart.slice(1) : digitsPart;

        if (normalized.length < 10) {
            throw new Error(
                `Invalid phone number "${phone}": it has only ${normalized.length} digit(s), ` +
                    'but a valid phone number must contain at least 10 digits.'
            );
        }

        // More than 10 digits => a country code is already included, just add '+'.
        // Exactly 10 digits => local number, default the country code to '+1' (USA).
        return normalized.length > 10 ? `+${normalized}` : `+1${normalized}`;
    }
}
