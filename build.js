/**
 * Build Script - JavaScript Obfuscation
 * This script obfuscates the main JavaScript files for production
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Files to obfuscate
const filesToObfuscate = [
    'js/main.v2.js',
    'js/features.js',
    'js/reviews.js',
    'js/pagination.js',
    'js/security-utils.js',
    'js/schema-markup.js',
    'js/new-sections.js',
    'js/particles.js',
    'js/lang.js',
    'js/toast.js',
    'js/lazy-loading.js',
    'js/services.js'
];

// Obfuscation options (balanced between security and performance)
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: false, // Keep false for performance
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false, // Keep console for debugging
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false, // Keep false to avoid breaking window.* functions
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
};

// Create backup directory
const backupDir = 'js/backup';
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

console.log('🔐 Starting JavaScript Obfuscation...\n');

let successCount = 0;
let errorCount = 0;

filesToObfuscate.forEach(filePath => {
    try {
        const fullPath = path.join(__dirname, filePath);

        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  Skipped (not found): ${filePath}`);
            return;
        }

        // Read original code
        const originalCode = fs.readFileSync(fullPath, 'utf8');

        // Create backup
        const backupPath = path.join(__dirname, backupDir, path.basename(filePath));
        fs.writeFileSync(backupPath, originalCode);

        // Obfuscate
        const obfuscatedCode = JavaScriptObfuscator.obfuscate(originalCode, obfuscationOptions);

        // Write obfuscated code
        fs.writeFileSync(fullPath, obfuscatedCode.getObfuscatedCode());

        const originalSize = Buffer.byteLength(originalCode, 'utf8');
        const newSize = Buffer.byteLength(obfuscatedCode.getObfuscatedCode(), 'utf8');

        console.log(`✅ Obfuscated: ${filePath} (${originalSize} → ${newSize} bytes)`);
        successCount++;

    } catch (error) {
        console.log(`❌ Error: ${filePath} - ${error.message}`);
        errorCount++;
    }
});

console.log(`\n📊 Summary: ${successCount} files obfuscated, ${errorCount} errors`);
console.log(`📁 Backups saved to: ${backupDir}/`);
console.log('\n✨ Obfuscation complete!');
