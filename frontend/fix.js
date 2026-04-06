const fs = require('fs');
let txt = fs.readFileSync('src/pages/TestListingPage.tsx', 'utf-8');

txt = txt.replace(
  '<div className="min-h-screen py-8">',
  '<div className="min-h-screen py-8 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] text-left">'
);

txt = txt.replace('size: 9,', 'size: 6,');

txt = txt.replace(
  /grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8/g,
  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
);

const pagRegex = /\{\/\* Pagination - Premium Dots \*\/\}.*?\}\)/s;
const newPag = \{/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                className={\\\px-6 py-2.5 rounded-lg font-bold text-sm transition-all \\\\\\}
                            >
                                Previous
                            </button>
                            <span className="text-gray-700 font-bold text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                Page {page + 1} of {totalPages}
                            </span>
                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                className={\\\px-6 py-2.5 rounded-lg font-bold text-sm transition-all \\\\\\}
                            >
                                Next
                            </button>
                        </div>
                    )}\;

txt = txt.replace(pagRegex, newPag);

fs.writeFileSync('src/pages/TestListingPage.tsx', txt, 'utf-8');
console.log('Fixed');
