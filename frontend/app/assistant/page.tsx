"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/Navbar";

export default function AssistantPage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  async function askKelanaAI() {
    if (!question.trim() || loading) return;

    setLoading(true);
    setAnswer("");
    setSources([]);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured"
        );
      }

      const response = await fetch(
        `${API_URL}/assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to get an answer from KelanaAI"
        );
      }

      setAnswer(data.answer || "");
      setSources(data.sources || []);
    } catch (error) {
      console.error(
        "Assistant request failed:",
        error
      );

      setError(
        "KelanaAI couldn't answer that question. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function useSuggestedQuestion(text: string) {
    setQuestion(text);
    setAnswer("");
    setSources([]);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* PAGE HEADER */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            ▤ Trusted Travel Knowledge
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight">
            KelanaAI Travel Assistant
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Ask travel questions and get AI answers
            grounded in trusted knowledge using
            Retrieval-Augmented Generation.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* ASK CARD */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white">
              ✦
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Ask KelanaAI
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ask about destinations, travel
                requirements, attractions, or other
                information available in the KelanaAI
                knowledge base.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <label className="mb-2 block text-sm font-semibold">
              Your question
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    askKelanaAI();
                  }
                }}
                placeholder="e.g. What documents do I need to visit Japan?"
                rows={3}
                disabled={loading}
                className="min-h-[110px] flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <button
                onClick={askKelanaAI}
                disabled={
                  loading || !question.trim()
                }
                className="rounded-2xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:self-stretch"
              >
                {loading
                  ? "Searching..."
                  : "Ask AI ✦"}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Press Enter to ask · Shift + Enter for a
              new line
            </p>
          </div>

          {/* SUGGESTED QUESTIONS */}
          {!answer && !loading && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Try asking
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    useSuggestedQuestion(
                      "What documents do I need to travel to Japan?"
                    )
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Japan travel documents
                </button>

                <button
                  type="button"
                  onClick={() =>
                    useSuggestedQuestion(
                      "What are some attractions to visit in Tokyo?"
                    )
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Tokyo attractions
                </button>

                <button
                  type="button"
                  onClick={() =>
                    useSuggestedQuestion(
                      "What should I prepare before traveling?"
                    )
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Travel preparation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                ✦
              </div>

              <div>
                <p className="font-semibold text-blue-900">
                  KelanaAI is searching...
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  Retrieving relevant knowledge and
                  preparing an answer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
            {error}
          </div>
        )}

        {/* ANSWER */}
        {answer && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-7 py-6 sm:px-9">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                  K
                </div>

                <div>
                  <h2 className="font-bold">
                    KelanaAI Answer
                  </h2>

                  <p className="text-xs text-slate-500">
                    Grounded with trusted knowledge
                  </p>
                </div>
              </div>
            </div>

            <div className="px-7 py-7 sm:px-9">
              <div className="prose prose-slate max-w-none leading-7">
                <ReactMarkdown>
                  {answer}
                </ReactMarkdown>
              </div>
            </div>

            {/* SOURCES */}
            {sources.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-2">
                  <span>▤</span>

                  <h3 className="text-sm font-bold">
                    Sources
                  </h3>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Knowledge sources used to ground this
                  response.
                </p>

                <div className="mt-4 space-y-2">
                  {sources.map((source, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
                    >
                      <span className="mr-2 font-semibold text-blue-600">
                        {index + 1}.
                      </span>

                      {source}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* RAG EXPLANATION */}
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xl">
              1
            </div>

            <h3 className="mt-4 font-semibold">
              Retrieve
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              KelanaAI searches the knowledge base for
              relevant travel information.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xl">
              2
            </div>

            <h3 className="mt-4 font-semibold">
              Augment
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Retrieved context is combined with your
              question before AI inference.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xl">
              3
            </div>

            <h3 className="mt-4 font-semibold">
              Generate
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Amazon Bedrock generates an answer using
              the retrieved trusted context.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}