"use client";
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<{id: string, url: string} | null>(null);

  const create = async () => {
    const res = await fetch("/api/pastes", {
      method: "POST",
      body: JSON.stringify({ content, ttl_seconds: 3600, max_views: 5 }),
    });
    if (res.ok) setResult(await res.json());
  };

  return (
    <div className="p-20 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold font-sans">New Paste</h1>
      <textarea className="w-full h-40 border p-2 rounded font-mono" onChange={e => setContent(e.target.value)} />
      <button className="bg-blue-600 text-white p-2 rounded w-full font-sans hover:bg-blue-700" onClick={create}>Create Paste</button>
      {result && <p className="p-4 bg-green-50 rounded border border-green-200 font-sans">Share: <a href={result.url} className="underline text-blue-600">{result.url}</a></p>}
    </div>
  );
}