const fs = require('fs');
let text = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const regex = /\{(\/\*\s*SEARCH BRIDGE\s*\*\/)\}([\s\S]*?)<div className="pt-12 lg:pt-16 border-t border-primary\/10 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto mt-8">([\s\S]*?)99\.9%<\/div>([\s\S]*?)<\/div>([\s\S]*?)<\/div>([\s\S]*?)<\/div>/;

const replacement = `
                            {/* SEARCH BRIDGE */}
                            <div className="w-full max-w-5xl mx-auto pt-8 space-y-8">
                                {/* Search Bar (Pill Shape) */}
                                <div className="flex bg-white rounded-full p-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] items-center relative z-20">
                                    {/* Location */}
                                    <div className="flex items-center px-4 space-x-2 border-r border-gray-200">
                                        <span className="text-pink-500 text-xl">📍</span>
                                        <span className="text-gray-800 font-bold text-sm">New Delhi</span>
                                        <span className="text-red-500 font-bold cursor-pointer text-lg ml-1">⌖</span>
                                    </div>
                                    {/* Search Input */}
                                    <div className="flex-1 flex items-center px-4">
                                        <input
                                            type="text"
                                            placeholder="Search tests or full body checkups"
                                            className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder-gray-400"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') navigate('/tests');
                                            }}
                                        />
                                    </div>
                                    {/* Red Search Button */}
                                    <button 
                                        onClick={() => navigate('/tests')}
                                        className="w-12 h-12 rounded-full bg-[#ff4e4e] text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 shrink-0"
                                    >
                                        <FaSearch className="text-lg" />
                                    </button>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-between w-full relative z-20">
                                    <button className="flex-1 flex items-center justify-center space-x-3 bg-[#f0f8fd] text-gray-700 py-4 rounded-2xl hover:bg-[#e1f0fa] transition-colors border border-[#d6effd]">
                                        <span className="text-blue-500 text-xl font-bold">📞</span>
                                        <span className="text-sm">Book via <span className="font-bold text-gray-900">Phone Call</span></span>
                                    </button>
                                    <button className="flex-1 flex items-center justify-center space-x-3 bg-[#fdf2f6] text-gray-700 py-4 rounded-2xl hover:bg-[#fce5ee] transition-colors border border-[#fae2ec]">
                                        <span className="text-pink-500 text-xl font-bold">📝</span>
                                        <span className="text-sm">Quick <span className="font-bold text-gray-900">Order</span></span>
                                    </button>
                                    <button className="flex-1 flex items-center justify-center space-x-3 bg-[#f0fcf4] text-gray-700 py-4 rounded-2xl hover:bg-[#e1faea] transition-colors border border-[#dafae6]">
                                        <span className="text-green-500 text-xl font-bold">💬</span>
                                        <span className="text-sm">Book via <span className="font-bold text-gray-900">Whatsapp</span></span>
                                    </button>
                                </div>

                                {/* Categories Cards Grid */}
                                <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-20 pointer-events-auto">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 text-left">Find tests & packages for your needs</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        {/* Full Body Packages */}
                                        <div 
                                            onClick={() => navigate('/tests')}
                                            className="md:col-span-5 bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-extrabold text-gray-900 text-left text-lg leading-tight">Full Body</p>
                                                <p className="font-extrabold text-gray-900 text-left text-lg leading-tight">Packages</p>
                                            </div>
                                            <div className="p-3 border border-gray-100 rounded-xl shadow-sm bg-green-50/50">
                                                <div className="text-green-500 text-3xl">🧍‍♂️</div>
                                            </div>
                                        </div>

                                        {/* X Rays, Scans & More */}
                                        <div 
                                            onClick={() => navigate('/tests')}
                                            className="md:col-span-7 bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-extrabold text-gray-900 text-left text-lg leading-tight">X Rays, Scans &</p>
                                                <p className="font-extrabold text-gray-900 text-left text-lg leading-tight">More</p>
                                            </div>
                                            <div className="p-3 border border-gray-100 rounded-xl shadow-sm bg-blue-50/50">
                                                <div className="text-blue-500 text-3xl">🩻</div>
                                            </div>
                                        </div>

                                        {/* Fever Tests */}
                                        <div 
                                            onClick={() => navigate('/tests')}
                                            className="md:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <p className="font-extrabold text-gray-900 text-left text-base">Fever Tests</p>
                                            <div className="p-2 border border-gray-100 rounded-xl shadow-sm bg-blue-50/50">
                                                <div className="text-blue-500 text-2xl">🩸</div>
                                            </div>
                                        </div>

                                        {/* Diabetes Tests */}
                                        <div 
                                            onClick={() => navigate('/tests')}
                                            className="md:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-extrabold text-gray-900 text-left text-base leading-tight">Diabetes</p>
                                                <p className="font-extrabold text-gray-900 text-left text-base leading-tight">Tests</p>
                                            </div>
                                            <div className="p-2 border border-gray-100 rounded-xl shadow-sm bg-pink-50/50">
                                                <div className="text-pink-500 text-2xl">🍬</div>
                                            </div>
                                        </div>

                                        {/* Vitamins Tests */}
                                        <div 
                                            onClick={() => navigate('/tests')}
                                            className="md:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div>
                                                <p className="font-extrabold text-gray-900 text-left text-base leading-tight">Vitamins</p>
                                                <p className="font-extrabold text-gray-900 text-left text-base leading-tight">Tests</p>
                                            </div>
                                            <div className="p-2 border border-gray-100 rounded-xl shadow-sm bg-purple-50/50">
                                                <div className="text-purple-500 text-2xl">💊</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
`;

if (text.includes('{/* SEARCH BRIDGE */}')) {
    const startIndex = text.indexOf('{/* SEARCH BRIDGE */}');
    const endIndex = text.indexOf('</motion.div>', startIndex);
    if (endIndex !== -1) {
        const pre = text.substring(0, startIndex);
        const post = text.substring(endIndex);
        text = pre + replacement + '\n                        ' + post;
        fs.writeFileSync('src/pages/LandingPage.tsx', text);
        console.log('Successfully updated LandingPage.tsx');
    }
}
