import { Injectable, Logger } from '@nestjs/common';

/**
 * Data required to send a WhatsApp points notification.
 */
interface PointsNotificationData {
    phone: string;
    customerName: string;
    pointsEarned: number;
    previousBalance: number;
    newBalance: number;
}

/**
 * WhatsAppService handles sending WhatsApp messages via the Picky Assist API.
 *
 * This service is designed to be fail-safe — if the WhatsApp API is unreachable
 * or returns an error, it will log the error but never throw an exception.
 * This ensures that the calling transaction flow is never disrupted.
 */
@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);

    private readonly apiUrl: string;
    private readonly apiToken: string;
    private readonly applicationId: string;
    private readonly templateId: string;
    private readonly templateLang: string;

    constructor() {
        this.apiUrl = process.env.PICKY_ASSIST_API_URL || '';
        this.apiToken = process.env.PICKY_ASSIST_API_TOKEN || '';
        this.applicationId = process.env.PICKY_ASSIST_APPLICATION_ID || '';
        this.templateId = process.env.PICKY_ASSIST_TEMPLATE_ID || '';
        this.templateLang = process.env.PICKY_ASSIST_TEMPLATE_LANG || 'en';
    }

    /**
     * Checks whether the WhatsApp integration is properly configured.
     * Returns false if any required environment variable is missing.
     */
    private isConfigured(): boolean {
        return !!(this.apiUrl && this.apiToken && this.applicationId && this.templateId);
    }

    /**
     * Formats a phone number for the Picky Assist API.
     *
     * Picky Assist requires numbers with country code, without '+' or leading '0'.
     * Jamaica numbers in the database are stored as 10-digit strings (e.g., '8762886883').
     * This method prepends the Jamaica country code '1' if needed.
     *
     * @param phone - Raw phone number from the database
     * @returns Formatted phone number string (e.g., '18762886883')
     */
    private formatPhoneNumber(phone: string): string {
        // Remove all non-digit characters (spaces, dashes, parentheses, plus sign)
        let formatted = phone.replace(/\D/g, '');

        // Remove leading zeros
        formatted = formatted.replace(/^0+/, '');

        // If the number is 10 digits (Jamaica local format), prepend country code '1'
        if (formatted.length === 10) {
            formatted = '1' + formatted;
        }

        return formatted;
    }

    /**
     * Sends a WhatsApp notification to a customer about earned loyalty points.
     *
     * Template variables mapping:
     *   {{1}} → Customer Name
     *   {{2}} → Points Earned
     *   {{3}} → Previous Balance
     *   {{4}} → New Balance
     *
     * This method is fail-safe and will never throw an exception.
     *
     * @param data - Points notification data including customer details and balances
     */
    async sendPointsNotification(data: PointsNotificationData): Promise<void> {
        if (!this.isConfigured()) {
            this.logger.warn(
                'WhatsApp integration is not configured. Skipping WhatsApp notification.'
            );
            return;
        }

        const formattedPhone = this.formatPhoneNumber(data.phone);

        const payload = {
            token: this.apiToken,
            application: this.applicationId,
            template_id: this.templateId,
            language: this.templateLang,
            data: [
                {
                    number: formattedPhone,
                    template_message: [
                        data.customerName,
                        String(data.pointsEarned),
                        String(data.previousBalance),
                        String(data.newBalance),
                    ],
                },
            ],
        };

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const responseBody = await response.text();

            if (response.ok) {
                this.logger.log(`WhatsApp notification sent successfully to ${formattedPhone}`);
            } else {
                this.logger.error(
                    `WhatsApp API returned status ${response.status} for ${formattedPhone}: ${responseBody}`
                );
            }
        } catch (error) {
            this.logger.error(
                `Failed to send WhatsApp notification to ${formattedPhone}: ${error}`
            );
        }
    }
}
