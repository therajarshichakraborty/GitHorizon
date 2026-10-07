export async function GET() {
  const allQuotes = [];
  let currentPage = 1;
  let hasNextPage = true;
  const limit = 5;

  try {
    while (hasNextPage) {
      const res = await fetch(
        `https://api.freeapi.app/api/v1/public/quotes?page=${currentPage}&limit=${limit}&query=human`,
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch page ${currentPage}`);
      }

      const result = await res.json();
      const data = result.data;

      if (data?.data?.length) {
        allQuotes.push(...data.data);
      }

      hasNextPage = data?.hasNextPage ?? false;

      if (hasNextPage) {
        currentPage++;
      }
    }
    console.log(allQuotes[0].content);
    return Response.json({
      success: true,
      total: allQuotes.length,
      quotes: allQuotes,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message ?? "Something went wrong",
      },
      { status: 500 },
    );
  }
}
