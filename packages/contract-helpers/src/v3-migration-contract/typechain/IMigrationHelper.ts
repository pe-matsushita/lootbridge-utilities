/* Autogenerated file. Do not edit manually. */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type { FunctionFragment, Result } from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from './common';

export declare namespace IMigrationHelper {
  export type RepaySimpleInputStruct = {
    asset: PromiseOrValue<string>;
    rateMode: PromiseOrValue<BigNumberish>;
  };

  export type RepaySimpleInputStructOutput = [string, BigNumber] & {
    asset: string;
    rateMode: BigNumber;
  };

  export type PermitInputStruct = {
    lbToken: PromiseOrValue<string>;
    value: PromiseOrValue<BigNumberish>;
    deadline: PromiseOrValue<BigNumberish>;
    v: PromiseOrValue<BigNumberish>;
    r: PromiseOrValue<BytesLike>;
    s: PromiseOrValue<BytesLike>;
  };

  export type PermitInputStructOutput = [
    string,
    BigNumber,
    BigNumber,
    number,
    string,
    string,
  ] & {
    lbToken: string;
    value: BigNumber;
    deadline: BigNumber;
    v: number;
    r: string;
    s: string;
  };

  export type CreditDelegationInputStruct = {
    debtToken: PromiseOrValue<string>;
    value: PromiseOrValue<BigNumberish>;
    deadline: PromiseOrValue<BigNumberish>;
    v: PromiseOrValue<BigNumberish>;
    r: PromiseOrValue<BytesLike>;
    s: PromiseOrValue<BytesLike>;
  };

  export type CreditDelegationInputStructOutput = [
    string,
    BigNumber,
    BigNumber,
    number,
    string,
    string,
  ] & {
    debtToken: string;
    value: BigNumber;
    deadline: BigNumber;
    v: number;
    r: string;
    s: string;
  };

  export type EmergencyTransferInputStruct = {
    asset: PromiseOrValue<string>;
    amount: PromiseOrValue<BigNumberish>;
    to: PromiseOrValue<string>;
  };

  export type EmergencyTransferInputStructOutput = [
    string,
    BigNumber,
    string,
  ] & { asset: string; amount: BigNumber; to: string };
}

export interface IMigrationHelperInterface extends utils.Interface {
  functions: {
    'ADDRESSES_PROVIDER()': FunctionFragment;
    'POOL()': FunctionFragment;
    'V2_POOL()': FunctionFragment;
    'cacheLBTokens()': FunctionFragment;
    'executeOperation(address[],uint256[],uint256[],address,bytes)': FunctionFragment;
    'getMigrationSupply(address,uint256)': FunctionFragment;
    'migrate(address[],(address,uint256)[],(address,uint256,uint256,uint8,bytes32,bytes32)[],(address,uint256,uint256,uint8,bytes32,bytes32)[])': FunctionFragment;
    'rescueFunds((address,uint256,address)[])': FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | 'ADDRESSES_PROVIDER'
      | 'POOL'
      | 'V2_POOL'
      | 'cacheLBTokens'
      | 'executeOperation'
      | 'getMigrationSupply'
      | 'migrate'
      | 'rescueFunds',
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: 'ADDRESSES_PROVIDER',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'POOL', values?: undefined): string;
  encodeFunctionData(functionFragment: 'V2_POOL', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'cacheLBTokens',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'executeOperation',
    values: [
      PromiseOrValue<string>[],
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
    ],
  ): string;
  encodeFunctionData(
    functionFragment: 'getMigrationSupply',
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>],
  ): string;
  encodeFunctionData(
    functionFragment: 'migrate',
    values: [
      PromiseOrValue<string>[],
      IMigrationHelper.RepaySimpleInputStruct[],
      IMigrationHelper.PermitInputStruct[],
      IMigrationHelper.CreditDelegationInputStruct[],
    ],
  ): string;
  encodeFunctionData(
    functionFragment: 'rescueFunds',
    values: [IMigrationHelper.EmergencyTransferInputStruct[]],
  ): string;

  decodeFunctionResult(
    functionFragment: 'ADDRESSES_PROVIDER',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'POOL', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'V2_POOL', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'cacheLBTokens',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'executeOperation',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'getMigrationSupply',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'migrate', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'rescueFunds',
    data: BytesLike,
  ): Result;

  events: {};
}

export interface IMigrationHelper extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IMigrationHelperInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>,
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>,
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    ADDRESSES_PROVIDER(overrides?: CallOverrides): Promise<[string]>;

    POOL(overrides?: CallOverrides): Promise<[string]>;

    V2_POOL(
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    cacheLBTokens(
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    executeOperation(
      assets: PromiseOrValue<string>[],
      amounts: PromiseOrValue<BigNumberish>[],
      premiums: PromiseOrValue<BigNumberish>[],
      initiator: PromiseOrValue<string>,
      params: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    getMigrationSupply(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<[string, BigNumber]>;

    migrate(
      assetsToMigrate: PromiseOrValue<string>[],
      positionsToRepay: IMigrationHelper.RepaySimpleInputStruct[],
      permits: IMigrationHelper.PermitInputStruct[],
      creditDelegationPermits: IMigrationHelper.CreditDelegationInputStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;

    rescueFunds(
      emergencyInput: IMigrationHelper.EmergencyTransferInputStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<ContractTransaction>;
  };

  ADDRESSES_PROVIDER(overrides?: CallOverrides): Promise<string>;

  POOL(overrides?: CallOverrides): Promise<string>;

  V2_POOL(
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  cacheLBTokens(
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  executeOperation(
    assets: PromiseOrValue<string>[],
    amounts: PromiseOrValue<BigNumberish>[],
    premiums: PromiseOrValue<BigNumberish>[],
    initiator: PromiseOrValue<string>,
    params: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  getMigrationSupply(
    asset: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides,
  ): Promise<[string, BigNumber]>;

  migrate(
    assetsToMigrate: PromiseOrValue<string>[],
    positionsToRepay: IMigrationHelper.RepaySimpleInputStruct[],
    permits: IMigrationHelper.PermitInputStruct[],
    creditDelegationPermits: IMigrationHelper.CreditDelegationInputStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  rescueFunds(
    emergencyInput: IMigrationHelper.EmergencyTransferInputStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<ContractTransaction>;

  callStatic: {
    ADDRESSES_PROVIDER(overrides?: CallOverrides): Promise<string>;

    POOL(overrides?: CallOverrides): Promise<string>;

    V2_POOL(overrides?: CallOverrides): Promise<string>;

    cacheLBTokens(overrides?: CallOverrides): Promise<void>;

    executeOperation(
      assets: PromiseOrValue<string>[],
      amounts: PromiseOrValue<BigNumberish>[],
      premiums: PromiseOrValue<BigNumberish>[],
      initiator: PromiseOrValue<string>,
      params: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    getMigrationSupply(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<[string, BigNumber]>;

    migrate(
      assetsToMigrate: PromiseOrValue<string>[],
      positionsToRepay: IMigrationHelper.RepaySimpleInputStruct[],
      permits: IMigrationHelper.PermitInputStruct[],
      creditDelegationPermits: IMigrationHelper.CreditDelegationInputStruct[],
      overrides?: CallOverrides,
    ): Promise<void>;

    rescueFunds(
      emergencyInput: IMigrationHelper.EmergencyTransferInputStruct[],
      overrides?: CallOverrides,
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    ADDRESSES_PROVIDER(overrides?: CallOverrides): Promise<BigNumber>;

    POOL(overrides?: CallOverrides): Promise<BigNumber>;

    V2_POOL(
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    cacheLBTokens(
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    executeOperation(
      assets: PromiseOrValue<string>[],
      amounts: PromiseOrValue<BigNumberish>[],
      premiums: PromiseOrValue<BigNumberish>[],
      initiator: PromiseOrValue<string>,
      params: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    getMigrationSupply(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    migrate(
      assetsToMigrate: PromiseOrValue<string>[],
      positionsToRepay: IMigrationHelper.RepaySimpleInputStruct[],
      permits: IMigrationHelper.PermitInputStruct[],
      creditDelegationPermits: IMigrationHelper.CreditDelegationInputStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;

    rescueFunds(
      emergencyInput: IMigrationHelper.EmergencyTransferInputStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ADDRESSES_PROVIDER(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    POOL(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    V2_POOL(
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    cacheLBTokens(
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    executeOperation(
      assets: PromiseOrValue<string>[],
      amounts: PromiseOrValue<BigNumberish>[],
      premiums: PromiseOrValue<BigNumberish>[],
      initiator: PromiseOrValue<string>,
      params: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    getMigrationSupply(
      asset: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    migrate(
      assetsToMigrate: PromiseOrValue<string>[],
      positionsToRepay: IMigrationHelper.RepaySimpleInputStruct[],
      permits: IMigrationHelper.PermitInputStruct[],
      creditDelegationPermits: IMigrationHelper.CreditDelegationInputStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;

    rescueFunds(
      emergencyInput: IMigrationHelper.EmergencyTransferInputStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> },
    ): Promise<PopulatedTransaction>;
  };
}
