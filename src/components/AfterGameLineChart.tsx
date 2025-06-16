import React, { useEffect, useState } from "react";
import { DataPoint, SingleDataPoint } from "../types/data";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface ComponentProps {
  wpm: SingleDataPoint;
  rawWpm: SingleDataPoint;
  mistakes: SingleDataPoint;
}

const AfterGameLineChart: React.FC<ComponentProps> = ({
  wpm,
  rawWpm,
  mistakes,
}) => {
  const [transformedData, setTransformedData] = useState<DataPoint[]>([]);
  useEffect(() => {
    let tempList: DataPoint[] = [];
    for (const [key, value] of Object.entries(wpm)) {
      const newDataPoint: DataPoint = {
        time: Number(key),
        wpm: value,
        rawWpm: key in rawWpm ? rawWpm[Number(key)] : 0,
        mistakes: key in mistakes ? mistakes[Number(key)] : 0,
      };
      tempList = [...tempList, newDataPoint];
    }
    console.log(tempList);
    setTransformedData(tempList);
  }, [mistakes, rawWpm, wpm]);

  return (
    <div className="line-chart-container">
      <LineChart width={800} height={400} data={transformedData}>
        <Line
          strokeWidth={3}
          type="monotone"
          dataKey="wpm"
          stroke="#00FF00"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="rawWpm"
          stroke="#FFEA00"
          strokeWidth={3}
          strokeDasharray="5 5"
          dot={false}
        />
        <Line
          strokeWidth={3}
          type="monotone"
          dataKey="mistakes"
          stroke="#FF0000"
          dot={false}
        />

        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
      </LineChart>
    </div>
  );
};

export default AfterGameLineChart;
