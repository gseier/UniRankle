// scripts/check-prisma.js
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const p = new PrismaClient()
  console.log('client keys:', Object.keys(p))
  console.log('dmmf models:', Object.keys(p._dmmf?.modelMap || {}))
  try {
    const ok = await p.$queryRaw`SELECT 1`
    console.log('db reachable, sample query result:', ok)
  } catch (e) {
    console.error('db query error:', e.message)
  } finally {
    await p.$disconnect()
  }
})()
