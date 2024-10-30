export class MongoQueryUtils {
    static getQueryFromFilters(filters: any) {
        const query = {};

        Object.keys(filters).forEach((field) => {
            const [key, operator] = field.match(/(\w+)\['?(\w+)'?\]/).slice(1);
            const value = filters[field];

            switch (operator) {
                case 'eq':
                    query[key] = { $eq: value };
                    break;
                case 'like':
                    query[key] = { $regex: value, $options: 'i' };
                    break;
                case 'lt':
                    query[key] = { $lt: value };
                    break;
                case 'gt':
                    query[key] = { $gt: value };
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

