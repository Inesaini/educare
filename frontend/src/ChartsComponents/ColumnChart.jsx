import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const ColumnChart = ({ url, title }) => {
  const [data, setData] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    axios.get(url)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
      });
  }, [url]);

  // Find max value across series1 and series2
  const allValues = data.flatMap(d => [d.series1, d.series2]);
  const maxValue = Math.max(...allValues);

  // Custom bar shape with rounded corners and highlight
  const HighlightBar = ({ value, x, y, width, height, fill }) => (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={10}
      ry={10}
      fill={value === maxValue ? "#e74c3c" : fill}
    />
  );

  return (
    <div style={{ backgroundColor: "#fff", padding: "20px", color: "black" }}>
      <h2 style={{ marginBottom: "10px", fontWeight: "600", color: "black" }}>
        {title}
      </h2>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#000" />
            <YAxis stroke="#000" />
            <Tooltip contentStyle={{ color: "#000" }} />
            <Bar
              dataKey="series1"
              fill="#3498db"
              shape={(props) => (
                <HighlightBar {...props} value={props.payload.series1} />
              )}
            />
            <Bar
              dataKey="series2"
              fill="#2ecc71"
              shape={(props) => (
                <HighlightBar {...props} value={props.payload.series2} />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: "gray" }}>Loading chart...</p>
      )}
    </div>
  );
};

export default ColumnChart;

