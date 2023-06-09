export function constrcutINClause(list: string[]): string {
  return `("${list.join('","')}")`;
}

export function jsDateToMySQLDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}