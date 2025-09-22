// generateCICExcel.js
import fs from 'fs/promises';
import path from 'path';
import ExcelJS from 'exceljs';

async function generateCICExcel() {
    try {
        // Load all CIC test data
        const part2Data = JSON.parse(
            await fs.readFile(path.resolve('public/speaking_part2_CIC.json'), 'utf8')
        );
        const part3Data = JSON.parse(
            await fs.readFile(path.resolve('public/speaking_part3_CIC.json'), 'utf8')
        );
        const part4Data = JSON.parse(
            await fs.readFile(path.resolve('public/speaking_part4_CIC.json'), 'utf8')
        );

        // Extract test numbers from IDs (e.g., "CIC_2_task2" -> "2")
        const getTestNumber = (id) => {
            const match = id.match(/CIC_(\d+)_task/);
            return match ? parseInt(match[1]) : null;
        };

        // Group data by test number
        const testMap = new Map();

        // Process Part 2
        part2Data.forEach(item => {
            const testNum = getTestNumber(item.id);
            if (testNum) {
                if (!testMap.has(testNum)) {
                    testMap.set(testNum, { testNumber: testNum });
                }
                testMap.get(testNum).part2 = {
                    topic: item.reading_title || 'No Topic',
                    hasScript: Array.isArray(item.listening_script) ? 
                        item.listening_script.length > 0 : 
                        Boolean(item.listening_script && item.listening_script.trim())
                };
            }
        });

        // Process Part 3
        part3Data.forEach(item => {
            const testNum = getTestNumber(item.id);
            if (testNum) {
                if (!testMap.has(testNum)) {
                    testMap.set(testNum, { testNumber: testNum });
                }
                testMap.get(testNum).part3 = {
                    topic: item.reading_title || 'No Topic',
                    hasScript: Array.isArray(item.listening_script) ? 
                        item.listening_script.length > 0 : 
                        Boolean(item.listening_script && item.listening_script.trim())
                };
            }
        });

        // Process Part 4
        part4Data.forEach(item => {
            const testNum = getTestNumber(item.id);
            if (testNum) {
                if (!testMap.has(testNum)) {
                    testMap.set(testNum, { testNumber: testNum });
                }
                testMap.get(testNum).part4 = {
                    topic: item.reading_title || 'No Topic',
                    hasScript: Array.isArray(item.listening_script) ? 
                        item.listening_script.length > 0 : 
                        Boolean(item.listening_script && item.listening_script.trim())
                };
            }
        });

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('CIC Tests Overview');

        // Add headers
        const headers = [
            'Test Number',
            'Part 2 Topic',
            'Part 2 Script Available',
            'Part 3 Topic', 
            'Part 3 Script Available',
            'Part 4 Topic',
            'Part 4 Script Available'
        ];

        worksheet.addRow(headers);

        // Style headers
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '366092' }
        };

        // Add data rows
        const sortedTests = Array.from(testMap.values()).sort((a, b) => a.testNumber - b.testNumber);
        
        sortedTests.forEach(test => {
            const row = [
                `CIC ${test.testNumber}`,
                test.part2?.topic || 'N/A',
                test.part2?.hasScript ? 'Yes' : 'No',
                test.part3?.topic || 'N/A',
                test.part3?.hasScript ? 'Yes' : 'No',
                test.part4?.topic || 'N/A',
                test.part4?.hasScript ? 'Yes' : 'No'
            ];
            worksheet.addRow(row);
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const columnLength = cell.value ? cell.value.toString().length : 0;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 12), 50);
        });

        // Add conditional formatting for script availability
        worksheet.getColumn(3).eachCell((cell, rowNumber) => {
            if (rowNumber > 1) { // Skip header
                if (cell.value === 'Yes') {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'C6EFCE' }
                    };
                    cell.font = { color: { argb: '006100' } };
                } else {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFC7CE' }
                    };
                    cell.font = { color: { argb: '9C0006' } };
                }
            }
        });

        // Apply same formatting to columns 5 and 7
        [5, 7].forEach(colNum => {
            worksheet.getColumn(colNum).eachCell((cell, rowNumber) => {
                if (rowNumber > 1) {
                    if (cell.value === 'Yes') {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'C6EFCE' }
                        };
                        cell.font = { color: { argb: '006100' } };
                    } else {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFC7CE' }
                        };
                        cell.font = { color: { argb: '9C0006' } };
                    }
                }
            });
        });

        // Add borders
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Save the file
        const filename = `CIC_Tests_Overview_${new Date().toISOString().split('T')[0]}.xlsx`;
        await workbook.xlsx.writeFile(filename);
        
        console.log(`✅ Excel file generated: ${filename}`);
        console.log(`📊 Total tests found: ${sortedTests.length}`);
        
        // Print summary
        console.log('\n📋 Summary:');
        sortedTests.forEach(test => {
            console.log(`CIC ${test.testNumber}:`);
            console.log(`  Part 2: ${test.part2?.topic || 'N/A'} (Script: ${test.part2?.hasScript ? '✓' : '✗'})`);
            console.log(`  Part 3: ${test.part3?.topic || 'N/A'} (Script: ${test.part3?.hasScript ? '✓' : '✗'})`);
            console.log(`  Part 4: ${test.part4?.topic || 'N/A'} (Script: ${test.part4?.hasScript ? '✓' : '✗'})`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error generating Excel file:', error);
    }
}

// Run the script
generateCICExcel();