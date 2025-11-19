import { ProjectileState, SolvedVariables, TrajectoryPoint } from './types';
import { Step } from '../../types/shared';
import { G } from './constants';

// Converts degrees to radians
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Attempts to solve the projectile motion system based on provided inputs.
 */
export const solveProjectileSystem = (inputs: ProjectileState): SolvedVariables | null => {
  let u = inputs.u;
  let theta = inputs.theta;
  let y0 = inputs.y0 || 0; 
  let range = inputs.range;
  let maxHeight = inputs.maxHeight;
  let flightTime = inputs.flightTime;

  // CASE A: We have U and Theta (The Standard Model)
  if (u !== null && theta !== null) {
    const thetaRad = toRad(theta);
    const ux = u * Math.cos(thetaRad);
    const uy = u * Math.sin(thetaRad);
    
    // Time to peak (when vy = 0)
    const tPeak = uy / G;
    const calculatedMaxHeight = y0 + uy * tPeak - 0.5 * G * Math.pow(tPeak, 2);
    
    // Total flight time
    const calculatedFlightTime = (uy + Math.sqrt(Math.pow(uy, 2) + 2 * G * y0)) / G;
    const calculatedRange = ux * calculatedFlightTime;

    return {
      u,
      theta,
      y0,
      ux,
      uy,
      range: calculatedRange,
      maxHeight: calculatedMaxHeight,
      flightTime: calculatedFlightTime
    };
  }

  // CASE B: Range and Theta provided
  if (range !== null && theta !== null) {
    const thetaRad = toRad(theta);
    const sin2Theta = Math.sin(2 * thetaRad);
    if (sin2Theta <= 0.0001) return null;

    const calculatedU = Math.sqrt((range * G) / sin2Theta);
    return solveProjectileSystem({ ...inputs, u: calculatedU, range: null }); // Recursively solve
  }

  // CASE C: Max Height and Theta provided
  if (maxHeight !== null && theta !== null) {
    const thetaRad = toRad(theta);
    const sinTheta = Math.sin(thetaRad);
    if (Math.abs(sinTheta) <= 0.0001) return null;

    const calculatedU = Math.sqrt((2 * G * maxHeight) / Math.pow(sinTheta, 2));
    return solveProjectileSystem({ ...inputs, u: calculatedU, maxHeight: null });
  }

  // CASE D: Flight Time and Theta provided
  if (flightTime !== null && theta !== null) {
    const thetaRad = toRad(theta);
    const sinTheta = Math.sin(thetaRad);
    if (Math.abs(sinTheta) <= 0.0001) return null;

    const calculatedU = (G * flightTime) / (2 * sinTheta);
    return solveProjectileSystem({ ...inputs, u: calculatedU, flightTime: null });
  }

  // CASE E: Range and Flight Time provided
  if (range !== null && flightTime !== null) {
    const ux = range / flightTime;
    const uy = (G * flightTime) / 2;
    
    const calculatedU = Math.sqrt(Math.pow(ux, 2) + Math.pow(uy, 2));
    const calculatedTheta = toDeg(Math.atan2(uy, ux));

    return solveProjectileSystem({ ...inputs, u: calculatedU, theta: calculatedTheta, range: null, flightTime: null });
  }

  return null;
};

export const generateTrajectory = (vars: SolvedVariables, points = 100): TrajectoryPoint[] => {
  const data: TrajectoryPoint[] = [];
  if (!vars.flightTime || vars.flightTime <= 0) return [];

  const dt = vars.flightTime / points;
  
  for (let i = 0; i <= points; i++) {
    const t = i * dt;
    const x = vars.ux * t;
    const y = vars.y0 + vars.uy * t - 0.5 * G * t * t;
    data.push({ x, y: y < 0 ? 0 : y, t });
  }
  
  return data;
};

/**
 * Generates static step-by-step guides for solving variables.
 */
export const generateSteps = (
  target: string, 
  inputs: ProjectileState, 
  solved: SolvedVariables,
  extraParams?: { time?: number, distance?: number }
): Step[] => {
  const steps: Step[] = [];
  const theta = inputs.theta ?? solved.theta;
  const f = (n: number) => n.toFixed(2);
  
  // 1. Solving for Initial Velocity (u)
  if (target === 'u') {
    if (inputs.range !== null && inputs.theta !== null) {
      steps.push({
        explanation: "We know the Range ($R$) and Launch Angle ($\\theta$). We can use the range equation.",
        latex: "R = \\frac{u^2 \\sin(2\\theta)}{g}"
      });
      steps.push({
        explanation: "Rearrange the equation to solve for Initial Velocity ($u$):",
        latex: "u = \\sqrt{\\frac{R \\cdot g}{\\sin(2\\theta)}}"
      });
      steps.push({
        explanation: `Substitute $R = ${f(inputs.range)}$, $g = ${G}$, $\\theta = ${f(theta)}^\\circ$:`,
        latex: `u = \\sqrt{\\frac{${f(inputs.range)} \\cdot ${G}}{\\sin(${2 * theta})}}`
      });
      steps.push({
        explanation: "Calculate the result:",
        latex: `u \\approx ${f(solved.u)} \\text{ m/s}`
      });
    } else if (inputs.maxHeight !== null && inputs.theta !== null) {
       steps.push({
        explanation: "We know the Maximum Height ($H$) and Angle ($\\theta$). We can use the max height equation.",
        latex: "H = \\frac{u^2 \\sin^2(\\theta)}{2g}"
      });
      steps.push({
        explanation: "Rearrange to solve for $u$:",
        latex: "u = \\sqrt{\\frac{2gH}{\\sin^2(\\theta)}}"
      });
      steps.push({
        explanation: "Substitute and solve:",
        latex: `u = \\sqrt{\\frac{2 \\cdot ${G} \\cdot ${f(inputs.maxHeight)}}{\\sin^2(${f(theta)})}} \\approx ${f(solved.u)} \\text{ m/s}`
      });
    } else if (inputs.flightTime !== null && inputs.theta !== null) {
      steps.push({
        explanation: "We know Flight Time ($t$) and Angle ($\\theta$). Use the time of flight equation.",
        latex: "t = \\frac{2 u \\sin(\\theta)}{g}"
      });
      steps.push({
        explanation: "Rearrange to solve for $u$:",
        latex: "u = \\frac{g \\cdot t}{2 \\sin(\\theta)}"
      });
      steps.push({
        explanation: "Substitute and solve:",
        latex: `u = \\frac{${G} \\cdot ${f(inputs.flightTime)}}{2 \\sin(${f(theta)})} \\approx ${f(solved.u)} \\text{ m/s}`
      });
    } else if (inputs.range !== null && inputs.flightTime !== null) {
      steps.push({
        explanation: "We know Range ($R$) and Flight Time ($t$), but not the angle or velocity. We must find components first.",
        latex: "u_x = \\frac{R}{t}, \\quad u_y = \\frac{gt}{2}"
      });
      steps.push({
        explanation: "Calculate components:",
        latex: `u_x = \\frac{${f(inputs.range)}}{${f(inputs.flightTime)}} = ${f(solved.ux)}, \\quad u_y = \\frac{${G} \\cdot ${f(inputs.flightTime)}}{2} = ${f(solved.uy)}`
      });
      steps.push({
        explanation: "Combine components to find total velocity $u$:",
        latex: "u = \\sqrt{u_x^2 + u_y^2}"
      });
      steps.push({
        explanation: "Solve:",
        latex: `u = \\sqrt{${f(solved.ux)}^2 + ${f(solved.uy)}^2} \\approx ${f(solved.u)} \\text{ m/s}`
      });
    }
  }

  // 2. Solving for Angle (theta)
  else if (target === 'theta') {
    if (inputs.range !== null && inputs.flightTime !== null) {
      steps.push({
        explanation: "We calculated the horizontal and vertical velocity components ($u_x, u_y$) from Range and Time.",
        latex: `u_x = ${f(solved.ux)}, \\quad u_y = ${f(solved.uy)}`
      });
      steps.push({
        explanation: "Use trigonometry to find the angle $\\theta$:",
        latex: "\\theta = \\tan^{-1}\\left(\\frac{u_y}{u_x}\\right)"
      });
      steps.push({
        explanation: "Substitute and solve:",
        latex: `\\theta = \\tan^{-1}\\left(\\frac{${f(solved.uy)}}{${f(solved.ux)}}\\right) \\approx ${f(solved.theta)}^\\circ`
      });
    }
  }

  // 3. Solving for Range (R)
  else if (target === 'range') {
    steps.push({
      explanation: "Use the standard Range equation for projectile motion.",
      latex: "R = \\frac{u^2 \\sin(2\\theta)}{g}"
    });
    steps.push({
      explanation: `Substitute $u = ${f(solved.u)}$ and $\\theta = ${f(solved.theta)}$:`,
      latex: `R = \\frac{${f(solved.u)}^2 \\sin(2 \\cdot ${f(solved.theta)})}{${G}}`
    });
    steps.push({
      explanation: "Solve:",
      latex: `R \\approx ${f(solved.range)} \\text{ m}`
    });
  }

  // 4. Solving for Max Height (H)
  else if (target === 'maxHeight') {
    steps.push({
      explanation: "Use the Maximum Height equation.",
      latex: "H = \\frac{u^2 \\sin^2(\\theta)}{2g}"
    });
    steps.push({
      explanation: `Substitute $u = ${f(solved.u)}$ and $\\theta = ${f(solved.theta)}$:`,
      latex: `H = \\frac{${f(solved.u)}^2 \\sin^2(${f(solved.theta)})}{2 \\cdot ${G}}`
    });
    steps.push({
      explanation: "Solve:",
      latex: `H \\approx ${f(solved.maxHeight)} \\text{ m}`
    });
  }

  // 5. Solving for Time of Flight (t)
  else if (target === 'flightTime') {
     steps.push({
        explanation: "The time of flight is determined by the vertical component of velocity ($u_y$).",
        latex: "t = \\frac{2 u_y}{g} = \\frac{2u \\sin(\\theta)}{g}"
      });
      steps.push({
        explanation: "First, find the vertical velocity $u_y$:",
        latex: `u_y = u \\sin(\\theta) = ${f(solved.u)} \\sin(${f(solved.theta)}) \\approx ${f(solved.uy)}`
      });
      steps.push({
        explanation: "Substitute $u_y$ into the time equation:",
        latex: `t = \\frac{2 \\cdot ${f(solved.uy)}}{${G}}`
      });
       steps.push({
        explanation: "Solve:",
        latex: `t \\approx ${f(solved.flightTime)} \\text{ s}`
      });
  }

  // 6. Solving for Height at specific time t
  else if (target === 'heightAtTime' && extraParams?.time !== undefined) {
    const t = extraParams.time;
    const uy = solved.u * Math.sin(toRad(solved.theta));
    const y = (solved.y0 || 0) + uy * t - 0.5 * G * Math.pow(t, 2);
    
    steps.push({
      explanation: `We need to find the vertical position $s_y$ at time $t = ${f(t)}$ s.`,
      latex: "s_y = u_y t - \\frac{1}{2} g t^2"
    });
    steps.push({
      explanation: "First, ensure we have the initial vertical velocity $u_y$:",
      latex: `u_y = u \\sin(\\theta) = ${f(solved.u)} \\sin(${f(solved.theta)}) \\approx ${f(uy)} \\text{ m/s}`
    });
    steps.push({
      explanation: "Now substitute values into the displacement equation:",
      latex: `s_y = (${f(uy)} \\cdot ${f(t)}) - (0.5 \\cdot ${G} \\cdot ${f(t)}^2)`
    });
    steps.push({
      explanation: "Calculate:",
      latex: `s_y \\approx ${f(y)} \\text{ m}`
    });
  }

  // 7. Solving for Velocity at specific time t
  else if (target === 'velocityAtTime' && extraParams?.time !== undefined) {
    const t = extraParams.time;
    const uy0 = solved.u * Math.sin(toRad(solved.theta));
    const uyt = uy0 - G * t;
    const ux = solved.u * Math.cos(toRad(solved.theta));
    const v = Math.sqrt(ux * ux + uyt * uyt);

    steps.push({
      explanation: `To find velocity at $t = ${f(t)}$ s, we need both horizontal ($v_x$) and vertical ($v_y$) components.`,
      latex: "v = \\sqrt{v_x^2 + v_y^2}"
    });
    steps.push({
      explanation: "Horizontal velocity is constant:",
      latex: `v_x = u_x = u \\cos(\\theta) = ${f(solved.u)} \\cos(${f(solved.theta)}) \\approx ${f(ux)} \\text{ m/s}`
    });
    steps.push({
      explanation: "Vertical velocity changes due to gravity:",
      latex: `v_y = u_y - gt = (${f(solved.u)} \\sin(${f(solved.theta)})) - (${G} \\cdot ${f(t)})`
    });
    steps.push({
      explanation: "Calculate $v_y$:",
      latex: `v_y \\approx ${f(uy0)} - ${f(G * t)} = ${f(uyt)} \\text{ m/s}`
    });
    steps.push({
      explanation: "Combine components to find total speed:",
      latex: `v = \\sqrt{(${f(ux)})^2 + (${f(uyt)})^2} \\approx ${f(v)} \\text{ m/s}`
    });
  }

  // 8. Time to Max Height
  else if (target === 'timeToMaxHeight') {
    const tPeak = solved.flightTime / 2;
    steps.push({
      explanation: "At maximum height, the vertical velocity is zero ($v_y = 0$).",
      latex: "v_y = u_y - gt = 0 \\Rightarrow t = \\frac{u_y}{g}"
    });
    steps.push({
      explanation: "Calculate initial vertical velocity $u_y$:",
      latex: `u_y = u \\sin(\\theta) = ${f(solved.u)} \\sin(${f(solved.theta)}) \\approx ${f(solved.uy)}`
    });
    steps.push({
      explanation: "Divide by gravity:",
      latex: `t = \\frac{${f(solved.uy)}}{${G}}`
    });
    steps.push({
      explanation: "Solve:",
      latex: `t \\approx ${f(tPeak)} \\text{ s}`
    });
  }

  // 9. Distance at specific time t
  else if (target === 'distanceAtTime' && extraParams?.time !== undefined) {
    const t = extraParams.time;
    const ux = solved.u * Math.cos(toRad(solved.theta));
    const x = ux * t;

    steps.push({
      explanation: `We want to find the horizontal distance $s_x$ at time $t = ${f(t)}$ s. Horizontal velocity is constant.`,
      latex: "s_x = u_x \\cdot t"
    });
    steps.push({
      explanation: "Calculate horizontal velocity $u_x$:",
      latex: `u_x = u \\cos(\\theta) = ${f(solved.u)} \\cos(${f(solved.theta)}) \\approx ${f(ux)} \\text{ m/s}`
    });
    steps.push({
      explanation: "Substitute and solve:",
      latex: `s_x = ${f(ux)} \\cdot ${f(t)} \\approx ${f(x)} \\text{ m}`
    });
  }

  // 10. Time to reach specific distance x
  else if (target === 'timeToDistance' && extraParams?.distance !== undefined) {
    const x = extraParams.distance;
    const ux = solved.u * Math.cos(toRad(solved.theta));
    const t = x / ux;

    steps.push({
      explanation: `We want to find the time $t$ it takes to reach a horizontal distance $s_x = ${f(x)}$ m.`,
      latex: "s_x = u_x \\cdot t \\Rightarrow t = \\frac{s_x}{u_x}"
    });
    steps.push({
      explanation: "Calculate horizontal velocity $u_x$:",
      latex: `u_x = u \\cos(\\theta) = ${f(solved.u)} \\cos(${f(solved.theta)}) \\approx ${f(ux)} \\text{ m/s}`
    });
    steps.push({
      explanation: "Substitute and solve:",
      latex: `t = \\frac{${f(x)}}{${f(ux)}} \\approx ${f(t)} \\text{ s}`
    });
  }

  return steps;
};