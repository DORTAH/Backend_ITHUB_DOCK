#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/19c07fc3523471fda4f843a70b57cb6a13b822a37a3215977c12577adf9d8143/contract';
import endContract from '../../snapshots/19c07fc3523471fda4f843a70b57cb6a13b822a37a3215977c12577adf9d8143/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/4aadc3c5f8776c549d84318c38fc68f54ccc8b47c414137b2888e460ca243a53/contract';
import startContract from '../../snapshots/4aadc3c5f8776c549d84318c38fc68f54ccc8b47c414137b2888e460ca243a53/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'attestation_commission_members',
        columns: [
          col('commissionId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('position', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'attestation_commissions',
        columns: [
          col('disciplineId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('semesterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studyGroupId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('studyProgramId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commission_members',
        index: 'att_comm_member_order_idx',
        columns: ['commissionId', 'sortOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commission_members',
        index: 'attestation_commission_members_commissionId_idx_5ca7b813',
        columns: ['commissionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'att_comm_group_sem_idx',
        columns: ['studyGroupId', 'semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'att_comm_prog_sem_idx',
        columns: ['studyProgramId', 'semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'attestation_commissions_disciplineId_idx_e8c0205f',
        columns: ['disciplineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'attestation_commissions_semesterId_idx_c8bca8d0',
        columns: ['semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'attestation_commissions_studyGroupId_idx_b7300630',
        columns: ['studyGroupId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'attestation_commissions_studyProgramId_idx_4b5996c5',
        columns: ['studyProgramId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attestation_commission_members',
        foreignKey: {
          name: 'attestation_commission_members_commissionId_fkey',
          columns: ['commissionId'],
          references: { schema: 'public', table: 'attestation_commissions', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attestation_commissions',
        foreignKey: {
          name: 'attestation_commissions_studyProgramId_fkey',
          columns: ['studyProgramId'],
          references: { schema: 'public', table: 'study_programs', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attestation_commissions',
        foreignKey: {
          name: 'attestation_commissions_semesterId_fkey',
          columns: ['semesterId'],
          references: { schema: 'public', table: 'semesters', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attestation_commissions',
        foreignKey: {
          name: 'attestation_commissions_studyGroupId_fkey',
          columns: ['studyGroupId'],
          references: { schema: 'public', table: 'study_groups', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attestation_commissions',
        foreignKey: {
          name: 'attestation_commissions_disciplineId_fkey',
          columns: ['disciplineId'],
          references: { schema: 'public', table: 'disciplines', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
