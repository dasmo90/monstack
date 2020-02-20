interface ISelectable<T> {
  condition: () => boolean;
  data: T;
}

export default function select<T>(selectables: ISelectable<T>[]): T[] {
  return selectables.filter(s => s.condition()).map(s => s.data);
}
