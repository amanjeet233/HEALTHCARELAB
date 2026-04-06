const fs = require('fs');
let txt = fs.readFileSync('src/pages/TestListingPage.tsx', 'utf-8');

const sIdx = txt.indexOf('<Card');
let eIdx = txt.indexOf('</Card>', sIdx) + 7;

const replacementStr = '<Card\n' +
'    key={test.id}\n' +
'    className="group overflow-hidden border border-gray-200 hover:border-[#0D7C7C]/40 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white rounded-xl"\n' +
'    noPadding\n' +
'    onClick={() => navigate(`/booking/${test.id}`)}\n' +
'  >\n' +
'    <div className="p-5 flex flex-col h-full bg-white text-left">\n' +
'      <div className="flex justify-between items-start mb-4 gap-3">\n' +
'        <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#0D7C7C] transition-colors leading-snug m-0 flex-1">\n' +
'          {(test as any).testName || test.name || "Test Details"}\n' +
'        </h3>\n' +
'        <div className="p-2.5 bg-[#0D7C7C]/10 rounded-xl text-[#0D7C7C] flex-shrink-0 flex items-center justify-center">\n' +
'          <FaFlask className="text-lg" />\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-5 flex-grow m-0">\n' +
'        {test.description ||\n' +
'          "Advanced biometric analysis module designed for precision monitoring."}\n' +
'      </p>\n' +
'\n' +
'      <div className="flex items-center gap-3 mb-6 flex-wrap m-0">\n' +
'        {test.fastingRequired && (\n' +
'          <div className="bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 flex items-center gap-1.5 text-rose-600">\n' +
'            <FaUtensils className="text-[10px]" />\n' +
'            <span className="text-[10px] font-bold">\n' +
'              {test.fastingHours || 8} Hrs Fasting\n' +
'            </span>\n' +
'          </div>\n' +
'        )}\n' +
'        <div className="bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100 flex items-center gap-1.5 text-sky-600">\n' +
'          <FaClock className="text-[10px]" />\n' +
'          <span className="text-[10px] font-bold">Reports in 24 Hrs</span>\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <div className="border-t border-gray-100 pt-4 flex items-end justify-between mt-auto">\n' +
'        <div className="flex flex-col text-left">\n' +
'          <span className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">\n' +
'            Test Price\n' +
'          </span>\n' +
'          <span className="text-[22px] font-black text-gray-900 m-0 leading-none">\n' +
'            ₹{test.price ? test.price.toFixed(0) : 0}\n' +
'          </span>\n' +
'        </div>\n' +
'        <button\n' +
'          onClick={(e) => {\n' +
'            e.stopPropagation();\n' +
'            navigate(`/booking/${test.id}`);\n' +
'          }}\n' +
'          className="px-6 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg font-bold text-[11px] uppercase tracking-wide transition-colors shadow-md shadow-red-500/20"\n' +
'        >\n' +
'          Book Now\n' +
'        </button>\n' +
'      </div>\n' +
'    </div>\n' +
'  </Card>';

if (sIdx !== -1 && eIdx !== -1) {
    txt = txt.substring(0, sIdx) + replacementStr + txt.substring(eIdx);
    fs.writeFileSync('src/pages/TestListingPage.tsx', txt, 'utf-8');
    console.log('Successfully updated component!');
}
