import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import type { ChartConfig } from "./ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ChartProps {
  data: { name: string; count: number }[];
  userScore: number | null;
}

const chartConfig = {
  count: {
    label: "Players",
  },
} satisfies ChartConfig

const DailyScoreDistributionChart: React.FC<ChartProps> = ({ data, userScore }) => {
  
  const CustomLabel = ({ x, y, width, value, index }: { x?: number; y?: number; width?: number; value?: number; index?: number }) => {
      if (x === undefined || y === undefined || width === undefined || value === undefined || index === undefined) {
        return null;
      }
      const dataEntry = data[index];
    
      if (Number(dataEntry.name) === userScore && value > 0) {
        return (
          <text x={x + width / 2} y={y} dy={-4} fill="#1f2937" fontSize={12} textAnchor="middle">
            Your Score
          </text>
        );
      }
      return null;
    };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Today's Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                label={{ value: 'Score', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                allowDecimals={false}
                label={{ value: 'Players', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="count" radius={4}>
                 <LabelList content={<CustomLabel />} />
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={Number(entry.name) === userScore ? "hsl(243.8, 90.1%, 59.2%)" /* Indigo */ : "hsl(215.3, 22.2%, 80.8%)" /* Gray */}
                  />
                ))}
              </Bar>
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DailyScoreDistributionChart;
