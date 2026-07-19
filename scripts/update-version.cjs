const fs = require('fs')
const path = require('path')

const version = Date.now().toString()
const buildDate = new Date().toISOString()

const versionFile = { version, buildDate }
const publicDir = path.join(__dirname, '../public')

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
}

// Сохраняем version.json
fs.writeFileSync(
    path.join(publicDir, 'version.json'),
    JSON.stringify(versionFile, null, 2)
)

// ✅ Генерируем sw.js из шаблона
const swTemplatePath = path.join(__dirname, 'sw.template.js')
const swDestPath = path.join(publicDir, 'sw.js')

if (fs.existsSync(swTemplatePath)) {
    let swContent = fs.readFileSync(swTemplatePath, 'utf8')
    swContent = swContent.replace(/{{VERSION}}/g, version)
    fs.writeFileSync(swDestPath, swContent)
    console.log(`✅ SW generated with version ${version}`)
} else {
    console.warn('⚠️ sw.template.js not found, skipping SW generation')
}

console.log(`✅ Version updated to ${version}`)
console.log(`   Build date: ${buildDate}`)