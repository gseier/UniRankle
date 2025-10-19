import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "./ui/chart";
import type { ChartConfig } from "./ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import SimpleTooltip from "./ui/SimpleToolTip";

interface ChartProps {
  data: { name: string; count: number }[];
}

const chartConfig = {
    count: {
      label: "Games",
      color: "hsl(243.8, 90.1%, 59.2%)", // Indigo
    },
} satisfies ChartConfig

const UserScoreDistributionChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Your All-Time Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={data} margin={{ top: 20, right: 20, left: -5, bottom: 10 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                label={{ value: 'Score', position: 'insideBottom', offset: -10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                allowDecimals={false}
                label={{ value: 'Games', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <ChartTooltip cursor={false} content={<SimpleTooltip typeLabel="Games" />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default UserScoreDistributionChart;
