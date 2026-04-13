"use client";

import { useState, useEffect } from "react";

export default function Home() {

  // Ticker input
  const [ticker, setTicker] = useState("");

  // Asset list
  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "Equipment",
      cost: 100000,
      residual: 10000,
      life: 20
    }
  ]);

  // Monte Carlo result
  const [meanDep, setMeanDep] = useState(0);

  // Forecast table
  const [schedule, setSchedule] = useState([]);

  // URL parameter support
  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const lifeParam = params.get("life");
    const residualParam = params.get("residual");
    const costParam = params.get("cost");

    if (lifeParam || residualParam || costParam) {

      setAssets([{
        id: 1,
        name: "Equipment",
        cost: Number(costParam) || 100000,
        residual: Number(residualParam) || 10000,
        life: Number(lifeParam) || 20
      }]);

    }

  }, []);

  // Update asset fields
  function updateAsset(id, field, value) {

    setAssets(
      assets.map(asset =>
        asset.id === id
          ? { ...asset, [field]: value }
          : asset
      )
    );

  }

  // Add new asset
  function addAsset() {

    setAssets([
      ...assets,
      {
        id: Date.now(),
        name: "New Asset",
        cost: 50000,
        residual: 5000,
        life: 15
      }
    ]);

  }

  // Monte Carlo simulation
  function runMonteCarlo() {

    let results = [];

    for (let i = 0; i < 500; i++) {

      let totalDep = 0;

      assets.forEach(asset => {

        let lifeVar =
          asset.life * (0.8 + Math.random() * 0.4);

        let residualVar =
          asset.residual *
          (0.8 + Math.random() * 0.4);

        let dep =
          (asset.cost - residualVar) /
          lifeVar;

        totalDep += dep;

      });

      results.push(totalDep);

    }

    let mean =
      results.reduce((a, b) => a + b, 0) /
      results.length;

    setMeanDep(mean.toFixed(2));

  }

  // Generate multi-year depreciation schedule
  function generateForecast() {

    let maxLife =
      Math.max(...assets.map(a => a.life));

    let yearlySchedule = [];

    for (let year = 1; year <= maxLife; year++) {

      let totalDep = 0;

      assets.forEach(asset => {

        if (year <= asset.life) {

          let dep =
            (asset.cost - asset.residual) /
            asset.life;

          totalDep += dep;

        }

      });

      yearlySchedule.push({
        year: year,
        depreciation: totalDep.toFixed(2)
      });

    }

    setSchedule(yearlySchedule);

  }

  // Simulated SEC Data Loader
  // (Real EDGAR connection comes next)
  async function fetchSECData() {

    try {

      let tickerUpper =
        ticker.toUpperCase();

      // Simulated company PPE data

      if (tickerUpper === "XOM") {

        setAssets([
          {
            id: 1,
            name: "Upstream Equipment",
            cost: 125000000,
            residual: 8000000,
            life: 22
          },
          {
            id: 2,
            name: "Facilities",
            cost: 85000000,
            residual: 5000000,
            life: 30
          }
        ]);

      }

      else if (tickerUpper === "CVX") {

        setAssets([
          {
            id: 1,
            name: "Refining Assets",
            cost: 98000000,
            residual: 6000000,
            life: 28
          },
          {
            id: 2,
            name: "Pipelines",
            cost: 72000000,
            residual: 4000000,
            life: 35
          }
        ]);

      }

      else {

        alert("Ticker not recognized yet.");

      }

    }

    catch (error) {

      console.log(error);

    }

  }

  return (

    <div style={{ padding: 40 }}>

      <h1>PPE Multi-Asset Simulator</h1>

      {/* Ticker Input */}

      <div style={{ marginBottom: 20 }}>

        <strong>Ticker:</strong>

        <input
          type="text"
          value={ticker}
          onChange={(e)=>setTicker(e.target.value)}
          placeholder="Enter ticker (e.g., XOM)"
        />

        <button onClick={fetchSECData}>
          Load SEC Data
        </button>

      </div>

      {/* Asset Inputs */}

      {assets.map(asset => (

        <div
          key={asset.id}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginBottom: 10
          }}
        >

          <div>

            <strong>Asset Name:</strong>

            <input
              type="text"
              value={asset.name}
              onChange={(e)=>
                updateAsset(
                  asset.id,
                  "name",
                  e.target.value
                )
              }
            />

          </div>

          <div>

            <strong>Cost:</strong>

            <input
              type="number"
              value={asset.cost}
              onChange={(e)=>
                updateAsset(
                  asset.id,
                  "cost",
                  Number(e.target.value)
                )
              }
            />

          </div>

          <div>

            <strong>Useful Life:</strong>

            <input
              type="number"
              value={asset.life}
              onChange={(e)=>
                updateAsset(
                  asset.id,
                  "life",
                  Number(e.target.value)
                )
              }
            />

          </div>

          <div>

            <strong>Residual:</strong>

            <input
              type="number"
              value={asset.residual}
              onChange={(e)=>
                updateAsset(
                  asset.id,
                  "residual",
                  Number(e.target.value)
                )
              }
            />

          </div>

        </div>

      ))}

      <button onClick={addAsset}>
        Add Asset
      </button>

      <br /><br />

      <button onClick={runMonteCarlo}>
        Run Portfolio Monte Carlo
      </button>

      <h2>
        Mean Portfolio Depreciation:
        ${meanDep}
      </h2>

      <br />

      <button onClick={generateForecast}>
        Generate Depreciation Forecast
      </button>

      <br /><br />

      {schedule.length > 0 && (

        <table border="1" cellPadding="5">

          <thead>

            <tr>
              <th>Year</th>
              <th>Depreciation</th>
            </tr>

          </thead>

          <tbody>

            {schedule.map(row => (

              <tr key={row.year}>

                <td>{row.year}</td>

                <td>${row.depreciation}</td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

}
