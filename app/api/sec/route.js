export const dynamic = "force-dynamic";

export async function GET(request) {

  try {

    const { searchParams } =
      new URL(request.url);

    const ticker =
      searchParams.get("ticker");

    if (!ticker) {

      return Response.json({
        error: "Ticker required"
      });

    }

    const headers = {

      "User-Agent":
        "PPE-Analyst your_email@example.com",

      "Accept-Encoding":
        "gzip, deflate",

      "Host":
        "data.sec.gov"

    };

    // STEP 1 — Ticker → CIK

    const tickerResponse =
      await fetch(
        "https://www.sec.gov/files/company_tickers.json",
        { headers }
      );

    const tickerData =
      await tickerResponse.json();

    let cik = null;

    Object.values(tickerData).forEach(company => {

      if (
        company.ticker.toUpperCase() ===
        ticker.toUpperCase()
      ) {

        cik =
          company.cik_str
            .toString()
            .padStart(10, "0");

      }

    });

    if (!cik) {

      return Response.json({
        error: "Ticker not found"
      });

    }

    // STEP 2 — Pull Company Facts (XBRL)

    const factsResponse =
      await fetch(
        `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
        { headers }
      );

    const facts =
      await factsResponse.json();

    const usgaap =
      facts.facts["us-gaap"];

    // STEP 3 — Extract PPE Tags

    const ppeTags = [

      "PropertyPlantAndEquipmentNet",
      "PropertyPlantAndEquipmentGross",
      "PropertyPlantAndEquipment",
      "PropertyPlantEquipmentNet"

    ];

    let ppeValue = null;

    for (let tag of ppeTags) {

      if (usgaap[tag]) {

        const units =
          usgaap[tag].units;

        const usd =
          units["USD"];

        if (usd && usd.length > 0) {

          ppeValue =
            usd[usd.length - 1].val;

          break;

        }

      }

    }

    if (!ppeValue) {

      return Response.json({
        error:
          "PPE value not found in XBRL"
      });

    }

    // STEP 4 — Extract Depreciation

    let depreciationValue = null;

    if (
      usgaap["DepreciationDepletionAndAmortization"]
    ) {

      const depUnits =
        usgaap[
          "DepreciationDepletionAndAmortization"
        ].units["USD"];

      if (depUnits &&
          depUnits.length > 0) {

        depreciationValue =
          depUnits[
            depUnits.length - 1
          ].val;

      }

    }

    // STEP 5 — Build Asset Model

    const estimatedLife = 20;

    const estimatedResidual =
      Math.round(ppeValue * 0.05);

    const asset = {

      id: 1,

      name:
        "Total PPE (SEC Derived)",

      cost: ppeValue,

      residual: estimatedResidual,

      life: estimatedLife

    };

    return Response.json({

      ticker: ticker,

      cik: cik,

      ppeValue: ppeValue,

      depreciationValue:
        depreciationValue,

      assets: [asset]

    });

  }

  catch (error) {

    console.log(error);

    return Response.json({

      error:
        "SEC XBRL extraction failed"

    });

  }

}
