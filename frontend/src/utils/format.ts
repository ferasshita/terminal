export const fmtDateTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

export const fmtNumber = (value: number | string, digits = 4) => Number(value).toFixed(digits);
