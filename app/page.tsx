"use client";

import React, { useState } from "react";

export default function Home() {

  const [usefulLife, setUsefulLife] = useState(20);
  const [residual, setResidual] = useState(10000);
  const [cost, setCost] = useState(100000);

  function calculateDep() {
    return ((cost - residual) / usefulLife).toFixed(2);
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

      <h2>
        Annual Depreciation:
        ${calculateDep()}
      </h2>

    </div>

  );

}
