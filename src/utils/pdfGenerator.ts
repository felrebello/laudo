// Utilidades para geração de PDFs (Relatório e Fatura)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExamRecord, UnitTotal } from '../types';
import type { AppConfig } from '../lib/database.types';

/**
 * Gera o PDF de Relatório Detalhado
 */
export function generateReportPDF(
  records: ExamRecord[],
  unitTotals: UnitTotal[],
  grandTotal: number,
  config: AppConfig | null
): void {
  const doc = new jsPDF();
  let yPosition = 20;

  // Adicionar logo se existir
  if (config?.logo_url && config.logo_url.trim() !== '') {
    try {
      doc.addImage(config.logo_url, 'PNG', 15, yPosition, 30, 30);
      yPosition += 35;
    } catch (error) {
      console.error('Erro ao adicionar logo:', error);
    }
  }

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Laudos', 15, yPosition);
  yPosition += 10;

  if (config?.competency && config.competency.trim() !== '') {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Competência: ${config.competency}`, 15, yPosition);
    yPosition += 10;
  }

  yPosition += 5;

  // Tabela detalhada de exames
  autoTable(doc, {
    startY: yPosition,
    head: [['Paciente', 'Tipo de Análise', 'Clínica', 'Categoria', 'Valor', 'Especialista']],
    body: records.map(record => [
      record.patient,
      record.examType,
      record.clinic,
      record.category,
      record.hasPrice
        ? record.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : 'Sem preço',
      record.specialist,
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      4: { halign: 'right' },
    },
  });

  // Obter posição Y após a tabela
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Totais por clínica e especialista
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Totais por Clínica e Especialista', 15, yPosition);
  yPosition += 10;

  unitTotals.forEach(unitTotal => {
    // Verificar se precisa de nova página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(unitTotal.clinic, 20, yPosition);
    doc.text(
      unitTotal.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      190,
      yPosition,
      { align: 'right' }
    );
    yPosition += 7;

    // Especialistas da clínica
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    unitTotal.specialists.forEach(specTotal => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(`  ${specTotal.specialist} (${specTotal.count} análises)`, 25, yPosition);
      doc.text(
        specTotal.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        190,
        yPosition,
        { align: 'right' }
      );
      yPosition += 6;
    });

    yPosition += 5;
  });

  // Total Geral
  if (yPosition > 260) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 5;
  doc.setFillColor(59, 130, 246);
  doc.rect(15, yPosition - 5, 180, 12, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL GERAL', 20, yPosition + 3);
  doc.text(
    grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    190,
    yPosition + 3,
    { align: 'right' }
  );

  // Salvar PDF
  doc.save(`relatorio_laudos_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Gera o PDF de Fatura
 */
export function generateInvoicePDF(
  unitTotals: UnitTotal[],
  grandTotal: number,
  config: AppConfig | null
): void {
  const doc = new jsPDF();
  let yPosition = 20;

  // Adicionar logo se existir
  if (config?.logo_url && config.logo_url.trim() !== '') {
    try {
      doc.addImage(config.logo_url, 'PNG', 15, yPosition, 30, 30);
      yPosition += 35;
    } catch (error) {
      console.error('Erro ao adicionar logo:', error);
    }
  }

  // Cabeçalho
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Fatura de Laudos', 15, yPosition);
  yPosition += 10;

  if (config?.competency && config.competency.trim() !== '') {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Competência: ${config.competency}`, 15, yPosition);
    yPosition += 12;
  }

  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPosition, 195, yPosition);
  yPosition += 10;

  // Blocos por radiologista e unidade
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Serviços Prestados', 15, yPosition);
  yPosition += 10;

  // Agrupar por especialista
  const specialistGroups = new Map<string, { clinics: Map<string, number>; total: number }>();

  unitTotals.forEach(unitTotal => {
    unitTotal.specialists.forEach(specTotal => {
      if (!specialistGroups.has(specTotal.specialist)) {
        specialistGroups.set(specTotal.specialist, {
          clinics: new Map(),
          total: 0,
        });
      }

      const group = specialistGroups.get(specTotal.specialist)!;
      group.clinics.set(unitTotal.clinic, specTotal.total);
      group.total += specTotal.total;
    });
  });

  // Renderizar grupos de especialistas
  specialistGroups.forEach((group, specialist) => {
    // Verificar se precisa de nova página
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(specialist, 20, yPosition);
    yPosition += 7;

    // Clínicas do especialista
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    group.clinics.forEach((value, clinic) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(`  ${clinic}`, 25, yPosition);
      doc.text(
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        190,
        yPosition,
        { align: 'right' }
      );
      yPosition += 6;
    });

    // Subtotal do especialista
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: ${specialist}`, 25, yPosition);
    doc.text(
      group.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      190,
      yPosition,
      { align: 'right' }
    );
    yPosition += 10;
  });

  // Total Geral
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 5;
  doc.setFillColor(34, 197, 94);
  doc.rect(15, yPosition - 5, 180, 14, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('VALOR TOTAL', 20, yPosition + 4);
  doc.text(
    grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    190,
    yPosition + 4,
    { align: 'right' }
  );
  doc.setTextColor(0, 0, 0);
  yPosition += 20;

  // Dados bancários e PIX
  const hasBankData = config?.bank_data && config.bank_data.trim() !== '';
  const hasPixKey = config?.pix_key && config.pix_key.trim() !== '';

  if (hasBankData || hasPixKey) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, 195, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Dados para Pagamento', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (hasBankData) {
      const bankLines = config!.bank_data.split('\n');
      bankLines.forEach(line => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    }

    if (hasPixKey) {
      if (yPosition > 275) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text('Chave PIX:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(config!.pix_key, 50, yPosition);
      yPosition += 8;
    }
  }

  // Observações
  if (config?.observations && config.observations.trim() !== '') {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition, 195, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 15, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(config.observations, 170);
    obsLines.forEach((line: string) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });
  }

  // Salvar PDF
  doc.save(`fatura_laudos_${new Date().toISOString().split('T')[0]}.pdf`);
}
