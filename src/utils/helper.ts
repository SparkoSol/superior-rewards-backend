export class helper {
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
        const differenceInMs = Math.abs(d2 - d1);
        return Math.floor(differenceInMs / (1000 * 60 * 60));
    }
}
