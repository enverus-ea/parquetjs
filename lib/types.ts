'use strict';
import * as BSON from "bson"
import { PrimitiveType, OriginalType } from "./types/types"
interface PARQUET_LOGICAL_TYPES {
    [key:string]: {
        primitiveType: PrimitiveType,
        toPrimitive: Function,
        fromPrimitive?: Function,
        originalType?: OriginalType,
        typeLength?: number
    }
}

interface INTERVAL {
  months: number,
  days: number,
  milliseconds: number
}

export const PARQUET_LOGICAL_TYPES: PARQUET_LOGICAL_TYPES = {
  'BOOLEAN': {
    primitiveType: 'BOOLEAN',
    toPrimitive: toPrimitive_BOOLEAN,
    fromPrimitive: fromPrimitive_BOOLEAN
  },
  'INT32': {
    primitiveType: 'INT32',
    toPrimitive: toPrimitive_INT32
  },
  'INT64': {
    primitiveType: 'INT64',
    toPrimitive: toPrimitive_INT64
  },
  'INT96': {
    primitiveType: 'INT96',
    toPrimitive: toPrimitive_INT96
  },
  'FLOAT': {
    primitiveType: 'FLOAT',
    toPrimitive: toPrimitive_FLOAT
  },
  'DOUBLE': {
    primitiveType: 'DOUBLE',
    toPrimitive: toPrimitive_DOUBLE
  },
  'BYTE_ARRAY': {
    primitiveType: 'BYTE_ARRAY',
    toPrimitive: toPrimitive_BYTE_ARRAY
  },
  'FIXED_LEN_BYTE_ARRAY': {
    primitiveType: 'FIXED_LEN_BYTE_ARRAY',
    toPrimitive: toPrimitive_BYTE_ARRAY
  },
  'UTF8': {
    primitiveType: 'BYTE_ARRAY',
    originalType: 'UTF8',
    toPrimitive: toPrimitive_UTF8,
    fromPrimitive: fromPrimitive_UTF8
  },
  'ENUM': {
    primitiveType: 'BYTE_ARRAY',
    originalType: 'UTF8',
    toPrimitive: toPrimitive_UTF8,
    fromPrimitive: fromPrimitive_UTF8
  },
  'TIME_MILLIS': {
    primitiveType: 'INT32',
    originalType: 'TIME_MILLIS',
    toPrimitive: toPrimitive_TIME_MILLIS
  },
  'TIME_MICROS': {
    primitiveType: 'INT64',
    originalType: 'TIME_MICROS',
    toPrimitive: toPrimitive_TIME_MICROS
  },
  'DATE': {
    primitiveType: 'INT32',
    originalType: 'DATE',
    toPrimitive: toPrimitive_DATE,
    fromPrimitive: fromPrimitive_DATE
  },
  'TIMESTAMP_MILLIS': {
    primitiveType: 'INT64',
    originalType: 'TIMESTAMP_MILLIS',
    toPrimitive: toPrimitive_TIMESTAMP_MILLIS,
    fromPrimitive: fromPrimitive_TIMESTAMP_MILLIS
  },
  'TIMESTAMP_MICROS': {
    primitiveType: 'INT64',
    originalType: 'TIMESTAMP_MICROS',
    toPrimitive: toPrimitive_TIMESTAMP_MICROS,
    fromPrimitive: fromPrimitive_TIMESTAMP_MICROS
  },
  'UINT_8': {
    primitiveType: 'INT32',
    originalType: 'UINT_8',
    toPrimitive: toPrimitive_UINT8
  },
  'UINT_16': {
    primitiveType: 'INT32',
    originalType: 'UINT_16',
    toPrimitive: toPrimitive_UINT16
  },
  'UINT_32': {
    primitiveType: 'INT32',
    originalType: 'UINT_32',
    toPrimitive: toPrimitive_UINT32
  },
  'UINT_64': {
    primitiveType: 'INT64',
    originalType: 'UINT_64',
    toPrimitive: toPrimitive_UINT64
  },
  'INT_8': {
    primitiveType: 'INT32',
    originalType: 'INT_8',
    toPrimitive: toPrimitive_INT8
  },
  'INT_16': {
    primitiveType: 'INT32',
    originalType: 'INT_16',
    toPrimitive: toPrimitive_INT16
  },
  'INT_32': {
    primitiveType: 'INT32',
    originalType: 'INT_32',
    toPrimitive: toPrimitive_INT32
  },
  'INT_64': {
    primitiveType: 'INT64',
    originalType: 'INT_64',
    toPrimitive: toPrimitive_INT64
  },
  'JSON': {
    primitiveType: 'BYTE_ARRAY',
    originalType: 'JSON',
    toPrimitive: toPrimitive_JSON,
    fromPrimitive: fromPrimitive_JSON
  },
  'BSON': {
    primitiveType: 'BYTE_ARRAY',
    originalType: 'BSON',
    toPrimitive: toPrimitive_BSON,
    fromPrimitive: fromPrimitive_BSON
  },
  'INTERVAL': {
    primitiveType: 'FIXED_LEN_BYTE_ARRAY',
    originalType: 'INTERVAL',
    typeLength: 12,
    toPrimitive: toPrimitive_INTERVAL,
    fromPrimitive: fromPrimitive_INTERVAL
  }
};

/**
 * Convert a value from it's native representation to the internal/underlying
 * primitive type
 */
export function toPrimitive(type: string | undefined, value: unknown) {
  if (type === undefined || !(type in PARQUET_LOGICAL_TYPES)) {
    throw 'invalid type: ' + type || "undefined";
  }

  return PARQUET_LOGICAL_TYPES[type].toPrimitive(value);
}

/**
 * Convert a value from it's internal/underlying primitive representation to
 * the native representation
 */
export function fromPrimitive(type: string | undefined, value: unknown) {
  if (type === undefined || !(type in PARQUET_LOGICAL_TYPES)) {
    throw 'invalid type: ' + type || "undefined";
  }
  
  const typeFromPrimitive = PARQUET_LOGICAL_TYPES[type].fromPrimitive
  if (typeFromPrimitive !== undefined) {
    return typeFromPrimitive(value)
  } else {
    return value;
  }
}

function toPrimitive_BOOLEAN(value: boolean) {
  return !!value;
}

function fromPrimitive_BOOLEAN(value: boolean) {
  return !!value;
}

function toPrimitive_FLOAT(value: number | string) {
  if (typeof value === 'string') {
    const v = parseFloat(value);
    return v;
  } else if (typeof value === 'number') {
    return value;
  }
  throw 'invalid value for FLOAT: ' + value;
}

function toPrimitive_DOUBLE(value: number | string) {
  if (typeof value === 'string') {
    const v = parseFloat(value);
    return v;
  } else if (typeof value === 'number') {
    return value;
  }
  throw 'invalid value for DOUBLE: ' + value;
}

function toPrimitive_INT8(value: number | bigint | string) {
  try {
    let v = value;
    if (typeof v === 'string') v = BigInt(value);
    checkValidValue(-0x80, 0x7f, v);

    return v;
  } catch {
      throw 'invalid value for INT8: ' + value;
  }
}

function toPrimitive_UINT8(value: number | bigint | string) {
  try {
    let v = value;
    if (typeof v === 'string') v = BigInt(value);
    checkValidValue(0, 0xff, v);

    return v;
  } catch {
      throw 'invalid value for UINT8: ' + value;
  }
}

function toPrimitive_INT16(value: number | bigint | string) {
  try {
    let v = value;
    if (typeof v === 'string') v = BigInt(value);
    checkValidValue(-0x8000, 0x7fff, v);

    return v;
  } catch {
      throw 'invalid value for INT16: ' + value;
  }
}

function toPrimitive_UINT16(value: number | bigint | string) {
  try {
    let v = value;
    if (typeof v === 'string') v = BigInt(value);
    checkValidValue(0, 0xffff, v);

    return v;
  } catch {
      throw 'invalid value for UINT16: ' + value;
  }
}

function toPrimitive_INT32(value: number | bigint | string) {
  try {
    let v = value;
    if (typeof v === 'string') v = BigInt(value);
    checkValidValue(-0x80000000, 0x7fffffff, v);

    return v;
  } catch {
      throw 'invalid value for INT32: ' + value;
  }
}


function toPrimitive_UINT32(value: number | bigint | string) {
  try {
    let v = value;
    if (typeof v === 'string') v = BigInt(value);
    checkValidValue(0, 0xffffffffffff, v);

    return v;
  } catch {
      throw 'invalid value for UINT32: ' + value;
  }
}

function toPrimitive_INT64(value: number | bigint | string) {
  try {
    let v = value;
    if (typeof v === 'string') v = BigInt(value);
    checkValidValue(-0x8000000000000000, 0x7fffffffffffffff, v);

    return v;
  } catch {
      throw 'invalid value for INT64: ' + value;
  }
}

function toPrimitive_UINT64(value: number | bigint | string) {
  try {
    let v = value;
    if (typeof v === 'string') v = BigInt(value);
    checkValidValue(0, 0xffffffffffffffff, v);

    return v;
  } catch {
      throw 'invalid value for UINT64: ' + value;
  }
}

function toPrimitive_INT96(value: number | bigint | string) {
  try {
    let v = value;
    if (typeof v === 'string') v = BigInt(value);
    checkValidValue(-0x800000000000000000000000, 0x7fffffffffffffffffffffff, v);

    return v;
  } catch {
      throw 'invalid value for INT96: ' + value;
  }
}

function toPrimitive_BYTE_ARRAY(value: Array<number>) {
  return Buffer.from(value);
}

function toPrimitive_UTF8(value: string) {
  return Buffer.from(value, 'utf8');
}

function fromPrimitive_UTF8(value: string) {
  return (value !== undefined && value !== null)  ? value.toString() : value;
}

function toPrimitive_JSON(value: object) {
  return Buffer.from(JSON.stringify(value));
}

function fromPrimitive_JSON(value: string) {
  return JSON.parse(value);
}

function toPrimitive_BSON(value: BSON.Document) {
  return Buffer.from(BSON.serialize(value));
}

function fromPrimitive_BSON(value: Buffer) {
  return BSON.deserialize(value);
}

function toPrimitive_TIME_MILLIS(value: string | number) {
  let v = value
  if (typeof value === `string`) {
    v = parseInt(value, 10);
  } 
  if (v < 0 || v > 0xffffffffffffffff || typeof v !== 'number') {
    throw 'invalid value for TIME_MILLIS: ' + value;
  }

  return v;
}

function toPrimitive_TIME_MICROS(value: string | number | bigint) {
  const v = BigInt(value);
  if (v < 0n ) {
    throw 'invalid value for TIME_MICROS: ' + value;
  }

  return v;
}

const kMillisPerDay = 86400000;

function toPrimitive_DATE(value: string | Date | number) {
  /* convert from date */
  if (value instanceof Date) {
    return value.getTime() / kMillisPerDay;
  }

/* convert from integer */
  let v = value
  if (typeof value === 'string') {
    v = parseInt(value, 10);
  } 

  if (v < 0 || typeof v !== 'number') {
    throw 'invalid value for DATE: ' + value;
  }

  return v;
  
}

function fromPrimitive_DATE(value: number ) {
  return new Date(+value * kMillisPerDay);
}


function toPrimitive_TIMESTAMP_MILLIS(value: string | Date | number) {
  /* convert from date */
  if (value instanceof Date) {
    return value.getTime();
  }

  /* convert from integer */

  let v = value
   if (typeof value === 'string' ) {
    v = parseInt(value, 10);
   }

  if (v < 0 || typeof v !== 'number') {
    throw 'invalid value for TIMESTAMP_MILLIS: ' + value;
  }

  return v;
  
}

function fromPrimitive_TIMESTAMP_MILLIS(value: number | string | bigint) {
  return new Date(Number(value));
}

function toPrimitive_TIMESTAMP_MICROS(value: Date | string | number | bigint) {
  /* convert from date */
  if (value instanceof Date) {
    return BigInt(value.getTime()) * 1000n;
  }

  /* convert from integer */
  {
    const v = BigInt(value);
    if (v < 0n /*|| isNaN(v)*/) {
      throw 'invalid value for TIMESTAMP_MICROS: ' + value;
    }

    return v;
  }
}

function fromPrimitive_TIMESTAMP_MICROS(value: number | bigint) {
  return typeof value === 'bigint' ? new Date(Number(value / 1000n)): new Date(value / 1000);
  }

function toPrimitive_INTERVAL(value: INTERVAL) {
  if (!value.months || !value.days || !value.milliseconds) {
    throw "value for INTERVAL must be object { months: ..., days: ..., milliseconds: ... }";
  }

  let buf = Buffer.alloc(12);
  buf.writeUInt32LE(value.months, 0);
  buf.writeUInt32LE(value.days, 4);
  buf.writeUInt32LE(value.milliseconds, 8);
  return buf;
}

function fromPrimitive_INTERVAL(value: string) {
  const buf = Buffer.from(value);
  const months = buf.readUInt32LE(0);
  const days = buf.readUInt32LE(4);
  const millis = buf.readUInt32LE(8);

  return { months: months, days: days, milliseconds: millis };
}

function checkValidValue(lowerRange: number, upperRange: number, v: number | bigint) {
  if (v < lowerRange || v > upperRange) {
    throw "invalid value"
  }
}
