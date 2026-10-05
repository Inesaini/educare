import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";



const StackedBarComponent = ({ dataUrl, title }) => {
  const [data, setData] = useState([]);
  const [maxValue, setMaxValue] = useState(null);
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(dataUrl);
        const json = await res.json();
        setData(json);
        setMaxValue(Math.max(...json.map((d) => d.value)));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
   }, [dataUrl]);


  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 400,
        backgroundColor: "#ffffff",
        padding: "1rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "12px",
      }}
    >
      {/* Title at top-left */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 20,
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        {title}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 50, right: 30, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip />

          <Bar
            dataKey="value"
            radius={[10, 10, 10, 10]}
            label={{ position: "right", fill: "#000" }}
          >
            <LabelList dataKey="value" position="right" />
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value === maxValue ? "#F4A261" : "#679294"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StackedBarComponent;
