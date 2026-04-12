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

  // URL parameters (first asset only)
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

  function calculateDep(asset) {

    return (asset.cost - asset.residual) / asset.life;

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

          <input
            value={asset.name}
            onChange={(e)=>
              updateAsset(
                asset.id,
                "name",
                e.target.value
              )
            }
          />

          <div>

            Cost:
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

            Useful Life:
            <input
              type="range"
              min="1"
              max="40"
              value={asset.life}
              onChange={(e)=>
                updateAsset(
                  asset.id,
                  "life",
                  Number(e.target.value)
                )
              }
            />

            {asset.life} years

          </div>

          <div>

            Residual:
            <input
              type="range"
              min="0"
              max="50000"
              value={asset.residual}
              onChange={(e)=>
                updateAsset(
                  asset.id,
                  "residual",
                  Number(e.target.value)
                )
              }
            />

            ${asset.residual}

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

    </div>

  );

}
