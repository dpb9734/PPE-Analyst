export async function GET(request) {

  try {

    const { searchParams } =
      new URL(request.url);

    const ticker =
      searchParams.get("ticker");

    // Step 1 — Convert ticker to CIK

    const tickerResponse =
      await fetch(
        "https://www.sec.gov/files/company_tickers.json"
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

    // Step 2 — Get company submissions

    const submissionResponse =
      await fetch(
        `https://data.sec.gov/submissions/CIK${cik}.json`,
        {
          headers: {
            "User-Agent":
              "PPE-Analysis-App"
          }
        }
      );

    const submissionData =
      await submissionResponse.json();

    // Step 3 — Get latest 10-K

    let filings =
      submissionData.filings.recent;

    let index =
      filings.form.findIndex(
        form => form === "10-K"
      );

    let accession =
      filings.accessionNumber[index]
        .replace(/-/g, "");

    let primaryDoc =
      filings.primaryDocument[index];

    let filingURL =
      `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accession}/${primaryDoc}`;

    return Response.json({

      ticker: ticker,
      cik: cik,
      filingURL: filingURL

    });

  }

  catch (error) {

    return Response.json({
      error: "SEC fetch failed"
    });

  }

}
