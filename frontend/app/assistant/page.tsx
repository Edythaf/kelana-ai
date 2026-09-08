"use client";

import { useState } from "react";

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function askKelanaAI() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSources([]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question,
          }),
        }
      );

      const data = await response.json();

      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      setAnswer("Failed to get an answer from KelanaAI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">
        KelanaAI Travel Assistant
      </h1>

      <p className="text-gray-600 mb-6">
        Ask questions using trusted travel knowledge.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a travel question..."
          className="flex-1 border rounded-lg p-3"
        />

        <button
          onClick={askKelanaAI}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>

      {answer && (
        <div className="mt-8 border rounded-lg p-5">
          <h2 className="font-bold mb-2">AI Answer</h2>

          <p>{answer}</p>

          {sources.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold">Source</p>

              {sources.map((source, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {source}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}