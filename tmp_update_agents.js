const fs = require('fs');
const path = require('path');

const agentsPath = path.join(process.cwd(), 'app', 'api', 'agents');
const dirs = fs.readdirSync(agentsPath).filter(f => fs.statSync(path.join(agentsPath, f)).isDirectory());

dirs.forEach(dir => {
    const filePath = path.join(agentsPath, dir, 'route.ts');
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');

        if (!content.includes('hasReachedBlueprintLimit')) {
            // 1. Add import
            content = content.replace(
                /(import.*NextResponse.*from.*"next\/server";)/,
                "$1\nimport { hasReachedBlueprintLimit } from '@/lib/subscription';"
            );

            // 2. Add limit check logic before generating plan
            content = content.replace(
                /(\s*)(const body = await req\.json\(\);)/,
                "$1const limitReached = await hasReachedBlueprintLimit(session.user.id);\n$1if (limitReached) {\n$1    return NextResponse.json({ error: \"Blueprint generation limit reached. Upgrade to Pro for unlimited AI blueprints.\" }, { status: 403 });\n$1}\n\n$1$2"
            );

            fs.writeFileSync(filePath, content);
            console.log(`Updated ${dir}/route.ts`);
        }
    }
});
