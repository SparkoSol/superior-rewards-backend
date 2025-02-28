import mongoose from 'mongoose';

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
                    if (key === 'phone') return (query[key] = { $eq: value });
                    query[key] = { $eq: isNaN(value) ? value : Number(value) };
                    break;
                case 'like':
                    if (key === '_id')
                        return (query[key] = { $eq: new mongoose.Types.ObjectId(value) });
                    query[key] = { $regex: value, $options: 'i' };
                    break;
                case 'range': // value [min, max]
                    if (Array.isArray(value) && value.length === 2) {
                        query[key] = { $gte: Number(value[0]), $lte: Number(value[1]) };
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
                        query[key] = { $exists: Boolean(value) };
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

    static createDynamicMatchStages(populatedOrFilters: Record<string, any>) {
        const matchStages = [];

        for (const key in populatedOrFilters) {
            if (Object.prototype.hasOwnProperty.call(populatedOrFilters, key)) {
                const value = populatedOrFilters[key];

                const match = key.match(/(.+)\[(.+)\]/);
                if (match) {
                    const [, table, field] = match;

                    if (field === 'odooCustomerId') {
                        matchStages.push({
                            $match: {
                                [`${table}.${field}`]: { $eq: Number(value) },
                            },
                        });
                    } else {
                        matchStages.push({
                            $match: {
                                [`${table}.${field}`]: { $regex: value, $options: 'i' },
                            },
                        });
                    }
                }
            }
        }

        return matchStages;
    }

    static async getPaginatedResponse(
        items: any,
        filters: any = {},
        page: number = 1,
        pageSize: number = 10
    ) {
        // Apply pagination
        const totalCount = items.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalCount);

        // Slice the contacts array to get the contacts for the current page
        const paginationItems = items.slice(startIndex, endIndex);

        return {
            filters,
            data: paginationItems,
            page,
            pageSize: paginationItems.length,
            totalPages,
        };
    }
}
