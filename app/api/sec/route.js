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

    // STEP 2 — Get latest 10-K

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

    // STEP 3 — Download filing

    const filingResponse =
      await fetch(
        filingURL,
        { headers }
      );

    const html =
      await filingResponse.text();

    // STEP 4 — Find PPE section

    const lower =
      html.toLowerCase();

    const ppeIndex =
      lower.indexOf(
        "property, plant and equipment"
      );

    let snippet = "";

    if (ppeIndex !== -1) {

      snippet =
        html.slice(
          ppeIndex,
          ppeIndex + 10000
        );

    }

    // STEP 5 — Extract dollar values

    const valueMatches =
      snippet.match(
        /\$?\s?\d{1,3}(,\d{3})+/g
      );

    let assets = [];

    if (valueMatches &&
        valueMatches.length > 0) {

      valueMatches
        .slice(0, 3)
        .forEach((val, i) => {

          let numeric =
            Number(
              val
                .replace(/\$/g, "")
                .replace(/,/g, "")
            );

          assets.push({

            id: i + 1,

            name:
              `PPE Category ${i + 1}`,

            cost: numeric,

            residual:
              Math.round(numeric * 0.05),

            life: 20

          });

        });

    }

    if (assets.length === 0) {

      return Response.json({
        error:
          "PPE table not detected"
      });

    }

    return Response.json({

      ticker: ticker,

      filingURL: filingURL,

      assets: assets

    });

  }

  catch (error) {

    console.log(error);

    return Response.json({
      error: "SEC parsing failed"
    });

  }

}
