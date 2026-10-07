type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
interface PageProps {
  searchParams: SearchParams;
}
export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const userTyped = resolvedParams.text;
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Root Page URL Reader</h1>
      {userTyped ? (
        <div>
          <p>You typed in the URL:</p>
          <h2 style={{ color: "red" }}>{userTyped}</h2>
        </div>
      ) : (
        <div>
          <p>The URL is empty.</p>
          <p>
            Try typing this into your browser bar:{" "}
            <code style={{ background: "#000", padding: "4px" }}>
              localhost:3000/?hello=hello-world
            </code>
          </p>
        </div>
      )}
    </main>
  );
}
