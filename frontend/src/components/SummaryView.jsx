import React from 'react';

const SummaryView = ({ data }) => {
    if (!data) return null;

    return (
        <div className="mt-8 space-y-6 w-full max-w-2xl animate-fade-in-up">
            {/* Audio Summary Player */}
            {data.audio_summary_url && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl shadow-lg text-white">
                    <h3 className="font-semibold mb-2 mb-3">AI Audio Summary</h3>
                    <audio controls className="w-full h-10 rounded" src={`http://localhost:8000${data.audio_summary_url}`} />
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Summary Card */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Summary</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        {data.summary}
                    </p>
                </div>

                {/* Action Items Card */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Action Items</h3>
                    {data.action_items && data.action_items.length > 0 ? (
                        <ul className="space-y-2">
                            {data.action_items.map((item, idx) => (
                                <li key={idx} className="flex items-start text-sm text-gray-700">
                                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-2 font-bold mt-0.5">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No specific action items detected.</p>
                    )}
                </div>
            </div>

            {/* Transcript Accordion (Optional) */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <details className="group">
                    <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-900 transition-colors list-none flex justify-between items-center">
                        <span>View Full Transcript</span>
                        <span className="transform group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-3 text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
                        {data.transcript}
                    </p>
                </details>
            </div>
        </div>
    );
};

export default SummaryView;
