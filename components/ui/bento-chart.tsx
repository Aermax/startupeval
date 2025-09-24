'use client'

import {
  Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { ChartData } from '@/lib/gemini-client'

interface BentoChartProps {
  chart: ChartData
}

export function BentoChart({ chart }: BentoChartProps) {
  const chartConfig = {
    value: {
      label: 'Value',
      color: '#4f46e5',
    },
  }

  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return (
          <LineChart data={chart.data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={chartConfig.value.color} />
          </LineChart>
        )
      case 'bar':
        return (
          <BarChart data={chart.data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="value" fill={chartConfig.value.color} />
          </BarChart>
        )
      default:
        return null
    }
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      {renderChart()}
    </ChartContainer>
  )
}
