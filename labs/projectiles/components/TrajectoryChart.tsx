import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from "recharts";
import { TrajectoryPoint } from "../types";
import { Eye, EyeOff } from "lucide-react";

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
  maxHeight: number;
  range: number;
  revealedX: boolean;
  revealedY: boolean;
  revealedTime: boolean;
  revealedVy: boolean;
  onToggleX: () => void;
  onToggleY: () => void;
  onToggleTime: () => void;
  onToggleVy: () => void;
}

const TrajectoryChart: React.FC<TrajectoryChartProps> = ({
  data,
  maxHeight,
  range,
  revealedX,
  revealedY,
  revealedTime,
  revealedVy,
  onToggleX,
  onToggleY,
  onToggleTime,
  onToggleVy,
}) => {
  const xDomainMax = range > 0 ? Math.ceil(range * 1.1) : 10;
  const yDomainMax = maxHeight > 0 ? Math.ceil(maxHeight * 1.2) : 10;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white/95 border border-slate-300 p-3 rounded-lg shadow-lg z-50">
          <p className="font-semibold text-slate-700 text-sm mb-1">Trajectory Point</p>
          <p className="text-xs text-slate-600">
            Distance: {revealedX ? `${Number(label).toFixed(2)}m` : "???"}
          </p>
          <p className="text-xs text-blue-600">
            Height: {revealedY ? `${Number(point.y).toFixed(2)}m` : "???"}
          </p>
          <p className="text-xs text-purple-600">
            Vertical Velocity: {revealedVy ? `${Number(point.vy).toFixed(2)}m/s` : "???"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Time: {revealedTime ? `${point.t.toFixed(2)}s` : "???"}
          </p>
        </div>
      );
    }
    return null;
  };

  const ToggleButton = ({
    label,
    active,
    onClick,
    colorClass,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    colorClass: string;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors border ${active ? "bg-slate-50 border-slate-200" : "bg-transparent border-transparent hover:bg-slate-50"}`}
      title={`Toggle ${label} visibility`}
    >
      <span className={`w-2 h-2 rounded-full ${active ? colorClass : "bg-slate-300"}`}></span>
      <span className={`${active ? "text-slate-700" : "text-slate-400"} font-medium`}>{label}</span>
    </button>
  );

  return (
    <div className="w-full h-[28rem] bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Flight Path Simulation
        </h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <ToggleButton
            label="Range"
            active={revealedX}
            onClick={onToggleX}
            colorClass="bg-green-500"
          />
          <ToggleButton
            label="Height"
            active={revealedY}
            onClick={onToggleY}
            colorClass="bg-blue-500"
          />
          <ToggleButton
            label="Vertical Velocity"
            active={revealedVy}
            onClick={onToggleVy}
            colorClass="bg-purple-500"
          />
          <ToggleButton
            label="Time"
            active={revealedTime}
            onClick={onToggleTime}
            colorClass="bg-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="x"
              type="number"
              domain={[0, xDomainMax]}
              unit={revealedX ? "m" : ""}
              tickFormatter={(val) => (revealedX ? val : "?")}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />

            <YAxis
              dataKey="y"
              type="number"
              domain={[0, yDomainMax]}
              unit={revealedY ? "m" : ""}
              tickFormatter={(val) => (revealedY ? val : "?")}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
            />

            <ReferenceLine y={0} stroke="#000" strokeWidth={1} />

            <Line
              type="monotone"
              dataKey="y"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
              animationDuration={1500}
              isAnimationActive={true}
            />

            <Area type="monotone" dataKey="y" fill="#bfdbfe" fillOpacity={0.3} stroke="none" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrajectoryChart;
