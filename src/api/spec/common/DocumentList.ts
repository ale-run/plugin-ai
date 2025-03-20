import { ListFilter } from './ListFilter';

export declare class DocumentList<T> {
  filter: ListFilter;
  total: number;
  rows: T[];
}
