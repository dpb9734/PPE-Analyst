"use client";

import { useState, useEffect } from "react";

export default function Home() {

  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "Equipment",
      cost: 100000,
      residual: 10000,
      life: 20
    }
  ]);

  const [meanDep, setMeanDep] = useState(0);
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

  function updateAsset(id, field, value) {

    setAssets(
      assets.map(asset =>
        asset.id === id
          ? { ...asset, [field]: value }
          : asset
      )
    );

  }

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
          (asset.cost - residualVar) / lifeVar;

        totalDep += dep;

      });

      results.push(totalDep);

    }

    let mean =
      results.reduce((a, b) => a + b, 0) /
      results.length;

    setMeanDep(mean.toFixed(2));

  }

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

  return (

    <div style={{ padding: 40 }}>

      <h1>PPE Multi-Asset Simulator</h1>

      {assets.map(asset => (

        <div key={asset.id}
             style={{
               border: "1px solid gray",
               padding: 10,
               marginBottom: 10
             }}>

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
