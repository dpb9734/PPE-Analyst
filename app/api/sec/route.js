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
        "PPE-Analyst dpb9734@nyu.edu",

      "Accept-Encoding":
        "gzip, deflate",

      "Host":
        "data.sec.gov"

    };

    // STEP 1 — Convert ticker to CIK

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

    // STEP 2 — Find latest 10-K

    const submissionResponse =
      await fetch(
        `https://data.sec.gov/submissions/CIK${cik}.json`,
        { headers }
      );

    const submissionData =
      await submissionResponse.json();

    const filings =
      submissionData.filings.recent;

    const index =
      filings.form.findIndex(
        form => form === "10-K"
      );

    if (index === -1) {

      return Response.json({
        error: "10-K not found"
      });

    }

    const accession =
      filings.accessionNumber[index]
        .replace(/-/g, "");

    const primaryDoc =
      filings.primaryDocument[index];

    const filingURL =
      `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accession}/${primaryDoc}`;

    // STEP 3 — Download HTML

    const filingResponse =
      await fetch(
        filingURL,
        { headers }
      );

    const filingHTML =
      await filingResponse.text();

    const text =
      filingHTML.toLowerCase();

    // STEP 4 — Find useful life patterns

    const lifeMatches =
      text.match(
        /(\d+)\s*(to|-)\s*(\d+)\s*years/g
      );

    let assets = [];

    if (lifeMatches) {

      lifeMatches
        .slice(0, 4)
        .forEach((match, i) => {

          const numbers =
            match.match(/\d+/g);

          const avgLife =
            Math.round(
              (Number(numbers[0]) +
               Number(numbers[1])) / 2
            );

          assets.push({

            id: i + 1,

            name:
              `PPE Asset ${i + 1}`,

            cost: 100000000,

            residual: 5000000,

            life: avgLife

          });

        });

    }

    // fallback if nothing found

    if (assets.length === 0) {

      assets = [

        {
          id: 1,
          name: "General Equipment",
          cost: 100000000,
          residual: 5000000,
          life: 20
        }

      ];

    }

    return Response.json({

      ticker: ticker,

      cik: cik,

      filingURL: filingURL,

      assets: assets

    });

  }

  catch (error) {

    console.log(error);

    return Response.json({
      error: "SEC fetch failed"
    });

  }

}
