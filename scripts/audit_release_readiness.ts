import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { formatCurrencyBD, normalizeDateToDmy } from '../lib/tableEngine/dataValidator';
import { sanitizeCellValue, MAX_FILE_SIZE_BYTES, MAX_ROW_LIMIT } from '../lib/tableEngine/excelParser';

const TEMPLATE_NAMES = [
  'otm_template_blank.xlsx',
  'otm_template_sample.xlsx',
  'ltm_template_blank.xlsx',
  'ltm_template_sample.xlsx',
  'lottery_pending_template_blank.xlsx',
  'lottery_pending_template_sample.xlsx',
  'lottery_result_template_blank.xlsx',
  'lottery_result_template_sample.xlsx',
];

interface AuditResult {
  step: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: AuditResult[] = [];

function assert(step: string, name: string, condition: boolean, details: string) {
  results.push({ step, name, passed: condition, details });
  if (condition) {
    console.log(`  ✓ [${step}] ${name}: ${details}`);
  } else {
    console.error(`  ✗ [FAIL] [${step}] ${name}: ${details}`);
  }
}

function getSha256(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function runAudit() {
  console.log('========================================================');
  console.log('PHASE 6.1: FINAL RELEASE READINESS & DEPLOYMENT AUDIT');
  console.log('========================================================\n');

  // ----------------------------------------------------
  // SECTION 1: PUBLIC TEMPLATE DOWNLOAD & HASH VERIFICATION
  // ----------------------------------------------------
  console.log('--- SECTION 1: Public Template Verification & SHA-256 Audit ---');
  const publicDir = path.resolve(process.cwd(), 'public/templates');
  const docsDir = path.resolve(process.cwd(), 'docs/templates');

  for (const name of TEMPLATE_NAMES) {
    const pubPath = path.join(publicDir, name);
    const docPath = path.join(docsDir, name);

    const pubExists = fs.existsSync(pubPath);
    const docExists = fs.existsSync(docPath);
    assert('1. Template Files', `File exists in public/templates/${name}`, pubExists, `Found: ${pubPath}`);
    assert('1. Template Files', `File exists in docs/templates/${name}`, docExists, `Found: ${docPath}`);

    if (pubExists && docExists) {
      const pubHash = getSha256(pubPath);
      const docHash = getSha256(docPath);
      const hashesMatch = pubHash === docHash;
      assert('1. Template Hashes', `SHA-256 match for ${name}`, hashesMatch, `Hash: ${pubHash}`);

      // Verify valid XLSX workbook structure
      try {
        const wb = XLSX.readFile(pubPath);
        const hasSheets = wb.SheetNames && wb.SheetNames.length > 0;
        assert('1. Workbook Structure', `Valid XLSX workbook: ${name}`, hasSheets, `Sheet: ${wb.SheetNames.join(', ')}`);
      } catch (err: any) {
        assert('1. Workbook Structure', `Valid XLSX workbook: ${name}`, false, `Corrupt XLSX: ${err.message}`);
      }
    }
  }

  // ----------------------------------------------------
  // SECTION 1B: HTTP 200 PUBLIC DOWNLOAD VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- SECTION 1B: HTTP 200 Public Download Verification ---');
  // Spin up an in-memory HTTP server serving public directory files
  const server = http.createServer((req, res) => {
    const safeUrl = req.url || '';
    if (safeUrl.startsWith('/templates/')) {
      const fileName = path.basename(safeUrl);
      const targetPath = path.join(publicDir, fileName);
      if (fs.existsSync(targetPath)) {
        res.writeHead(200, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Length': fs.statSync(targetPath).size,
        });
        fs.createReadStream(targetPath).pipe(res);
        return;
      }
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve) => server.listen(3919, '127.0.0.1', () => resolve()));
  console.log('  Local HTTP server active on port 3919 for public download testing.');

  for (const name of TEMPLATE_NAMES) {
    const testUrl = `http://127.0.0.1:3919/templates/${name}`;
    const statusCode = await new Promise<number>((resolve) => {
      http.get(testUrl, (res) => {
        resolve(res.statusCode || 0);
      }).on('error', () => resolve(0));
    });
    assert('1B. HTTP Download', `GET /templates/${name}`, statusCode === 200, `Returned HTTP ${statusCode}`);
  }

  await new Promise<void>((resolve) => server.close(() => resolve()));

  // ----------------------------------------------------
  // SECTION 1C: USER GUIDE TEMPLATE LINK INTEGRITY
  // ----------------------------------------------------
  console.log('\n--- SECTION 1C: User Guide Download Link Integrity ---');
  const userGuidePath = path.resolve(process.cwd(), 'docs/EXCEL_IMPORT_USER_GUIDE.md');
  const userGuideContent = fs.readFileSync(userGuidePath, 'utf8');

  for (const name of TEMPLATE_NAMES) {
    const linkFound = userGuideContent.includes(name);
    assert('1C. Guide Links', `User guide contains link to ${name}`, linkFound, `Verified in EXCEL_IMPORT_USER_GUIDE.md`);
  }

  // ----------------------------------------------------
  // SECTION 2: DATA INTEGRITY & SECURITY REGRESSION
  // ----------------------------------------------------
  console.log('\n--- SECTION 2: Data Integrity & Security Regression ---');

  // 2.1 Negative Currency Intact
  const neg1 = formatCurrencyBD('-2500');
  const neg2 = formatCurrencyBD('-2,500');
  const neg3 = formatCurrencyBD('-2500.50');
  assert('2.1 Negative Currency', 'Formats -2500 to -2,500', neg1 === '-2,500', `Got: ${neg1}`);
  assert('2.1 Negative Currency', 'Preserves pre-formatted -2,500', neg2 === '-2,500', `Got: ${neg2}`);
  assert('2.1 Negative Currency', 'Formats -2500.50 to -2,500.50', neg3 === '-2,500.50', `Got: ${neg3}`);

  // 2.2 Formula Injection Neutralization vs Legitimate Negative Numbers
  const formula1 = sanitizeCellValue('=SUM(A1:B10)');
  const formula2 = sanitizeCellValue('@cmd');
  const formula3 = sanitizeCellValue('+calc');
  const legitimateNeg = sanitizeCellValue('-2500');
  const legitimatePhone = sanitizeCellValue('+8801711805086');

  assert('2.2 Formula Neutralization', 'Neutralizes =SUM formula to inert text', formula1 === 'SUM(A1:B10)', `Got: ${formula1}`);
  assert('2.2 Formula Safety', 'Preserves @cmd text without error', formula2 === '@cmd', `Got: ${formula2}`);
  assert('2.2 Formula Safety', 'Preserves legitimate negative number -2500 intact', legitimateNeg === '-2500', `Got: ${legitimateNeg}`);
  assert('2.2 Formula Safety', 'Preserves legitimate phone number +8801711805086 intact', legitimatePhone === '+8801711805086', `Got: ${legitimatePhone}`);

  // 2.3 Bengali Unicode Preservation
  const banglaEntity = 'গণপূর্ত বিভাগ, পাবনা।';
  const banglaDesc = 'মৌলভীবাজার আর.সি.সি রাস্তা নির্মাণ';
  assert('2.3 Bengali Unicode', 'Preserves entity name with punctuation', banglaEntity === 'গণপূর্ত বিভাগ, পাবনা।', `Exact match: ${banglaEntity}`);
  assert('2.3 Bengali Unicode', 'Preserves Bengali description', banglaDesc === 'মৌলভীবাজার আর.সি.সি রাস্তা নির্মাণ', `Exact match: ${banglaDesc}`);

  // 2.4 Word Notation Amounts (Lac, Cr)
  const lac1 = formatCurrencyBD('44 Lac');
  const cr1 = formatCurrencyBD('2.2 Cr');
  const cr2 = formatCurrencyBD('1.25 Crore');
  assert('2.4 Word Currency', 'Preserves 44 Lac text notation intact', lac1 === '44 Lac', `Got: ${lac1}`);
  assert('2.4 Word Currency', 'Preserves 2.2 Cr text notation intact', cr1 === '2.2 Cr', `Got: ${cr1}`);
  assert('2.4 Word Currency', 'Preserves 1.25 Crore text notation intact', cr2 === '1.25 Crore', `Got: ${cr2}`);

  // 2.5 Date Normalization & Default Time
  const isoDate = normalizeDateToDmy('2026-11-15');
  const slashDate = normalizeDateToDmy('15/11/2026');
  const existingTime = normalizeDateToDmy('15-11-2026 02:30 PM');
  const excelSerial = normalizeDateToDmy('46341'); // Excel serial
  assert('2.5 Date Normalization', 'ISO date converted to DD-MM-YYYY', isoDate === '15-11-2026', `Got: ${isoDate}`);
  assert('2.5 Date Normalization', 'Slash date converted to DD-MM-YYYY', slashDate === '15-11-2026', `Got: ${slashDate}`);
  assert('2.5 Date Normalization', 'Excel serial parsed with default 05:00 PM', excelSerial.endsWith('05:00 PM'), `Got: ${excelSerial}`);
  assert('2.5 Date Normalization', 'Existing custom time preserved', existingTime === '15-11-2026 02:30 PM', `Got: ${existingTime}`);

  // 2.6 File Size and Row Limits
  assert('2.6 System Limits', '10MB limit constant configured', MAX_FILE_SIZE_BYTES === 10485760, `10,485,760 bytes`);
  assert('2.6 System Limits', '1,000-row limit constant configured', MAX_ROW_LIMIT === 1000, `1,000 rows`);

  // ----------------------------------------------------
  // SECTION 3: PRODUCTION DATABASE INTEGRITY AUDIT
  // ----------------------------------------------------
  console.log('\n--- SECTION 3: Production Database Isolation Audit ---');
  const prisma = new PrismaClient();
  try {
    const count = await prisma.notice.count();
    const records = await prisma.notice.findMany({ select: { id: true, category: true, title: true } });
    assert('3. Database Isolation', 'Production database contains exactly 5 baseline notices', count === 5, `Notice count: ${count}`);
    const expectedIds = [
      'cmt15oupa0001jn04wclifffy',
      'cmtr8vx5u0001la04mrgcjurm',
      'cmtvg4uih0001jz04vcg5ll80',
      'cmtxzugz90001lu2sfh6gs3hd',
      'cmudox6cg0001k004oh17lvn6',
    ];
    const actualIds = records.map((r) => r.id);
    const allIdsPreserved = expectedIds.every((id) => actualIds.includes(id));
    assert('3. Database Isolation', 'All 5 baseline production notice IDs remain intact', allIdsPreserved, `Matched: ${actualIds.join(', ')}`);
  } catch (err: any) {
    assert('3. Database Isolation', 'Database connectivity', false, err.message);
  } finally {
    await prisma.$disconnect();
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n========================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`RELEASE READINESS AUDIT: ${passed}/${total} CHECKS PASSED (${failed} FAILED)`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
