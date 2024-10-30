export class MongoQueryUtils {
    static getQueryFromFilters(filters: any) {
        const query = {};

        Object.keys(filters).forEach((field) => {
            const match = field.match(/(\w+)\['?(\w+)'?\]/);

            if (!match) {
                throw new Error(`Invalid filter format: ${field}`);
            }

            const [key, operator] = field.match(/(\w+)\['?(\w+)'?\]/).slice(1);
            const value = filters[field];

            switch (operator) {
                case 'eq':
                    query[key] = { $eq: value };
                    break;
                case 'like':
                    query[key] = { $regex: value, $options: 'i' };
                    break;
                case 'range': // value [min, max]
                    if (Array.isArray(value) && value.length === 2) {
                        query[key] = { $gte: value[0], $lte: value[1] };
                    } else {
                        throw new Error(
                            `Range filter requires an array with two [min,max] for field: ${key}`
                        );
                    }
                    break;
                case 'date':
                    if (Array.isArray(value) && value.length === 2) {
                        query[key] = { $gte: new Date(value[0]), $lte: new Date(value[1]) };
                    } else if (typeof value === 'string' || value instanceof Date) {
                        query[key] = { $eq: new Date(value) };
                    } else {
                        throw new Error(
                            `Date filter requires a single date or an array with two dates for field: ${key}`
                        );
                    }
                    break;
                case 'exists':
                    // Check if the field should exist (true) or not (false)
                    if (typeof value === 'boolean') {
                        query[key] = { $exists: value };
                    } else {
                        throw new Error(`Exists filter requires a boolean value for field: ${key}`);
                    }
                    break;
                // Add more cases for different operators as needed
                default:
                    throw new Error(`Unsupported operator: ${operator}`);
            }
        });

        return query;
    }

    static async getPaginatedResponse(items: any, page: number = 1, pageSize: number = 10) {
        // Apply pagination
        const totalCount = items.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalCount);

        // Slice the contacts array to get the contacts for the current page
        const paginationItems = items.slice(startIndex, endIndex);

        return {
            data: paginationItems,
            page,
            pageSize: paginationItems.length,
            totalPages,
        };
    }
}
