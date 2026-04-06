const fs = require('fs');
let content = fs.readFileSync('pages/TestListingPage.tsx', 'utf8');

const s1 = '                            {tests.map(test => (';
const s2 = '</Card>';

const idx1 = content.indexOf(s1);
if (idx1 > -1) {
    const idx2 = content.indexOf(s2, idx1);
    if (idx2 > -1) {
        const idx3 = content.indexOf('))}', idx2);
        if (idx3 > -1) {
            const before = content.substring(0, idx1);
            const after = content.substring(idx3 + 3);
            const repl = '                            {tests.map(test => (\\n                                <TestCard key={test.id} test={test} />\\n                            ))}';
            let res = before + repl + after;
            if (!res.includes('import TestCard')) {
                const im = 'import { Card } from \'../components/ui/Card\';';
                res = res.replace(im, im + '\\nimport TestCard from \'../components/TestCard\';');
            }
            fs.writeFileSync('pages/TestListingPage.tsx', res);
            console.log('saved');
        }
    }
}

