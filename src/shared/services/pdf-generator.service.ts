import { Injectable, Logger } from '@nestjs/common';

let pdfMake: any;

try {
    // Dynamic require to avoid module resolution issues
    const pdfMakeModule = require('pdfmake/build/pdfmake');
    const pdfFontsModule = require('pdfmake/build/vfs_fonts');

    pdfMake = pdfMakeModule;
    if (pdfFontsModule?.pdfMake?.vfs) {
        pdfMake.vfs = pdfFontsModule.pdfMake.vfs;
    }
} catch {
    // If standard import fails, try alternative
    pdfMake = require('pdfmake');
}

export interface PDFReportConfig {
    title: string;
    companyName: string;
    generatedDate: Date;
    startDate: Date;
    endDate: Date;
    columns: Array<{
        key: string;
        label: string;
        width?: string;
    }>;
    data: Record<string, any>[];
    footerText?: string;
    totalPoints?: number;
    pageSize?: string | { width: number; height: number };
    pageOrientation?: 'portrait' | 'landscape';
    pageMargins?: [number, number, number, number];
}

@Injectable()
export class PDFGeneratorService {
    private readonly logger = new Logger(PDFGeneratorService.name);

    async generateReport(config: PDFReportConfig): Promise<Buffer> {
        try {
            const docDefinition = this.buildReportDefinition(config);
            const doc = pdfMake.createPdf(docDefinition);
            return await doc.getBuffer();
        } catch (error) {
            this.logger.error('Error generating PDF report:', error);
            throw error;
        }
    }

    private buildReportDefinition(config: PDFReportConfig): any {
        const {
            title,
            companyName,
            generatedDate,
            startDate,
            endDate,
            columns,
            data,
            footerText,
            totalPoints,
            pageSize = {
                width: 1440,
                height: 900,
            },
            pageOrientation = 'landscape',
            pageMargins = [20, 20, 20, 40],
        } = config;

        // Format dates
        const formattedGeneratedDate = this.formatDate(generatedDate);
        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        // Build table header
        const tableHeaders = columns.map((col) => ({
            text: col.label,
            fillColor: '#17498E',
            color: '#FFFFFF',
            alignment: 'center',
            margin: [5, 5, 5, 5],
            fontSize: 11,
            bold: true,
        }));

        // Build table body
        const tableBody = [tableHeaders];
        for (const row of data) {
            const rowData = columns.map((col) => {
                let value = row[col.key] || 'N/A';
                // Format dates in the table
                if (value instanceof Date) {
                    value = this.formatDate(value);
                }
                // Format numbers
                if (typeof value === 'number' && col.key !== 'Type') {
                    value =
                        typeof value === 'number' && col.key.toLowerCase().includes('date')
                            ? value
                            : this.formatNumber(value);
                }
                return {
                    text: String(value),
                    bold: false,
                    fillColor: '',
                    color: '#000000',
                    alignment: ['Amount', 'Points'].includes(col.label) ? 'right' : 'left',
                    margin: [5, 3, 5, 3],
                    fontSize: 9,
                };
            });
            tableBody.push(rowData);
        }

        // Build document content
        const content: any[] = [
            // Header
            {
                text: companyName,
                fontSize: 18,
                color: '#17498E',
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 5],
            },
            {
                text: title,
                fontSize: 14,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 15],
            },

            // Report metadata
            {
                columns: [
                    {
                        text: `Report Generated: ${formattedGeneratedDate}`,
                        fontSize: 10,
                        bold: true,
                    },
                    {
                        text: `Date Range: ${formattedStartDate} to ${formattedEndDate}`,
                        fontSize: 10,
                        bold: true,
                        alignment: 'right',
                    },
                ],
                margin: [0, 0, 0, 15],
            },

            // Table
            {
                table: {
                    headerRows: 1,
                    widths: this.calculateColumnWidths(columns),
                    body: tableBody,
                },
                layout: {
                    hLineWidth: (i: number) => (i === 1 ? 2 : 1),
                    hLineColor: (i: number) => (i === 1 ? '#17498E' : '#CCCCCC'),
                    vLineWidth: () => 1,
                    vLineColor: () => '#CCCCCC',
                    paddingLeft: () => 5,
                    paddingRight: () => 5,
                    paddingTop: () => 3,
                    paddingBottom: () => 3,
                },
                margin: [0, 0, 0, 20],
            },
        ];

        // Add summary if totalPoints is provided
        if (totalPoints !== undefined) {
            content.push({
                columns: [
                    { text: '' },
                    {
                        text: [
                            {
                                text: 'Total Points: ',
                                fontSize: 11,
                                bold: true,
                            },
                            {
                                text: this.formatNumber(totalPoints),
                                fontSize: 12,
                                color: '#27AE60',
                                bold: true,
                            },
                        ],
                        alignment: 'right',
                    },
                ],
                margin: [0, 10, 0, 0],
            });
        }

        // Add footer text if provided
        if (footerText) {
            content.push({
                text: footerText,
                fontSize: 8,
                bold: true,
                color: '#7F8C8D',
                alignment: 'center',
                margin: [0, 20, 0, 0],
            });
        }

        return {
            pageSize: pageSize,
            pageOrientation: pageOrientation,
            pageMargins: pageMargins,
            content: content,
            footer: (currentPage: number, pageCount: number) => ({
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: 'center',
                fontSize: 8,
                bold: true,
                color: '#7F8C8D',
                margin: [0, 10, 0, 0],
            }),
            defaultStyle: {
                size: 9,
            },
        };
    }

    private formatDate(date: Date): string {
        if (!date) return '';
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    }

    private formatNumber(value: number): string {
        if (typeof value !== 'number') return String(value);
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    private calculateColumnWidths(
        columns: Array<{ key: string; label: string; width?: string }>
    ): string[] {
        // If widths are specified, use them; otherwise distribute evenly
        const widths = columns.map((col) => col.width || '*');
        return widths;
    }
}
