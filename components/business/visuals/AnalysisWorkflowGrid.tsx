export function AnalysisWorkflowGrid({
  steps,
}: {
  steps: readonly { step: string; detail: string }[];
}) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-export="analysis-workflow">
      {steps.map((item, i) => (
        <li
          key={item.step}
          className="h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00C853]/10 text-sm font-bold text-[#00C853]">
            {i + 1}
          </span>
          <p className="mt-4 font-semibold text-gray-900">{item.step}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.detail}</p>
        </li>
      ))}
    </ol>
  );
}
