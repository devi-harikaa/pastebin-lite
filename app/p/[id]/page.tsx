import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function ViewPaste({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headerList = await headers(); 
  const host = headerList.get("host");
  const testNow = headerList.get("x-test-now-ms");
  const protocol = host?.includes("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/pastes/${id}`, {
    headers: testNow ? { "x-test-now-ms": testNow } : {},
    cache: 'no-store'
  });

  if (!res.ok) notFound();
  const data = await res.json();

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <pre className="p-4 bg-gray-900 text-white border border-gray-700 rounded whitespace-pre-wrap break-words font-mono">
        {data.content}
      </pre>
    </div>
  );
}