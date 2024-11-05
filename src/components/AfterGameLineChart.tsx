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
  }, []);

  return (
    <div>
      <LineChart width={600} height={300} data={transformedData}>
        <Line type="monotone" dataKey="wpm" stroke="#8884d8" />
        <Line
          type="monotone"
          dataKey="rawWpm"
          stroke="#82ca9d"
          strokeDasharray="5 5"
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
