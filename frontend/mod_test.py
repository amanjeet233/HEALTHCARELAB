import re

with open('src/pages/TestListingPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make Grid smaller: Grid layout
text = text.replace('grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6')

# Replace the specific card details
old_card_content = '''                                  <Card key={test.id} className="group overflow-hidden border border-gray-100 hover:border-[#0D7C7C]/30 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white rounded-2xl" noPadding onClick={() => navigate(/booking/)}>
                                      <div className="p-6 flex flex-col h-full bg-white text-left">
                                          <div className="flex justify-between items-start mb-4 gap-4">
                                              <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-[#0D7C7C] transition-colors leading-tight m-0">
                                                  {test.name}'''

new_card_content = '''                                  <Card key={test.id} className="group overflow-hidden border border-gray-200 hover:border-[#0D7C7C]/40 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white rounded-xl" noPadding onClick={() => navigate(/booking/)}>
                                      <div className="p-4 flex flex-col h-full bg-white text-left">
                                          <div className="flex justify-between items-start mb-3 gap-3">
                                              <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#0D7C7C] transition-colors leading-snug m-0">
                                                  {test.testName || test.name || "Test Details"}'''

text = text.replace(old_card_content, new_card_content)

text = text.replace('text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-6', 'text-[11px] text-gray-600 leading-relaxed line-clamp-2 mb-4')
text = text.replace('gap-3 mb-6', 'gap-2 mb-4')


# Add pagination at the end
pagination_code = '''
                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-4 mt-12 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                              <button
                                  disabled={page === 0}
                                  onClick={() => setPage(p => Math.max(0, p - 1))}
                                  className={\px-6 py-2.5 rounded-xl font-bold text-sm transition-all \\}
                              >
                                  Previous
                              </button>
                              <span className="text-gray-600 font-medium text-sm">
                                  Page {page + 1} of {totalPages}
                              </span>
                              <button
                                  disabled={page >= totalPages - 1}
                                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                  className={\px-6 py-2.5 rounded-xl font-bold text-sm transition-all \\}
                              >
                                  Next
                              </button>
                          </div>
                      )}
'''

# Find where </Card> map loop ends
# "))}
#                         </div>"
# Let's use regex to insert before "{/* Pagination - Premium Dots */}" or simply append it.

# Search for the map closing
idx = text.find('</div>\n                    )}')
if idx != -1:
    text = text[:idx] + '</div>\n' + pagination_code + '\n                    )}' + text[idx+29:]

with open('src/pages/TestListingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done")
