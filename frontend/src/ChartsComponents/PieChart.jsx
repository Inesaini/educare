import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#6B9597", "#F4A261", "#CFE3E4", "#2E3D40"];

const PieChartCom = ({ apiUrl, title }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiUrl) return;

    setLoading(true);
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        // Assuming the data returned is an array of objects like [{name, value}, ...]
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading chart: {error}</p>;
  if (!data.length) return <p>No data available</p>;

  return (
    <div style={{ backgroundColor: "white", padding: "1rem" }}>
      <h3 style={{ textAlign: "left", marginBottom: "1rem", color: "#333" }}>
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartCom;

