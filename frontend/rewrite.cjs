const fs = require('fs');
let txt = fs.readFileSync('src/pages/TestListingPage.tsx', 'utf-8');

const sIdx = txt.indexOf('{tests.map(test => (');
const eIdx = txt.indexOf('</Card>', sIdx) + 7;

if (sIdx !== -1 && eIdx !== -1) {
    const replacement = {tests.map(test => (
                            <Card
                                key={test.id}
                                className="group overflow-hidden border border-gray-200 hover:border-[#0D7C7C]/40 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white rounded-xl"
                                noPadding
                                onClick={() => navigate(\/booking/\\)}
                            >
                                <div className="p-5 flex flex-col h-full bg-white text-left">
                                    <div className="flex justify-between items-start mb-4 gap-3">
                                        <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#0D7C7C] transition-colors leading-snug m-0 flex-1">
                                            {(test as any).testName || test.name || "Test Details"}
                                        </h3>
                                        <div className="p-2.5 bg-[#0D7C7C]/10 rounded-xl text-[#0D7C7C] flex-shrink-0 flex items-center justify-center">
                                            <FaFlask className="text-lg" />
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-5 flex-grow m-0">
                                        {test.description || "Advanced biometric analysis module designed for precision monitoring."}
                                    </p>

                                    <div className="flex items-center gap-3 mb-6 flex-wrap m-0">
                                        {test.fastingRequired && (
                                            <div className="bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 flex items-center gap-1.5 text-rose-600">
                                                <FaUtensils className="text-[10px]" />
                                                <span className="text-[10px] font-bold">{test.fastingHours || 8} Hrs Fasting</span>
                                            </div>
                                        )}
                                        <div className="bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100 flex items-center gap-1.5 text-sky-600">
                                            <FaClock className="text-[10px]" />
                                            <span className="text-[10px] font-bold">Reports in 24 Hrs</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 flex items-end justify-between mt-auto">
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Test Price</span>
                                            <span className="text-[22px] font-black text-gray-900 m-0 leading-none">
                                                ₹{test.price ? test.price.toFixed(0) : 0}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(\/booking/\\);
                                            }}
                                            className="px-6 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg font-bold text-[11px] uppercase tracking-wide transition-colors shadow-md shadow-red-500/20"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </Card>;

  txt = txt.substring(0, sIdx) + replacement + txt.substring(eIdx);
  fs.writeFileSync('src/pages/TestListingPage.tsx', txt, 'utf-8');
  console.log('Fixed cards!');
}
