const fs = require('fs');
let txt = fs.readFileSync('src/pages/TestListingPage.tsx', 'utf-8');

const start_idx = txt.indexOf('<Card');
const end_idx = txt.indexOf('</Card>', start_idx) + 7;

if (start_idx !== -1 && end_idx !== -1) {
    const new_card = \<Card key={test.id} className="group overflow-hidden border border-gray-100 hover:border-[#0D7C7C]/30 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white rounded-2xl" noPadding onClick={() => navigate(\\\/booking/\\\\\\)}>
    <div className="p-6 flex flex-col h-full bg-white">
        <div className="flex justify-between items-start mb-4 gap-4">
            <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-[#0D7C7C] transition-colors leading-tight">
                {test.name}
            </h3>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-6 flex-grow">
            {test.description || 'Provides essential insights into your health markers and indices.'}
        </p>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
            {test.fastingRequired && (
                <div className="bg-rose-50/50 px-2.5 py-1 rounded border border-rose-100/50 flex items-center gap-1.5 text-rose-600">
                    <FaUtensils className="text-[10px]" />
                    <span className="text-[10px] font-semibold">{test.fastingHours || 8} Hrs Fasting</span>
                </div>
            )}
            <div className="bg-sky-50/50 px-2.5 py-1 rounded border border-sky-100/50 flex items-center gap-1.5 text-sky-600">
                <FaClock className="text-[10px]" />
                <span className="text-[10px] font-semibold">Reports in 24 Hrs</span>
            </div>
        </div>
        <div className="border-t border-gray-50 pt-4 flex items-center justify-between mt-auto">
            <div>
                <p className="text-[10px] text-gray-400 font-medium mb-0.5">Test Price</p>
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-800">₹{test.price.toFixed(0)}</span>
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(\\\/booking/\\\\\\);
                }}
                className="px-6 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl font-bold text-xs transition-colors shadow-md shadow-red-500/20"
            >
                BOOK
            </button>
        </div>
    </div>
</Card>\;
    txt = txt.substring(0, start_idx) + new_card + txt.substring(end_idx);
    fs.writeFileSync('src/pages/TestListingPage.tsx', txt, 'utf-8');
    console.log("Listing cards updated.");
} else {
    console.log("Failed to find Card bounds.");
}
