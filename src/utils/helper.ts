export class helper {
    static convertToSeconds(dateTimeString) {
        // Create a Date object from the date-time string
        const date = new Date(dateTimeString);

        // Convert to seconds by dividing milliseconds by 1000
        const seconds = Math.floor(date.getTime() / 1000);

        return seconds;
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
}
