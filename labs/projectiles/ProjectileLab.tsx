import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowRight,
  RotateCcw,
  Activity,
  Ruler,
  Target,
  TrendingUp,
  Variable,
  Clock,
} from "lucide-react";
import { ProjectileState, SolvedVariables } from "./types";
import { solveProjectileSystem, generateTrajectory } from "./utils";
import VariableInput from "../../components/VariableInput";
import TrajectoryChart from "./components/TrajectoryChart";
import QuizCard from "./components/QuizCard";
import MathDisplay from "../../components/MathDisplay";

const ProjectileLab: React.FC = () => {
  const [inputs, setInputs] = useState<ProjectileState>({
    u: null,
    theta: null,
    y0: 0,
    range: null,
    maxHeight: null,
    flightTime: null,
  });

  const [solvedData, setSolvedData] = useState<SolvedVariables | null>(null);
  const [mode, setMode] = useState<"input" | "simulation">("input");
  const [correctGuesses, setCorrectGuesses] = useState<Record<string, boolean>>({});
  const [chartOverrides, setChartOverrides] = useState<{
    range: boolean;
    maxHeight: boolean;
    flightTime: boolean;
    vy: boolean;
  }>({
    range: false,
    maxHeight: false,
    flightTime: false,
    vy: false,
  });

  const [randomTimeTarget, setRandomTimeTarget] = useState<number | null>(null);
  const [randomDistanceTarget, setRandomDistanceTarget] = useState<number | null>(null);

  // Helper to update URL without reloading
  const updateUrl = (state: ProjectileState) => {
    const params = new URLSearchParams();
    if (state.u !== null) params.set("u", state.u.toString());
    if (state.theta !== null) params.set("theta", state.theta.toString());
    if (state.y0 !== null && state.y0 !== 0) params.set("y0", state.y0.toString());
    if (state.range !== null) params.set("range", state.range.toString());
    if (state.maxHeight !== null) params.set("maxHeight", state.maxHeight.toString());
    if (state.flightTime !== null) params.set("flightTime", state.flightTime.toString());

    const newUrl = `${window.location.pathname}?${params.toString()}`;

    try {
      window.history.pushState({ path: newUrl }, "", newUrl);
    } catch (error) {
      console.warn("Unable to update URL history:", error);
    }
  };

  const runSimulation = (config: ProjectileState) => {
    const result = solveProjectileSystem(config);
    if (result) {
      setSolvedData(result);
      setMode("simulation");
      setChartOverrides({ range: false, maxHeight: false, flightTime: false, vy: false });

      const safeTime = result.flightTime * (0.2 + Math.random() * 0.6);
      setRandomTimeTarget(safeTime);

      const safeDist = result.range * (0.2 + Math.random() * 0.6);
      setRandomDistanceTarget(safeDist);

      const initialRevealed: Record<string, boolean> = {};
      if (config.theta !== null) initialRevealed.theta = true;
      if (config.y0 !== null) initialRevealed.y0 = true;
      if (config.u !== null) initialRevealed.u = true;
      if (config.range !== null) initialRevealed.range = true;
      if (config.maxHeight !== null) initialRevealed.maxHeight = true;
      if (config.flightTime !== null) initialRevealed.flightTime = true;
      setCorrectGuesses(initialRevealed);
    } else {
      console.warn("Invalid configuration provided.");
    }
  };

  const randomizeInputs = useCallback(() => {
    const scenarios = ["standard", "range_theta", "height_theta", "range_time"];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    const baseU = 15 + Math.random() * 35;
    const baseTheta = 30 + Math.random() * 45;
    const rad = (baseTheta * Math.PI) / 180;
    const g = 9.81;

    const trueRange = (Math.pow(baseU, 2) * Math.sin(2 * rad)) / g;
    const trueHeight = (Math.pow(baseU, 2) * Math.pow(Math.sin(rad), 2)) / (2 * g);
    const trueTime = (2 * baseU * Math.sin(rad)) / g;

    const newInputs: ProjectileState = {
      u: null,
      theta: null,
      y0: 0,
      range: null,
      maxHeight: null,
      flightTime: null,
    };

    const fmt = (n: number) => parseFloat(n.toFixed(2));

    switch (scenario) {
      case "standard":
        newInputs.u = fmt(baseU);
        newInputs.theta = fmt(baseTheta);
        break;
      case "range_theta":
        newInputs.range = fmt(trueRange);
        newInputs.theta = fmt(baseTheta);
        break;
      case "height_theta":
        newInputs.maxHeight = fmt(trueHeight);
        newInputs.theta = fmt(baseTheta);
        break;
      case "range_time":
        newInputs.range = fmt(trueRange);
        newInputs.flightTime = fmt(trueTime);
        break;
    }

    setInputs(newInputs);
    setMode("input");
    setSolvedData(null);
    setCorrectGuesses({});
    setChartOverrides({ range: false, maxHeight: false, flightTime: false, vy: false });
    setRandomTimeTarget(null);
    setRandomDistanceTarget(null);
    updateUrl(newInputs);
  }, []);

  // Initial load effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasParams = Array.from(params.keys()).length > 0;

    if (hasParams) {
      const paramInputs: ProjectileState = {
        u: params.get("u") ? parseFloat(params.get("u")!) : null,
        theta: params.get("theta") ? parseFloat(params.get("theta")!) : null,
        y0: params.get("y0") ? parseFloat(params.get("y0")!) : 0,
        range: params.get("range") ? parseFloat(params.get("range")!) : null,
        maxHeight: params.get("maxHeight") ? parseFloat(params.get("maxHeight")!) : null,
        flightTime: params.get("flightTime") ? parseFloat(params.get("flightTime")!) : null,
      };
      setInputs(paramInputs);

      // If enough info is present, auto-run
      if (solveProjectileSystem(paramInputs)) {
        runSimulation(paramInputs);
      }
    }
    // Don't auto-randomize on initial load - only randomize when explicitly requested
  }, []);

  const handleInputChange = (key: keyof ProjectileState, value: string) => {
    const numVal = value === "" ? null : parseFloat(value);
    setInputs((prev) => {
      const newState = { ...prev, [key]: numVal };
      return newState;
    });
    if (mode === "simulation") {
      setMode("input");
      setSolvedData(null);
      const newState = { ...inputs, [key]: numVal };
      updateUrl(newState);
    }
  };

  const canSimulate = useMemo(() => {
    const { u, theta, range, maxHeight, flightTime } = inputs;
    if (u !== null && theta !== null) return true;
    if (range !== null && theta !== null) return true;
    if (maxHeight !== null && theta !== null) return true;
    if (flightTime !== null && theta !== null) return true;
    if (range !== null && flightTime !== null) return true;
    return false;
  }, [inputs]);

  const startSimulation = () => {
    if (canSimulate) {
      updateUrl(inputs);
      runSimulation(inputs);
    } else {
      alert("Invalid inputs or physically impossible configuration. Please check your values.");
    }
  };

  const handleCorrectSolve = (key: string) => {
    setCorrectGuesses((prev) => ({ ...prev, [key]: true }));
  };

  const toggleChartOverride = (key: "range" | "maxHeight" | "flightTime" | "vy") => {
    setChartOverrides((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const trajectoryData = useMemo(() => {
    return solvedData ? generateTrajectory(solvedData) : [];
  }, [solvedData]);

  const extraValues = useMemo(() => {
    if (!solvedData) return { h: 0, v: 0, tPeak: 0, distAtT: 0, tAtDist: 0 };

    const { u, theta, y0 } = solvedData;
    const rad = (theta * Math.PI) / 180;

    // Calculations for randomTimeTarget
    let h = 0,
      v = 0,
      distAtT = 0;
    if (randomTimeTarget !== null) {
      const uy = u * Math.sin(rad);
      const ux = u * Math.cos(rad);
      const t = randomTimeTarget;

      h = y0 + uy * t - 0.5 * 9.81 * t * t;
      distAtT = ux * t;

      const vyt = uy - 9.81 * t;
      v = Math.sqrt(ux * ux + vyt * vyt);
    }

    // Calculations for randomDistanceTarget
    let tAtDist = 0;
    if (randomDistanceTarget !== null) {
      const ux = u * Math.cos(rad);
      tAtDist = randomDistanceTarget / ux;
    }

    const tPeak = (u * Math.sin(rad)) / 9.81;

    return {
      h: Math.max(0, h),
      v: v,
      tPeak: tPeak,
      distAtT: distAtT,
      tAtDist: tAtDist,
    };
  }, [solvedData, randomTimeTarget, randomDistanceTarget]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Variable className="w-4 h-4" /> Configuration
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={randomizeInputs}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
                >
                  <RotateCcw className="w-3 h-3" /> Randomize
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="col-span-2 sm:col-span-1">
                  <VariableInput
                    label="Initial Velocity"
                    symbol="u"
                    unit="m/s"
                    value={inputs.u}
                    onChange={(v) => handleInputChange("u", v)}
                    icon={TrendingUp}
                    highlight={inputs.u !== null}
                    disabled={mode === "simulation"}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <VariableInput
                    label="Launch Angle"
                    symbol="\theta"
                    unit="°"
                    value={inputs.theta}
                    onChange={(v) => handleInputChange("theta", v)}
                    icon={RotateCcw}
                    highlight={inputs.theta !== null}
                    disabled={mode === "simulation"}
                  />
                </div>
                <div className="col-span-2">
                  <VariableInput
                    label="Initial Height"
                    symbol="y_0"
                    unit="m"
                    value={inputs.y0}
                    onChange={(v) => handleInputChange("y0", v)}
                    icon={Ruler}
                    highlight={inputs.y0 !== null && inputs.y0 !== 0}
                    disabled={mode === "simulation"}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <VariableInput
                    label="Range"
                    symbol="R"
                    unit="m"
                    value={inputs.range}
                    onChange={(v) => handleInputChange("range", v)}
                    icon={Target}
                    disabled={mode === "simulation"}
                    highlight={inputs.range !== null}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <VariableInput
                    label="Max Height"
                    symbol="H"
                    unit="m"
                    value={inputs.maxHeight}
                    onChange={(v) => handleInputChange("maxHeight", v)}
                    icon={Activity}
                    disabled={mode === "simulation"}
                    highlight={inputs.maxHeight !== null}
                  />
                </div>
                <div className="col-span-2">
                  <VariableInput
                    label="Flight Time"
                    symbol="t"
                    unit="s"
                    value={inputs.flightTime}
                    onChange={(v) => handleInputChange("flightTime", v)}
                    icon={Clock}
                    disabled={mode === "simulation"}
                    highlight={inputs.flightTime !== null}
                  />
                </div>
              </div>

              <div className="pt-2">
                {mode === "input" ? (
                  <button
                    onClick={startSimulation}
                    disabled={!canSimulate}
                    className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-white font-semibold transition-all ${
                      canSimulate
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5"
                        : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    {canSimulate ? "Launch Simulation" : "Fill Required Fields"}{" "}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={randomizeInputs}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all border border-slate-300"
                  >
                    <RotateCcw className="w-5 h-5" /> New Scenario
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
              Quick Reference
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span>Horizontal</span>
                <MathDisplay latex="$u_x = u \cos \theta$" />
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span>Vertical</span>
                <MathDisplay latex="$u_y = u \sin \theta$" />
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span>Range</span>
                <MathDisplay latex="$R = \frac{u^2 \sin(2\theta)}{g}$" />
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span>Time</span>
                <MathDisplay latex="$t = \frac{2u \sin \theta}{g}$" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {mode === "simulation" && solvedData && (
            <>
              <TrajectoryChart
                data={trajectoryData}
                maxHeight={solvedData.maxHeight}
                range={solvedData.range}
                revealedX={!!correctGuesses.range || chartOverrides.range}
                revealedY={!!correctGuesses.maxHeight || chartOverrides.maxHeight}
                revealedTime={!!correctGuesses.flightTime || chartOverrides.flightTime}
                revealedVy={chartOverrides.vy}
                onToggleX={() => toggleChartOverride("range")}
                onToggleY={() => toggleChartOverride("maxHeight")}
                onToggleTime={() => toggleChartOverride("flightTime")}
                onToggleVy={() => toggleChartOverride("vy")}
              />

              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-bold text-slate-800">Solve for Unknowns</h2>
                  <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm font-mono">
                    <MathDisplay latex="$g = 9.81 \text{ m/s}^2$" />
                  </span>
                </div>

                <div className="space-y-4">
                  {inputs.u === null && (
                    <QuizCard
                      variableKey="u"
                      label="Initial Velocity (u)"
                      correctValue={solvedData.u}
                      unit="m/s"
                      inputs={inputs}
                      solvedData={solvedData}
                      hint="Find the initial launch speed required to achieve the observed motion."
                      onSolve={() => handleCorrectSolve("u")}
                    />
                  )}

                  {inputs.theta === null && (
                    <QuizCard
                      variableKey="theta"
                      label="Launch Angle (θ)"
                      correctValue={solvedData.theta}
                      unit="°"
                      inputs={inputs}
                      solvedData={solvedData}
                      hint="Determine the angle of elevation at the launch point."
                      onSolve={() => handleCorrectSolve("theta")}
                    />
                  )}

                  {inputs.maxHeight === null && (
                    <QuizCard
                      variableKey="maxHeight"
                      label="Maximum Height (H)"
                      correctValue={solvedData.maxHeight}
                      unit="m"
                      inputs={inputs}
                      solvedData={solvedData}
                      hint="Calculate the peak vertical displacement attained during flight."
                      onSolve={() => handleCorrectSolve("maxHeight")}
                    />
                  )}

                  {inputs.range === null && (
                    <QuizCard
                      variableKey="range"
                      label="Range (R)"
                      correctValue={solvedData.range}
                      unit="m"
                      inputs={inputs}
                      solvedData={solvedData}
                      hint="Calculate the total horizontal distance traveled."
                      onSolve={() => handleCorrectSolve("range")}
                    />
                  )}

                  {inputs.flightTime === null && (
                    <QuizCard
                      variableKey="flightTime"
                      label="Time of Flight (t)"
                      correctValue={solvedData.flightTime}
                      unit="s"
                      inputs={inputs}
                      solvedData={solvedData}
                      hint="Determine the total duration the projectile remains in the air."
                      onSolve={() => handleCorrectSolve("flightTime")}
                    />
                  )}

                  <QuizCard
                    variableKey="timeToMaxHeight"
                    label="Time to Reach Max Height"
                    correctValue={extraValues.tPeak}
                    unit="s"
                    inputs={inputs}
                    solvedData={solvedData}
                    hint="How long does it take for the projectile to reach its highest point (where vertical velocity is zero)?"
                    onSolve={() => handleCorrectSolve("timeToMaxHeight")}
                  />

                  {randomTimeTarget !== null && (
                    <QuizCard
                      variableKey="heightAtTime"
                      label={`Height at t = ${randomTimeTarget.toFixed(2)} s`}
                      correctValue={extraValues.h}
                      unit="m"
                      inputs={inputs}
                      solvedData={solvedData}
                      extraParams={{ time: randomTimeTarget }}
                      hint={`Calculate the vertical position of the projectile exactly ${randomTimeTarget.toFixed(2)} seconds after launch.`}
                      onSolve={() => handleCorrectSolve("heightAtTime")}
                    />
                  )}

                  {randomTimeTarget !== null && (
                    <QuizCard
                      variableKey="distanceAtTime"
                      label={`Horizontal Distance at t = ${randomTimeTarget.toFixed(2)} s`}
                      correctValue={extraValues.distAtT}
                      unit="m"
                      inputs={inputs}
                      solvedData={solvedData}
                      extraParams={{ time: randomTimeTarget }}
                      hint={`How far horizontally has the projectile traveled after ${randomTimeTarget.toFixed(2)} seconds?`}
                      onSolve={() => handleCorrectSolve("distanceAtTime")}
                    />
                  )}

                  {randomDistanceTarget !== null && (
                    <QuizCard
                      variableKey="timeToDistance"
                      label={`Time to reach Distance x = ${randomDistanceTarget.toFixed(2)} m`}
                      correctValue={extraValues.tAtDist}
                      unit="s"
                      inputs={inputs}
                      solvedData={solvedData}
                      extraParams={{ distance: randomDistanceTarget }}
                      hint={`How long does it take for the projectile to travel ${randomDistanceTarget.toFixed(2)} meters horizontally?`}
                      onSolve={() => handleCorrectSolve("timeToDistance")}
                    />
                  )}

                  {randomTimeTarget !== null && (
                    <QuizCard
                      variableKey="velocityAtTime"
                      label={`Velocity (speed) at t = ${randomTimeTarget.toFixed(2)} s`}
                      correctValue={extraValues.v}
                      unit="m/s"
                      inputs={inputs}
                      solvedData={solvedData}
                      extraParams={{ time: randomTimeTarget }}
                      hint={`Calculate the total magnitude of velocity (resultant of horizontal and vertical components) at ${randomTimeTarget.toFixed(2)} seconds.`}
                      onSolve={() => handleCorrectSolve("velocityAtTime")}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {mode === "input" && (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 p-8 text-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-slate-100">
                <Activity className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Configure Simulation</h3>
              <p className="max-w-md text-slate-500 mb-6">
                Enter <strong>any two</strong> compatible variables on the left to begin, or click
                the randomize button to generate a practice problem.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400 w-full max-w-2xl">
                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded border border-slate-100">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span>Velocity + Angle</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded border border-slate-100">
                  <Target className="w-5 h-5 text-green-400" />
                  <span>Range + Angle</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded border border-slate-100">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span>Time + Angle</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded border border-slate-100">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Range + Time</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectileLab;
