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

    // Required SEC headers
    const headers = {

      "User-Agent":
        "PPE-Analyst dpb9734.edu",

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

    // STEP 2 — Get filings list

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

    // STEP 3 — Download filing HTML

    const filingResponse =
      await fetch(
        filingURL,
        { headers }
      );

    const filingHTML =
      await filingResponse.text();

    // Return preview

    return Response.json({

      ticker: ticker,

      cik: cik,

      filingURL: filingURL,

      preview:
        filingHTML.slice(0, 5000)

    });

  }

  catch (error) {

    console.log(error);

    return Response.json({
      error: "SEC fetch failed"
    });

  }

}
