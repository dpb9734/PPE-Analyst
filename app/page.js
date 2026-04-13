"use client";

import { useState, useEffect } from "react";

export default function Home() {

  // Ticker input
  const [ticker, setTicker] = useState("");

  // Assets
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

  // Forecast schedule
  const [schedule, setSchedule] = useState([]);

  // URL parameters support
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

  // Update asset
  function updateAsset(id, field, value) {

    setAssets(
      assets.map(asset =>
        asset.id === id
          ? { ...asset, [field]: value }
          : asset
      )
    );

  }

  // Add asset
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

  // Monte Carlo
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

  // Forecast
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

  // SEC Fetch (REAL API CALL)
  async function fetchSECData() {

    try {

      if (!ticker) {

        alert("Enter a ticker first.");
        return;

      }

      const response =
        await fetch(
          `/api/sec?ticker=${ticker}`
        );

      const data =
        await response.json();

      if (data.error) {

        alert(data.error);
        return;

      }

      // Show filing link (temporary UI)
      alert(
        `Latest 10-K Found:\n${data.filingURL}`
      );

      console.log(
        "CIK:",
        data.cik
      );

      console.log(
        "Filing:",
        data.filingURL
      );

    }

    catch (error) {

      console.log(error);

      alert(
        "SEC request failed."
      );

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
          onChange={(e)=>
            setTicker(e.target.value)
          }
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
