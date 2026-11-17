#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/87817ca322c093fad0e51d443f9137234191785b39b30ad54f65e1b604b26d5e/contract';
import endContract from '../../snapshots/87817ca322c093fad0e51d443f9137234191785b39b30ad54f65e1b604b26d5e/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/883498eba607dcc50ea808c27046da31d2850a180097b60ed6ed74b44099b03e/contract';
import startContract from '../../snapshots/883498eba607dcc50ea808c27046da31d2850a180097b60ed6ed74b44099b03e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'disciplineCode',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'disciplineName',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'groupName',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'organization',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'semester',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'studentEmail',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'studentFirstName',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'studentLastName',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'studentPatronymic',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'suborganization',
      }),
      this.setNotNull({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'disciplineId',
      }),
      this.setNotNull({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'organizationId',
      }),
      this.setNotNull({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'semesterId',
      }),
      this.setNotNull({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'studentId',
      }),
      this.setNotNull({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'studyGroupId',
      }),
      this.setNotNull({
        schema: 'public',
        table: 'academic_performance_records',
        column: 'suborganizationId',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
