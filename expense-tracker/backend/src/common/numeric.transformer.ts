import { ValueTransformer } from 'typeorm';

/** PostgreSQL returns DECIMAL columns as strings; convert them to numbers. */
export const numeric: ValueTransformer = {
  to: (v?: number) => v,
  from: (v?: string | null) => (v === null || v === undefined ? v : Number(v)),
};
