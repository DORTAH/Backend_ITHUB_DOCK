import { basename } from 'node:path';
import { db } from '../../prisma/db.js';
import { ImportValidationError, parseExcelFile } from './parsers/excel.parser.js';

const INSERT_CHUNK_SIZE = 300;

export type ImportResult = {
  batchId: number;
  sourceFileName: string;
  semester: string;
  importedRows: number;
};

export async function importExcel(filePath: string, originalName: string): Promise<ImportResult> {
  const iterator = parseExcelFile(filePath)[Symbol.asyncIterator]();
  const firstRow = await iterator.next();

  if (firstRow.done) {
    throw new ImportValidationError('В листе «Отчет» нет строк с данными');
  }

  const sourceFileName = basename(originalName);

  return db.transaction(async (tx) => {
    const batch = await tx.orm.public.ImportBatch.create({
      sourceFileName,
      semester: firstRow.value.semester,
      rowCount: 0,
    });

    let importedRows = 0;
    let chunk = [firstRow.value];

    while (chunk.length > 0) {
      while (chunk.length < INSERT_CHUNK_SIZE) {
        const nextRow = await iterator.next();
        if (nextRow.done) break;
        chunk.push(nextRow.value);
      }

      await tx.orm.public.AcademicPerformance.createAll(
        chunk.map(({ sourceRowNumber, ...record }) => ({
          ...record,
          importBatchId: batch.id,
          sourceRowNumber,
        })),
      );
      importedRows += chunk.length;

      if (chunk.length < INSERT_CHUNK_SIZE) break;
      const nextRow = await iterator.next();
      if (nextRow.done) break;
      chunk = [nextRow.value];
    }

    await tx.orm.public.ImportBatch
      .where({ id: batch.id })
      .update({ rowCount: importedRows });

    return {
      batchId: batch.id,
      sourceFileName,
      semester: firstRow.value.semester,
      importedRows,
    };
  });
}
