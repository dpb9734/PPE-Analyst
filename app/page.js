"use client";

import { useState, useEffect } from "react";

export default function Home() {

  const [usefulLife, setUsefulLife] = useState(20);
  const [residual, setResidual] = useState(10000);
  const [cost, setCost] = useState(100000);

  const [meanDep, setMeanDep] = useState(0);
  const [ciLow, setCiLow] = useState(0);
  const [ciHigh, setCiHigh] = useState(0);

  // Read URL parameters
  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const lifeParam = params.get("life");
    const residualParam = params.get("residual");
    const costParam = params.get("cost");

    if (lifeParam) setUsefulLife(Number(lifeParam));
    if (residualParam) setResidual(Number(residualParam));
    if (costParam) setCost(Number(costParam));

  }, []);

  function calculateDep(cost, residual, life) {
    return (cost - residual) / life;
  }

  function runMonteCarlo() {

    let results = [];

    for (let i = 0; i < 500; i++) {

      let lifeVar =
        usefulLife * (0.8 + Math.random() * 0.4);

      let residualVar =
        residual * (0.8 + Math.random() * 0.4);

      let dep =
        calculateDep(cost, residualVar, lifeVar);

      results.push(dep);
    }

    results.sort((a, b) => a - b);

    let mean =
      results.reduce((a, b) => a + b, 0) /
      results.length;

    let low =
      results[Math.floor(results.length * 0.025)];

    let high =
      results[Math.floor(results.length * 0.975)];

    setMeanDep(mean.toFixed(2));
    setCiLow(low.toFixed(2));
    setCiHigh(high.toFixed(2));
  }

  return (

    <div style={{ padding: 40 }}>

      <h1>PPE Sensitivity Dashboard</h1>

      <div>
        <label>Asset Cost</label>
        <input
          type="number"
          value={cost}
          onChange={(e)=>setCost(Number(e.target.value))}
        />
      </div>

      <div>
        <label>Useful Life</label>
        <input
          type="range"
          min="1"
          max="40"
          value={usefulLife}
          onChange={(e)=>setUsefulLife(Number(e.target.value))}
        />
        {usefulLife} years
      </div>

      <div>
        <label>Residual Value</label>
        <input
          type="range"
          min="0"
          max="50000"
          value={residual}
          onChange={(e)=>setResidual(Number(e.target.value))}
        />
        ${residual}
      </div>

      <br />

      <button onClick={runMonteCarlo}>
        Run Monte Carlo Simulation
      </button>

      <h2>
        Mean Depreciation:
        ${meanDep}
      </h2>

      <h3>
        95% Confidence Interval:
        ${ciLow} — ${ciHigh}
      </h3>

    </div>

  );

}

}
