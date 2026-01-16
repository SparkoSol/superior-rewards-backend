import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

export interface CertificateData {
    certificateNumber: string;
    customerName: string;
    customerId: string;
    customerEmail: string;
    pointsRedeemed: number;
    monetaryValue: number;
    transactionId: string;
    redemptionDate: Date;
    printedBy: string;
    printDate: Date;
    verificationCode: string;
}

@Injectable()
export class CertificatePdfService {
    private readonly logger = new Logger(CertificatePdfService.name);

    /**
     * Generates a PDF certificate from the HTML template
     */
    async generatePdf(data: CertificateData): Promise<Buffer> {
        const html = this.renderTemplate(data);
        return this.htmlToPdf(html);
    }

    /**
     * Generates HTML content with data substituted
     */
    renderTemplate(data: CertificateData): string {
        const redemptionDate = new Date(data.redemptionDate);
        const printDate = new Date(data.printDate);

        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        const formatDate = (date: Date) => {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
        };

        const formatDateTime = (date: Date) => {
            const dateStr = formatDate(date);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${dateStr} ${hours}:${minutes}`;
        };

        return `<!DOCTYPE html>
                            <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Certificate of Redemption</title>
                                    <style>
                                        * {
                                            margin: 0;
                                            padding: 0;
                                            box-sizing: border-box;
                                            scrollbar-width: none;
                                        }
                                
                                        body {
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                                            background-color: #ffffff;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            width: 816px;
                                            min-height: 1056px;
                                            padding: 1.5rem;
                                            line-height: 1.5;
                                            margin-top: 3.125rem;
                                        }
                                
                                        main {
                                            width: 100%;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            min-height: 1056px;
                                        }
                                
                                        .certificate {
                                            background-color: #ffffff;
                                            position: relative;
                                            width: 100%;
                                            max-width: 700px;
                                            border: 2px solid #015ea0;
                                            box-shadow: 0 4px 12px rgba(1, 94, 160, 0.15);
                                        }
                                
                                        .certificate::before {
                                            content: '';
                                            position: absolute;
                                            top: 8px;
                                            left: 8px;
                                            right: 8px;
                                            bottom: 8px;
                                            border: 1px solid #015ea0;
                                            pointer-events: none;
                                        }
                                
                                        .corner-decoration {
                                            position: absolute;
                                            width: 2rem;
                                            height: 2rem;
                                        }
                                
                                        .corner-tl { top: 0.75rem; left: 0.75rem; }
                                        .corner-tr { top: 0.75rem; right: 0.75rem; }
                                        .corner-bl { bottom: 0.75rem; left: 0.75rem; }
                                        .corner-br { bottom: 0.75rem; right: 0.75rem; }
                                
                                        .content {
                                            position: relative;
                                            z-index: 1;
                                            display: flex;
                                            flex-direction: column;
                                            gap: 1rem;
                                            padding: 2.5rem;
                                        }
                                
                                        header {
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            gap: 0.75rem;
                                        }
                                
                                        .icon-container {
                                            width: 4rem;
                                            height: 4rem;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                        }
                                
                                        .icon-container svg {
                                            width: 100%;
                                            height: 100%;
                                            fill: #015ea0;
                                        }
                                
                                        h1 {
                                            font-size: 1.875rem;
                                            font-weight: 700;
                                            text-align: center;
                                            color: #015ea0;
                                            line-height: 1.2;
                                        }
                                
                                        .subtitle {
                                            font-size: 1rem;
                                            font-weight: 500;
                                            text-align: center;
                                            color: #0d7bc4;
                                        }
                                
                                        .cert-header {
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: center;
                                            padding: 0.75rem 0;
                                            border-top: 1px solid rgba(90, 108, 125, 0.3);
                                            border-bottom: 1px solid rgba(90, 108, 125, 0.3);
                                        }
                                
                                        .cert-info-group {
                                            display: flex;
                                            flex-direction: column;
                                            gap: 0.5rem;
                                        }
                                
                                        .info-label {
                                            font-size: 0.805rem;
                                            font-weight: 400;
                                            color: #5a6c7d;
                                            text-transform: uppercase;
                                            letter-spacing: 0.05em;
                                            line-height: 1.42857;
                                        }
                                
                                        .info-value {
                                            font-size: 0.875rem;
                                            font-weight: 600;
                                            color: #015ea0;
                                            border-bottom: 2px solid #0d7bc4;
                                            padding-bottom: 0.25rem;
                                            line-height: 1.55556;
                                        }
                                
                                        .date-group {
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            gap: 0.25rem;
                                        }
                                
                                        .date-month {
                                            font-size: 0.75rem;
                                            font-weight: 400;
                                            color: #5a6c7d;
                                            text-transform: uppercase;
                                            line-height: 1.33333;
                                        }
                                
                                        .date-day {
                                            font-size: 1.25rem;
                                            font-weight: 700;
                                            color: #015ea0;
                                            line-height: 1.4;
                                        }
                                
                                        .date-year {
                                            font-size: 0.75rem;
                                            font-weight: 400;
                                            color: #5a6c7d;
                                        }
                                
                                        .section-heading {
                                            font-size: 1.125rem;
                                            font-weight: 600;
                                            text-align: center;
                                            color: #015ea0;
                                            line-height: 1.55556;
                                        }
                                
                                        .customer-section {
                                            display: flex;
                                            flex-direction: column;
                                            gap: 1rem;
                                        }
                                
                                        .customer-name-group {
                                            display: flex;
                                            flex-direction: column;
                                            gap: 0.5rem;
                                        }
                                
                                        .customer-details {
                                            display: grid;
                                            grid-template-columns: repeat(2, 1fr);
                                            gap: 1rem;
                                        }
                                
                                        .redemption-section {
                                            display: flex;
                                            flex-direction: column;
                                            gap: 1rem;
                                        }
                                
                                        .redemption-box {
                                            background-color: #ebf5ff;
                                            padding: 0.75rem 1rem;
                                            border: 1px solid #015ea0;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            gap: 0.5rem;
                                        }
                                
                                        .redemption-label {
                                            font-size: 1rem;
                                            font-weight: 400;
                                            color: #0d7bc4;
                                            line-height: 1.5;
                                        }
                                
                                        .redemption-value {
                                            font-size: 1rem;
                                            font-weight: 700;
                                            color: #015ea0;
                                            line-height: 1.2;
                                        }
                                
                                        .redemption-unit {
                                            font-size: 1rem;
                                            font-weight: 600;
                                            color: #015ea0;
                                            line-height: 1.4;
                                        }
                                
                                        .redemption-details {
                                            display: grid;
                                            grid-template-columns: repeat(2, 1fr);
                                            gap: 1rem;
                                        }
                                
                                        .terms-section {
                                            margin-top: 1rem;
                                            padding-top: 0.75rem;
                                            border-top: 1px solid rgba(90, 108, 125, 0.3);
                                        }
                                
                                        .terms-box {
                                            background-color: #ebf5ff;
                                            padding: 0.75rem 1rem;
                                            border: 1px solid #015ea0;
                                        }
                                
                                        .terms-box h3 {
                                            font-size: 1rem;
                                            font-weight: 600;
                                            color: #015ea0;
                                            margin-bottom: 0.75rem;
                                            line-height: 1.5;
                                        }
                                
                                        .terms-box p {
                                            font-size: 0.75rem;
                                            font-weight: 400;
                                            color: #0d7bc4;
                                            line-height: 1.4;
                                        }
                                
                                        footer {
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: flex-end;
                                            margin-top: 1.5rem;
                                            gap: 2rem;
                                        }
                                
                                        .signature-group {
                                            display: flex;
                                            flex-direction: column;
                                            gap: 0.25rem;
                                            min-width: 180px;
                                        }
                                
                                        .signature-line {
                                            height: 2rem;
                                            border-top: 2px solid #015ea0;
                                            padding-top: 0.25rem;
                                        }
                                
                                        .signature-label {
                                            text-align: center;
                                            font-size: 0.75rem;
                                            font-weight: 400;
                                            color: #5a6c7d;
                                            line-height: 1.33333;
                                        }
                                
                                        .signature-date {
                                            text-align: center;
                                            font-size: 10px;
                                            font-weight: 400;
                                            color: #5a6c7d;
                                            line-height: 1.33;
                                        }
                                
                                        .cert-footer {
                                            margin-top: 1rem;
                                            padding-top: 0.5rem;
                                            border-top: 1px solid rgba(90, 108, 125, 0.3);
                                        }
                                
                                        .footer-content {
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: center;
                                            font-size: 10px;
                                            color: #5a6c7d;
                                            line-height: 1.33333;
                                        }
                                
                                        .footer-left, .footer-right {
                                            display: flex;
                                            flex-direction: column;
                                            gap: 0.25rem;
                                        }
                                
                                        .footer-right { text-align: right; }
                                
                                        @media print {
                                            body {
                                                background: white;
                                                padding: 0;
                                                width: 816px;
                                                min-height: 1056px;
                                            }
                                            .certificate { box-shadow: none; }
                                        }
                                
                                        @page {
                                            size: A4;
                                            margin: 0;
                                        }
                                    </style>
                                </head>
                                <body>
                                <main>
                                    <div class="certificate">
                                        <svg class="corner-decoration corner-tl" viewBox="0 0 24 24">
                                            <path d="M3 3 L3 12 M3 3 L12 3 M12 3 Q15 6 12 9 M3 12 Q6 15 9 12"/>
                                        </svg>
                                        <svg class="corner-decoration corner-tr" viewBox="0 0 24 24" style="transform: scaleX(-1)">
                                            <path d="M3 3 L3 12 M3 3 L12 3 M12 3 Q15 6 12 9 M3 12 Q6 15 9 12"/>
                                        </svg>
                                        <svg class="corner-decoration corner-bl" viewBox="0 0 24 24" style="transform: scaleY(-1)">
                                            <path d="M3 3 L3 12 M3 3 L12 3 M12 3 Q15 6 12 9 M3 12 Q6 15 9 12"/>
                                        </svg>
                                        <svg class="corner-decoration corner-br" viewBox="0 0 24 24" style="transform: scale(-1, -1)">
                                            <path d="M3 3 L3 12 M3 3 L12 3 M12 3 Q15 6 12 9 M3 12 Q6 15 9 12"/>
                                        </svg>
                            
                                        <div class="content">
                                            <header>
                                                <div class="icon-container">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                                        <path d="m9.675 13.7l.875-2.85L8.25 9h2.85l.9-2.8l.9 2.8h2.85l-2.325 1.85l.875 2.85l-2.3-1.775zM6 23v-7.725q-.95-1.05-1.475-2.4T4 10q0-3.35 2.325-5.675T12 2t5.675 2.325T20 10q0 1.525-.525 2.875T18 15.275V23l-6-2zm6-7q2.5 0 4.25-1.75T18 10t-1.75-4.25T12 4T7.75 5.75T6 10t1.75 4.25T12 16"></path>
                                                    </svg>
                                                </div>
                                                <h1>Certificate of Redemption</h1>
                                                <p class="subtitle">Loyalty Points Program</p>
                                            </header>
                            
                                            <section class="cert-header">
                                                <div class="cert-info-group">
                                                    <span class="info-label">Certificate No.</span>
                                                    <span class="info-value">${data.certificateNumber}</span>
                                                </div>
                                                <div class="date-group">
                                                    <span class="date-month">${monthNames[redemptionDate.getMonth()]}</span>
                                                    <span class="date-day">${String(redemptionDate.getDate()).padStart(2, '0')}</span>
                                                    <span class="date-year">${redemptionDate.getFullYear()}</span>
                                                </div>
                                            </section>
                            
                                            <section class="customer-section">
                                                <h2 class="section-heading">This certifies that</h2>
                                                <div class="customer-name-group">
                                                    <span class="info-label">Customer Name</span>
                                                    <span class="info-value">${data.customerName}</span>
                                                </div>
                                                <div class="customer-details">
                                                    <div>
                                                        <span class="info-label">Customer ID</span>
                                                        <span class="info-value">${data.customerId}</span>
                                                    </div>
                                                    <div>
                                                        <span class="info-label">Email</span>
                                                        <span class="info-value">${data.customerEmail || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </section>
                            
                                            <section class="redemption-section">
                                                <h2 class="section-heading">has successfully redeemed</h2>
                            
                                                <div class="redemption-box">
                                                    <span class="redemption-label">Points Redeemed:</span>
                                                    <span class="redemption-value">${data.pointsRedeemed.toLocaleString()}</span>
                                                    <span class="redemption-unit">PTS</span>
                                                </div>
                            
                                                <div class="redemption-box">
                                                    <span class="redemption-label">Equivalent Value:</span>
                                                    <span class="redemption-unit">$</span>
                                                    <span class="redemption-value">${data.monetaryValue.toFixed(2)}</span>
                                                    <span class="redemption-unit">USD</span>
                                                </div>
                            
                                                <div class="redemption-details">
                                                    <div>
                                                        <span class="info-label">Redemption Date</span>
                                                        <span class="info-value">${formatDate(redemptionDate)}</span>
                                                    </div>
                                                    <div>
                                                        <span class="info-label">Transaction ID</span>
                                                        <span class="info-value">${data.transactionId}</span>
                                                    </div>
                                                </div>
                                            </section>
                            
                                            <section class="terms-section">
                                                <div class="terms-box">
                                                    <h3>Terms and Conditions</h3>
                                                    <p>This certificate serves as official documentation of loyalty points redemption. The redemption is final and non-refundable. Points cannot be restored once redeemed. This certificate must be retained for record-keeping purposes and may be required for tax reporting. Valid for verification within 12 months of issuance.</p>
                                                </div>
                                            </section>
                            
                                            <footer>
                                                <div class="signature-group">
                                                    <div class="signature-line"></div>
                                                    <span class="signature-label">Customer Signature</span>
                                                    <span class="signature-date">Date: _____________</span>
                                                </div>
                                                <div class="signature-group">
                                                    <div class="signature-line"></div>
                                                    <span class="signature-label">Manager Signature</span>
                                                    <span class="signature-date">Date: _____________</span>
                                                </div>
                                            </footer>
                            
                                            <section class="cert-footer">
                                                <div class="footer-content">
                                                    <div class="footer-left">
                                                        <span>Printed by: ${data.printedBy}</span>
                                                        <span>Print Date: ${formatDateTime(printDate)}</span>
                                                    </div>
                                                    <div class="footer-right">
                                                        <span>Certificate Valid: Valid Forever</span>
                                                        <span>Verification Code: ${data.verificationCode}</span>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </main>
                            </body>
                            </html>`;
    }

    /**
     * Converts HTML to PDF using Puppeteer
     */
    private async htmlToPdf(html: string): Promise<Buffer> {
        let browser: Browser | null = null;

        try {
            browser = await puppeteer.launch({
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                // Add these two specific args to help with Docker environments
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ],
                ignoreDefaultArgs: ['--disable-extensions'],
                timeout: 30000,
                protocolTimeout: 60000
            });

            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            await page.evaluateHandle('document.fonts.ready');

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0',
                    right: '0',
                    bottom: '0',
                    left: '0',
                },
            });

            return Buffer.from(pdfBuffer);
        } catch (error) {
            this.logger.error('Error generating PDF:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}
