export default function PlaceholderPage({ title }) {
  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 tracking-tight transition-colors">{title}</h1>
      <div className="glass-card flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Under Construction</h2>
        <p className="text-md max-w-sm">The <strong>{title}</strong> page functionality will be built here soon.</p>
      </div>
    </div>
  );
}
