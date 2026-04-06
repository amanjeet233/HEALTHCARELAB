import re

with open('d:/CU/SEM 6/SEM6PP/PROJECT/frontend/src/pages/TestListingPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add imports
if 'import TestCard' not in text:
    text = text.replace('import Card from ''../components/common/Card'';',
        'import Card from ''../components/common/Card'';\nimport TestCard from ''../components/TestCard'';\nimport commonTests from ''../data/commonTests.json'';')

# 2. Replace map block
old_pattern = r'<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">\s*\{tests\.map\(test => \(\s*<Card[\s\S]*?</Card>\s*\)\)\s*\}\s*</div>'

new_block = '''<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {tests.map(test => {
                                // Find matching local data to supplement the backend data
                                const localData = commonTests.find(
                                    t => t.name.toLowerCase() === test.name.toLowerCase() || test.name.toLowerCase().includes(t.name.toLowerCase())
                                ) || {};

                                const mergedTest = {
                                    ...test,
                                    ...localData,
                                    id: test.id, // ensure we keep the backend ID
                                    price: test.price, // ensure we keep backend price
                                };

                                return (
                                    <TestCard
                                        key={test.id}
                                        test={mergedTest}
                                        onViewDetails={(id) => navigate(/booking/)}
                                        onBook={(id) => navigate(/booking/)}
                                    />
                                );
                            })}
                        </div>'''

text = re.sub(old_pattern, new_block, text)

with open('d:/CU/SEM 6/SEM6PP/PROJECT/frontend/src/pages/TestListingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated successfully.')
