export class helper {
    convertSecondIntoUTCDataTime(timeInSeconds) {
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
}
