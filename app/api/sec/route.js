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

    // STEP 2 — Company Facts

    const factsResponse =
      await fetch(
        `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
        { headers }
      );

    const facts =
      await factsResponse.json();

    const usgaap =
      facts.facts["us-gaap"];

    // STEP 3 — PPE COMPONENT TAGS

    const componentTags = [

      "Land",

      "Buildings",

      "MachineryAndEquipment",

      "FurnitureAndFixtures",

      "LeaseholdImprovements",

      "ConstructionInProgress",

      "OilAndGasProperties",

      "TransportationEquipment",

      "ComputerEquipment"

    ];

    let assets = [];

    componentTags.forEach((tag, index) => {

      if (usgaap[tag]) {

        const units =
          usgaap[tag].units["USD"];

        if (units &&
            units.length > 0) {

          const value =
            units[units.length - 1].val;

          assets.push({

            id: index + 1,

            name: tag,

            cost: value,

            residual:
              Math.round(value * 0.05),

            life: estimateLife(tag)

          });

        }

      }

    });

    // STEP 4 — Fallback if none found

    if (assets.length === 0 &&
        usgaap["PropertyPlantAndEquipmentNet"]) {

      const fallbackUnits =
        usgaap[
          "PropertyPlantAndEquipmentNet"
        ].units["USD"];

      const value =
        fallbackUnits[
          fallbackUnits.length - 1
        ].val;

      assets.push({

        id: 1,

        name: "Total PPE",

        cost: value,

        residual:
          Math.round(value * 0.05),

        life: 20

      });

    }

    return Response.json({

      ticker: ticker,

      cik: cik,

      assets: assets

    });

  }

  catch (error) {

    console.log(error);

    return Response.json({

      error:
        "SEC multi-asset extraction failed"

    });

  }

}


// LIFE ESTIMATION FUNCTION

function estimateLife(tag) {

  if (tag.includes("Buildings"))
    return 40;

  if (tag.includes("Machinery"))
    return 20;

  if (tag.includes("Transportation"))
    return 10;

  if (tag.includes("Computer"))
    return 5;

  if (tag.includes("Leasehold"))
    return 15;

  return 20;

}
