import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText } from 'lucide-react';
import type { Subscription } from '../types';

interface ExportButtonsProps {
    subscriptions: Subscription[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ subscriptions }) => {

    const exportToCSV = () => {
        if (subscriptions.length === 0) {
            alert('No subscriptions to export.');
            return;
        }

        const headers = ['Name', 'Cost', 'Currency', 'Frequency', 'Renewal Date', 'Category', 'Description'];
        const rows = subscriptions.map(sub => [
            sub.name,
            sub.cost,
            sub.currency,
            sub.frequency,
            new Date(sub.renewalDate).toLocaleDateString(),
            sub.category?.name || 'Uncategorized',
            sub.description || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `renewly_subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (subscriptions.length === 0) {
            alert('No subscriptions to export.');
            return;
        }

        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text('Renewly - Subscription Report', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Define table columns and rows
        const tableColumn = ['Name', 'Cost', 'Frequency', 'Renewal Date', 'Category'];
        const tableRows = subscriptions.map(sub => [
            sub.name,
            `${sub.currency} ${sub.cost}`,
            sub.frequency,
            new Date(sub.renewalDate).toLocaleDateString(),
            sub.category?.name || 'Uncategorized'
        ]);

        // Generate table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [63, 81, 181] }, // Primary color roughly
        });

        doc.save(`renewly_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="flex flex-wrap gap-4">
            <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-[var(--border)] shadow-sm text-sm font-medium rounded-md text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)] transition-colors"
            >
                <FileText className="mr-2 h-4 w-4 text-[var(--primary)]" />
                Export to CSV
            </button>
            <button
                onClick={exportToPDF}
                className="inline-flex items-center px-4 py-2 border border-[var(--border)] shadow-sm text-sm font-medium rounded-md text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)] transition-colors"
            >
                <Download className="mr-2 h-4 w-4 text-[var(--primary)]" />
                Export to PDF
            </button>
        </div>
    );
};

export default ExportButtons;
