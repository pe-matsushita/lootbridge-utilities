/* Autogenerated file. Do not edit manually. */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from 'ethers';
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from '@ethersproject/contracts';
import { BytesLike } from '@ethersproject/bytes';
import { Listener, Provider } from '@ethersproject/providers';
import { FunctionFragment, EventFragment, Result } from '@ethersproject/abi';

interface ILendingPoolInterface extends ethers.utils.Interface {
  functions: {
    'FLASHLOAN_PREMIUM_TOTAL()': FunctionFragment;
    'borrow(address,uint256,uint256,uint16,address)': FunctionFragment;
    'deposit(address,uint256,address,uint16)': FunctionFragment;
    'flashLoan(address,address[],uint256[],uint256[],address,bytes,uint16)': FunctionFragment;
    'liquidationCall(address,address,address,uint256,bool)': FunctionFragment;
    'repay(address,uint256,uint256,address)': FunctionFragment;
    'setUserUseReserveAsCollateral(address,bool)': FunctionFragment;
    'swapBorrowRateMode(address,uint256)': FunctionFragment;
    'withdraw(address,uint256,address)': FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: 'FLASHLOAN_PREMIUM_TOTAL',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'borrow',
    values: [string, BigNumberish, BigNumberish, BigNumberish, string],
  ): string;
  encodeFunctionData(
    functionFragment: 'deposit',
    values: [string, BigNumberish, string, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'flashLoan',
    values: [
      string,
      string[],
      BigNumberish[],
      BigNumberish[],
      string,
      BytesLike,
      BigNumberish,
    ],
  ): string;
  encodeFunctionData(
    functionFragment: 'liquidationCall',
    values: [string, string, string, BigNumberish, boolean],
  ): string;
  encodeFunctionData(
    functionFragment: 'repay',
    values: [string, BigNumberish, BigNumberish, string],
  ): string;
  encodeFunctionData(
    functionFragment: 'setUserUseReserveAsCollateral',
    values: [string, boolean],
  ): string;
  encodeFunctionData(
    functionFragment: 'swapBorrowRateMode',
    values: [string, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'withdraw',
    values: [string, BigNumberish, string],
  ): string;

  decodeFunctionResult(
    functionFragment: 'FLASHLOAN_PREMIUM_TOTAL',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'borrow', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'deposit', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'flashLoan', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'liquidationCall',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'repay', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'setUserUseReserveAsCollateral',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'swapBorrowRateMode',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'withdraw', data: BytesLike): Result;

  events: {};
}

export class ILendingPool extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: ILendingPoolInterface;

  functions: {
    FLASHLOAN_PREMIUM_TOTAL(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    'FLASHLOAN_PREMIUM_TOTAL()'(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    borrow(
      reserve: string,
      amount: BigNumberish,
      interestRateMode: BigNumberish,
      referralCode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    'borrow(address,uint256,uint256,uint16,address)'(
      reserve: string,
      amount: BigNumberish,
      interestRateMode: BigNumberish,
      referralCode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    deposit(
      reserve: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    'deposit(address,uint256,address,uint16)'(
      reserve: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    flashLoan(
      receiver: string,
      assets: string[],
      amounts: BigNumberish[],
      modes: BigNumberish[],
      onBehalfOf: string,
      params: BytesLike,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    'flashLoan(address,address[],uint256[],uint256[],address,bytes,uint16)'(
      receiver: string,
      assets: string[],
      amounts: BigNumberish[],
      modes: BigNumberish[],
      onBehalfOf: string,
      params: BytesLike,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    liquidationCall(
      collateral: string,
      reserve: string,
      user: string,
      purchaseAmount: BigNumberish,
      receiveLBToken: boolean,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    'liquidationCall(address,address,address,uint256,bool)'(
      collateral: string,
      reserve: string,
      user: string,
      purchaseAmount: BigNumberish,
      receiveLBToken: boolean,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    repay(
      reserve: string,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    'repay(address,uint256,uint256,address)'(
      reserve: string,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    setUserUseReserveAsCollateral(
      reserve: string,
      useAsCollateral: boolean,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    'setUserUseReserveAsCollateral(address,bool)'(
      reserve: string,
      useAsCollateral: boolean,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    swapBorrowRateMode(
      reserve: string,
      rateMode: BigNumberish,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    'swapBorrowRateMode(address,uint256)'(
      reserve: string,
      rateMode: BigNumberish,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    withdraw(
      reserve: string,
      amount: BigNumberish,
      to: string,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;

    'withdraw(address,uint256,address)'(
      reserve: string,
      amount: BigNumberish,
      to: string,
      overrides?: Overrides,
    ): Promise<ContractTransaction>;
  };

  FLASHLOAN_PREMIUM_TOTAL(overrides?: CallOverrides): Promise<BigNumber>;

  'FLASHLOAN_PREMIUM_TOTAL()'(overrides?: CallOverrides): Promise<BigNumber>;

  borrow(
    reserve: string,
    amount: BigNumberish,
    interestRateMode: BigNumberish,
    referralCode: BigNumberish,
    onBehalfOf: string,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  'borrow(address,uint256,uint256,uint16,address)'(
    reserve: string,
    amount: BigNumberish,
    interestRateMode: BigNumberish,
    referralCode: BigNumberish,
    onBehalfOf: string,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  deposit(
    reserve: string,
    amount: BigNumberish,
    onBehalfOf: string,
    referralCode: BigNumberish,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  'deposit(address,uint256,address,uint16)'(
    reserve: string,
    amount: BigNumberish,
    onBehalfOf: string,
    referralCode: BigNumberish,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  flashLoan(
    receiver: string,
    assets: string[],
    amounts: BigNumberish[],
    modes: BigNumberish[],
    onBehalfOf: string,
    params: BytesLike,
    referralCode: BigNumberish,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  'flashLoan(address,address[],uint256[],uint256[],address,bytes,uint16)'(
    receiver: string,
    assets: string[],
    amounts: BigNumberish[],
    modes: BigNumberish[],
    onBehalfOf: string,
    params: BytesLike,
    referralCode: BigNumberish,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  liquidationCall(
    collateral: string,
    reserve: string,
    user: string,
    purchaseAmount: BigNumberish,
    receiveLBToken: boolean,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  'liquidationCall(address,address,address,uint256,bool)'(
    collateral: string,
    reserve: string,
    user: string,
    purchaseAmount: BigNumberish,
    receiveLBToken: boolean,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  repay(
    reserve: string,
    amount: BigNumberish,
    rateMode: BigNumberish,
    onBehalfOf: string,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  'repay(address,uint256,uint256,address)'(
    reserve: string,
    amount: BigNumberish,
    rateMode: BigNumberish,
    onBehalfOf: string,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  setUserUseReserveAsCollateral(
    reserve: string,
    useAsCollateral: boolean,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  'setUserUseReserveAsCollateral(address,bool)'(
    reserve: string,
    useAsCollateral: boolean,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  swapBorrowRateMode(
    reserve: string,
    rateMode: BigNumberish,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  'swapBorrowRateMode(address,uint256)'(
    reserve: string,
    rateMode: BigNumberish,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  withdraw(
    reserve: string,
    amount: BigNumberish,
    to: string,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  'withdraw(address,uint256,address)'(
    reserve: string,
    amount: BigNumberish,
    to: string,
    overrides?: Overrides,
  ): Promise<ContractTransaction>;

  callStatic: {
    FLASHLOAN_PREMIUM_TOTAL(overrides?: CallOverrides): Promise<BigNumber>;

    'FLASHLOAN_PREMIUM_TOTAL()'(overrides?: CallOverrides): Promise<BigNumber>;

    borrow(
      reserve: string,
      amount: BigNumberish,
      interestRateMode: BigNumberish,
      referralCode: BigNumberish,
      onBehalfOf: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    'borrow(address,uint256,uint256,uint16,address)'(
      reserve: string,
      amount: BigNumberish,
      interestRateMode: BigNumberish,
      referralCode: BigNumberish,
      onBehalfOf: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    deposit(
      reserve: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    'deposit(address,uint256,address,uint16)'(
      reserve: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    flashLoan(
      receiver: string,
      assets: string[],
      amounts: BigNumberish[],
      modes: BigNumberish[],
      onBehalfOf: string,
      params: BytesLike,
      referralCode: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    'flashLoan(address,address[],uint256[],uint256[],address,bytes,uint16)'(
      receiver: string,
      assets: string[],
      amounts: BigNumberish[],
      modes: BigNumberish[],
      onBehalfOf: string,
      params: BytesLike,
      referralCode: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    liquidationCall(
      collateral: string,
      reserve: string,
      user: string,
      purchaseAmount: BigNumberish,
      receiveLBToken: boolean,
      overrides?: CallOverrides,
    ): Promise<void>;

    'liquidationCall(address,address,address,uint256,bool)'(
      collateral: string,
      reserve: string,
      user: string,
      purchaseAmount: BigNumberish,
      receiveLBToken: boolean,
      overrides?: CallOverrides,
    ): Promise<void>;

    repay(
      reserve: string,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    'repay(address,uint256,uint256,address)'(
      reserve: string,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    setUserUseReserveAsCollateral(
      reserve: string,
      useAsCollateral: boolean,
      overrides?: CallOverrides,
    ): Promise<void>;

    'setUserUseReserveAsCollateral(address,bool)'(
      reserve: string,
      useAsCollateral: boolean,
      overrides?: CallOverrides,
    ): Promise<void>;

    swapBorrowRateMode(
      reserve: string,
      rateMode: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    'swapBorrowRateMode(address,uint256)'(
      reserve: string,
      rateMode: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    withdraw(
      reserve: string,
      amount: BigNumberish,
      to: string,
      overrides?: CallOverrides,
    ): Promise<void>;

    'withdraw(address,uint256,address)'(
      reserve: string,
      amount: BigNumberish,
      to: string,
      overrides?: CallOverrides,
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    FLASHLOAN_PREMIUM_TOTAL(overrides?: CallOverrides): Promise<BigNumber>;

    'FLASHLOAN_PREMIUM_TOTAL()'(overrides?: CallOverrides): Promise<BigNumber>;

    borrow(
      reserve: string,
      amount: BigNumberish,
      interestRateMode: BigNumberish,
      referralCode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    'borrow(address,uint256,uint256,uint16,address)'(
      reserve: string,
      amount: BigNumberish,
      interestRateMode: BigNumberish,
      referralCode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    deposit(
      reserve: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    'deposit(address,uint256,address,uint16)'(
      reserve: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    flashLoan(
      receiver: string,
      assets: string[],
      amounts: BigNumberish[],
      modes: BigNumberish[],
      onBehalfOf: string,
      params: BytesLike,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    'flashLoan(address,address[],uint256[],uint256[],address,bytes,uint16)'(
      receiver: string,
      assets: string[],
      amounts: BigNumberish[],
      modes: BigNumberish[],
      onBehalfOf: string,
      params: BytesLike,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    liquidationCall(
      collateral: string,
      reserve: string,
      user: string,
      purchaseAmount: BigNumberish,
      receiveLBToken: boolean,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    'liquidationCall(address,address,address,uint256,bool)'(
      collateral: string,
      reserve: string,
      user: string,
      purchaseAmount: BigNumberish,
      receiveLBToken: boolean,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    repay(
      reserve: string,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    'repay(address,uint256,uint256,address)'(
      reserve: string,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    setUserUseReserveAsCollateral(
      reserve: string,
      useAsCollateral: boolean,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    'setUserUseReserveAsCollateral(address,bool)'(
      reserve: string,
      useAsCollateral: boolean,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    swapBorrowRateMode(
      reserve: string,
      rateMode: BigNumberish,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    'swapBorrowRateMode(address,uint256)'(
      reserve: string,
      rateMode: BigNumberish,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    withdraw(
      reserve: string,
      amount: BigNumberish,
      to: string,
      overrides?: Overrides,
    ): Promise<BigNumber>;

    'withdraw(address,uint256,address)'(
      reserve: string,
      amount: BigNumberish,
      to: string,
      overrides?: Overrides,
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    FLASHLOAN_PREMIUM_TOTAL(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    'FLASHLOAN_PREMIUM_TOTAL()'(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    borrow(
      reserve: string,
      amount: BigNumberish,
      interestRateMode: BigNumberish,
      referralCode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    'borrow(address,uint256,uint256,uint16,address)'(
      reserve: string,
      amount: BigNumberish,
      interestRateMode: BigNumberish,
      referralCode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    deposit(
      reserve: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    'deposit(address,uint256,address,uint16)'(
      reserve: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    flashLoan(
      receiver: string,
      assets: string[],
      amounts: BigNumberish[],
      modes: BigNumberish[],
      onBehalfOf: string,
      params: BytesLike,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    'flashLoan(address,address[],uint256[],uint256[],address,bytes,uint16)'(
      receiver: string,
      assets: string[],
      amounts: BigNumberish[],
      modes: BigNumberish[],
      onBehalfOf: string,
      params: BytesLike,
      referralCode: BigNumberish,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    liquidationCall(
      collateral: string,
      reserve: string,
      user: string,
      purchaseAmount: BigNumberish,
      receiveLBToken: boolean,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    'liquidationCall(address,address,address,uint256,bool)'(
      collateral: string,
      reserve: string,
      user: string,
      purchaseAmount: BigNumberish,
      receiveLBToken: boolean,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    repay(
      reserve: string,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    'repay(address,uint256,uint256,address)'(
      reserve: string,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    setUserUseReserveAsCollateral(
      reserve: string,
      useAsCollateral: boolean,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    'setUserUseReserveAsCollateral(address,bool)'(
      reserve: string,
      useAsCollateral: boolean,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    swapBorrowRateMode(
      reserve: string,
      rateMode: BigNumberish,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    'swapBorrowRateMode(address,uint256)'(
      reserve: string,
      rateMode: BigNumberish,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    withdraw(
      reserve: string,
      amount: BigNumberish,
      to: string,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;

    'withdraw(address,uint256,address)'(
      reserve: string,
      amount: BigNumberish,
      to: string,
      overrides?: Overrides,
    ): Promise<PopulatedTransaction>;
  };
}
