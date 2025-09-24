import { ReportData } from './gemini-client';

export const exportReportAsMarkdown = (reportData: ReportData, fileName: string) => {
  const { summary, keyMetrics, charts, insights, risks, sentiment } = reportData;

  let markdownContent = `# AI Analysis Report for ${fileName}\n\n`;

  markdownContent += `## ${summary.title}\n\n${summary.content}\n\n`;

  markdownContent += `## ${sentiment.title}\n\n**Score:** ${sentiment.score}/100\n\n${sentiment.analysis}\n\n`;

  markdownContent += `## ${keyMetrics.title}\n\n`;
  keyMetrics.metrics.forEach(metric => {
    markdownContent += `- **${metric.name}:** ${metric.value}\n`;
  });
  markdownContent += '\n';

  markdownContent += `## ${insights.title}\n\n`;
  insights.content.forEach(insight => {
    markdownContent += `- ${insight}\n`;
  });
  markdownContent += '\n';

  markdownContent += `## ${risks.title}\n\n`;
  risks.content.forEach(risk => {
    markdownContent += `- ${risk}\n`;
  });
  markdownContent += '\n';

  if (charts.length > 0) {
    markdownContent += '## Visualizations\n\n';
    charts.forEach(chart => {
      markdownContent += `### ${chart.title}\n\n> Chart Type: ${chart.type}\n\n`;
      chart.data.forEach(dataPoint => {
        markdownContent += `- ${dataPoint.name}: ${dataPoint.value}\n`;
      });
      markdownContent += '\n';
    });
  }

  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.split('.')[0]}_report.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};