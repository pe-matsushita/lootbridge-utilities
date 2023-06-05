/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';

export const isBnbAddressMetadataKey = Symbol('bnbAddress');
export const isPermitDeadline32Bytes = Symbol('deadline32Bytes');
export const isBnbAddressArrayMetadataKey = Symbol('bnbAddressArray');
export const isBnbAddressOrENSMetadataKey = Symbol('ethOrENSAddress');
export const isPositiveMetadataKey = Symbol('isPositive');
export const isPositiveOrMinusOneMetadataKey = Symbol('isPositiveOrMinusOne');
export const is0OrPositiveMetadataKey = Symbol('is0OrPositiveMetadataKey');
export const optionalMetadataKey = Symbol('Optional');
export const isBnbAddressArrayMetadataKeyNotEmpty = Symbol(
  'isBnbAddressArrayMetadataKeyNotEmpty',
);

export type paramsType = {
  index: number;
  field: string | undefined;
};

export function isDeadline32Bytes(field?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    const existingPossibleAddresses: paramsType[] =
      Reflect.getOwnMetadata(isPermitDeadline32Bytes, target, propertyKey) ||
      [];

    existingPossibleAddresses.push({
      index: parameterIndex,
      field,
    });

    Reflect.defineMetadata(
      isPermitDeadline32Bytes,
      existingPossibleAddresses,
      target,
      propertyKey,
    );
  };
}

export function isBnbAddress(field?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    const existingPossibleAddresses: paramsType[] =
      Reflect.getOwnMetadata(isBnbAddressMetadataKey, target, propertyKey) ||
      [];

    existingPossibleAddresses.push({
      index: parameterIndex,
      field,
    });

    Reflect.defineMetadata(
      isBnbAddressMetadataKey,
      existingPossibleAddresses,
      target,
      propertyKey,
    );
  };
}

export function isBnbAddressArray(field?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    const existingPossibleAddresses: paramsType[] =
      Reflect.getOwnMetadata(
        isBnbAddressArrayMetadataKey,
        target,
        propertyKey,
      ) || [];

    existingPossibleAddresses.push({
      index: parameterIndex,
      field,
    });

    Reflect.defineMetadata(
      isBnbAddressArrayMetadataKey,
      existingPossibleAddresses,
      target,
      propertyKey,
    );
  };
}

// export function isNotEmptyEthAddressArray(field?: string) {
//   return function (
//     target: any,
//     propertyKey: string | symbol,
//     parameterIndex: number,
//   ): void {
//     const existingPossibleAddresses: paramsType[] =
//       Reflect.getOwnMetadata(
//         isBnbAddressArrayMetadataKeyNotEmpty,
//         target,
//         propertyKey,
//       ) || [];

//     existingPossibleAddresses.push({
//       index: parameterIndex,
//       field,
//     });

//     Reflect.defineMetadata(
//       isBnbAddressArrayMetadataKeyNotEmpty,
//       existingPossibleAddresses,
//       target,
//       propertyKey,
//     );
//   };
// }

export function isBnbAddressOrENS(field?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    const existingPossibleAddresses: paramsType[] =
      Reflect.getOwnMetadata(
        isBnbAddressOrENSMetadataKey,
        target,
        propertyKey,
      ) || [];

    existingPossibleAddresses.push({
      index: parameterIndex,
      field,
    });

    Reflect.defineMetadata(
      isBnbAddressOrENSMetadataKey,
      existingPossibleAddresses,
      target,
      propertyKey,
    );
  };
}

export function isPositiveAmount(field?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    const params: paramsType[] =
      Reflect.getOwnMetadata(isPositiveMetadataKey, target, propertyKey) || [];

    params.push({ index: parameterIndex, field });

    Reflect.defineMetadata(isPositiveMetadataKey, params, target, propertyKey);
  };
}

export function is0OrPositiveAmount(field?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    const params: paramsType[] =
      Reflect.getOwnMetadata(is0OrPositiveMetadataKey, target, propertyKey) ||
      [];

    params.push({ index: parameterIndex, field });

    Reflect.defineMetadata(
      is0OrPositiveMetadataKey,
      params,
      target,
      propertyKey,
    );
  };
}

export function isPositiveOrMinusOneAmount(field?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void {
    const params: paramsType[] =
      Reflect.getOwnMetadata(
        isPositiveOrMinusOneMetadataKey,
        target,
        propertyKey,
      ) || [];

    params.push({ index: parameterIndex, field });

    Reflect.defineMetadata(
      isPositiveOrMinusOneMetadataKey,
      params,
      target,
      propertyKey,
    );
  };
}

// export function optional(
//   target: any,
//   propertyKey: string | symbol,
//   parameterIndex: number,
// ): void {
//   const existingOptionalParameters =
//     Reflect.getOwnMetadata(optionalMetadataKey, target, propertyKey) || [];
//   existingOptionalParameters.push(parameterIndex);
//   Reflect.defineMetadata(
//     optionalMetadataKey,
//     existingOptionalParameters,
//     target,
//     propertyKey,
//   );
// }
