'use client'

import { FileText, TrendingUp, Zap, AlertTriangle, CheckCircle, BarChart, LineChart, Download } from 'lucide-react'
import type { ReportData, ChartData } from '@/lib/gemini-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BentoChart } from '@/components/ui/bento-chart'
import { exportReportAsMarkdown } from '@/lib/export-utils'

interface ReportDashboardProps {
  reportData: ReportData
  fileName: string
  onNewReport: () => void
}

const GridItem = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <Card className={`bg-white/5 backdrop-blur-sm border border-white/10 p-6 ${className}`}>{children}</Card>
)

const Title = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <CardTitle className="text-white flex items-center gap-2 mb-4">
    {icon}
    {title}
  </CardTitle>
)

export function ReportDashboard({ reportData, fileName, onNewReport }: ReportDashboardProps) {
  const { summary, keyMetrics, charts, insights, risks, sentiment } = reportData

  const handleDownload = () => {
    exportReportAsMarkdown(reportData, fileName)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">AI Analysis Report</h1>
            <p className="text-gray-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {fileName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button onClick={onNewReport} className="bg-blue-600 hover:bg-blue-500">
              Generate New Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <GridItem className="md:col-span-2 lg:col-span-3">
            <Title icon={<FileText className="w-5 h-5 text-blue-400" />} title={summary.title} />
            <p className="text-gray-300 leading-relaxed">{summary.content}</p>
          </GridItem>

          <GridItem>
            <Title icon={<TrendingUp className="w-5 h-5 text-purple-400" />} title={sentiment.title} />
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400">{sentiment.score}</div>
              <p className="text-gray-400">out of 100</p>
            </div>
            <p className="text-sm text-gray-300 mt-2 text-center">{sentiment.analysis}</p>
          </GridItem>

          <GridItem className="md:col-span-1 lg:col-span-1">
            <Title icon={<Zap className="w-5 h-5 text-green-400" />} title={keyMetrics.title} />
            <ul className="space-y-2">
              {keyMetrics.metrics.map((metric, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-300">{metric.name}</span>
                  <span className="font-bold text-green-400">{metric.value}</span>
                </li>
              ))}
            </ul>
          </GridItem>

          {charts.map((chart, index) => (
            <GridItem key={index} className="md:col-span-2">
              <Title
                icon={chart.type === 'line' ? <LineChart className="w-5 h-5 text-yellow-400" /> : <BarChart className="w-5 h-5 text-yellow-400" />}
                title={chart.title}
              />
              <div className="h-60">
                <BentoChart chart={chart} />
              </div>
            </GridItem>
          ))}

          <GridItem className="md:col-span-2 lg:col-span-2">
            <Title icon={<CheckCircle className="w-5 h-5 text-cyan-400" />} title={insights.title} />
            <ul className="space-y-3">
              {insights.content.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">{insight}</p>
                </li>
              ))}
            </ul>
          </GridItem>

          <GridItem className="md:col-span-1 lg:col-span-2">
            <Title icon={<AlertTriangle className="w-5 h-5 text-red-400" />} title={risks.title} />
            <ul className="space-y-3">
              {risks.content.map((risk, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">{risk}</p>
                </li>
              ))}
            </ul>
          </GridItem>
        </div>
      </div>
    </div>
  )
}
