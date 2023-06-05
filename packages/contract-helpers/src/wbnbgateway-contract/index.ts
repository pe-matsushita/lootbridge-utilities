import { BigNumber, constants, PopulatedTransaction, providers } from 'ethers';
import {
  BaseDebtToken,
  BaseDebtTokenInterface,
} from '../baseDebtToken-contract';
import BaseService from '../commons/BaseService';
import {
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  InterestRate,
  ProtocolAction,
  tEthereumAddress,
  transactionType,
} from '../commons/types';
import { gasLimitRecommendations, valueToWei } from '../commons/utils';
import { WBNBValidator } from '../commons/validators/methodValidators';
import {
  is0OrPositiveAmount,
  isBnbAddress,
  isPositiveAmount,
  isPositiveOrMinusOneAmount,
} from '../commons/validators/paramValidators';
import { IERC20ServiceInterface } from '../erc20-contract';
import { IWBNBGateway, IWBNBGatewayInterface } from './typechain/IWBNBGateway';
import { IWBNBGateway__factory } from './typechain/IWBNBGateway__factory';

export type WBNBDepositParamsType = {
  lendingPool: tEthereumAddress;
  user: tEthereumAddress;
  amount: string; // normal
  onBehalfOf?: tEthereumAddress;
  referralCode?: string;
};

export type WBNBWithdrawParamsType = {
  lendingPool: tEthereumAddress;
  user: tEthereumAddress;
  amount: string;
  lbTokenAddress: tEthereumAddress;
  onBehalfOf?: tEthereumAddress;
};

export type WBNBRepayParamsType = {
  lendingPool: tEthereumAddress;
  user: tEthereumAddress;
  amount: string;
  interestRateMode: InterestRate;
  onBehalfOf?: tEthereumAddress;
};

export type WBNBBorrowParamsType = {
  lendingPool: tEthereumAddress;
  user: tEthereumAddress;
  amount: string;
  debtTokenAddress?: tEthereumAddress;
  interestRateMode: InterestRate;
  referralCode?: string;
};

export interface WBNBGatewayInterface {
  generateDepositEthTxData: (
    args: WBNBDepositParamsType,
  ) => PopulatedTransaction;
  generateBorrowEthTxData: (args: WBNBBorrowParamsType) => PopulatedTransaction;
  depositBNB: (
    args: WBNBDepositParamsType,
  ) => EthereumTransactionTypeExtended[];
  withdrawBNB: (
    args: WBNBWithdrawParamsType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  repayBNB: (args: WBNBRepayParamsType) => EthereumTransactionTypeExtended[];
  borrowBNB: (
    args: WBNBBorrowParamsType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
}

export class WBNBGatewayService
  extends BaseService<IWBNBGateway>
  implements WBNBGatewayInterface
{
  readonly wbnbGatewayAddress: string;

  readonly baseDebtTokenService: BaseDebtTokenInterface;

  readonly erc20Service: IERC20ServiceInterface;

  readonly wbnbGatewayInstance: IWBNBGatewayInterface;

  generateDepositEthTxData: (
    args: WBNBDepositParamsType,
  ) => PopulatedTransaction;

  generateBorrowEthTxData: (args: WBNBBorrowParamsType) => PopulatedTransaction;

  constructor(
    provider: providers.Provider,
    erc20Service: IERC20ServiceInterface,
    wbnbGatewayAddress?: string,
  ) {
    super(provider, IWBNBGateway__factory);
    this.erc20Service = erc20Service;

    this.baseDebtTokenService = new BaseDebtToken(
      this.provider,
      this.erc20Service,
    );

    this.wbnbGatewayAddress = wbnbGatewayAddress ?? '';

    this.depositBNB = this.depositBNB.bind(this);
    this.withdrawBNB = this.withdrawBNB.bind(this);
    this.repayBNB = this.repayBNB.bind(this);
    this.borrowBNB = this.borrowBNB.bind(this);
    this.wbnbGatewayInstance = IWBNBGateway__factory.createInterface();
    this.generateDepositEthTxData = (
      args: WBNBDepositParamsType,
    ): PopulatedTransaction => {
      const txData = this.wbnbGatewayInstance.encodeFunctionData('depositBNB', [
        args.lendingPool,
        args.onBehalfOf ?? args.user,
        args.referralCode ?? '0',
      ]);
      const actionTx: PopulatedTransaction = {
        data: txData,
        to: this.wbnbGatewayAddress,
        from: args.user,
        value: BigNumber.from(args.amount),
        gasLimit: BigNumber.from(
          gasLimitRecommendations[ProtocolAction.deposit].limit,
        ),
      };
      return actionTx;
    };

    this.generateBorrowEthTxData = (
      args: WBNBBorrowParamsType,
    ): PopulatedTransaction => {
      const numericRateMode =
        args.interestRateMode === InterestRate.Variable ? 2 : 1;
      const txData = this.wbnbGatewayInstance.encodeFunctionData('borrowBNB', [
        args.lendingPool,
        args.amount,
        numericRateMode,
        args.referralCode ?? '0',
      ]);
      const actionTx: PopulatedTransaction = {
        data: txData,
        to: this.wbnbGatewayAddress,
        from: args.user,
        gasLimit: BigNumber.from(
          gasLimitRecommendations[ProtocolAction.borrowBNB].limit,
        ),
      };
      return actionTx;
    };
  }

  @WBNBValidator
  public depositBNB(
    @isBnbAddress('lendingPool')
    @isBnbAddress('user')
    @isBnbAddress('onBehalfOf')
    @isPositiveAmount('amount')
    @is0OrPositiveAmount('referralCode')
    {
      lendingPool,
      user,
      amount,
      onBehalfOf,
      referralCode,
    }: WBNBDepositParamsType,
  ): EthereumTransactionTypeExtended[] {
    const convertedAmount: string = valueToWei(amount, 18);

    const wbnbGatewayContract: IWBNBGateway = this.getContractInstance(
      this.wbnbGatewayAddress,
    );
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        wbnbGatewayContract.populateTransaction.depositBNB(
          lendingPool,
          onBehalfOf ?? user,
          referralCode ?? '0',
        ),
      from: user,
      value: convertedAmount,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @WBNBValidator
  public async borrowBNB(
    @isBnbAddress('lendingPool')
    @isBnbAddress('user')
    @isPositiveAmount('amount')
    @isBnbAddress('debtTokenAddress')
    @is0OrPositiveAmount('referralCode')
    {
      lendingPool,
      user,
      amount,
      debtTokenAddress,
      interestRateMode,
      referralCode,
    }: WBNBBorrowParamsType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const convertedAmount: string = valueToWei(amount, 18);
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;
    if (!debtTokenAddress) {
      throw new Error(
        `To borrow ETH you need to pass the stable or variable WETH debt Token Address corresponding the interestRateMode`,
      );
    }

    const delegationApproved: boolean =
      await this.baseDebtTokenService.isDelegationApproved({
        debtTokenAddress,
        allowanceGiver: user,
        allowanceReceiver: this.wbnbGatewayAddress,
        amount,
      });

    if (!delegationApproved) {
      const approveDelegationTx: EthereumTransactionTypeExtended =
        this.baseDebtTokenService.approveDelegation({
          user,
          delegatee: this.wbnbGatewayAddress,
          debtTokenAddress,
          amount: constants.MaxUint256.toString(),
        });

      txs.push(approveDelegationTx);
    }

    const wbnbGatewayContract: IWBNBGateway = this.getContractInstance(
      this.wbnbGatewayAddress,
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        wbnbGatewayContract.populateTransaction.borrowBNB(
          lendingPool,
          convertedAmount,
          numericRateMode,
          referralCode ?? '0',
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.borrowBNB,
      ),
    });

    return txs;
  }

  @WBNBValidator
  public async withdrawBNB(
    @isBnbAddress('lendingPool')
    @isBnbAddress('user')
    @isBnbAddress('onBehalfOf')
    @isPositiveOrMinusOneAmount('amount')
    @isBnbAddress('lbTokenAddress')
    {
      lendingPool,
      user,
      amount,
      onBehalfOf,
      lbTokenAddress,
    }: WBNBWithdrawParamsType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const { isApproved, approve }: IERC20ServiceInterface = this.erc20Service;
    const convertedAmount: string =
      amount === '-1'
        ? constants.MaxUint256.toString()
        : valueToWei(amount, 18);

    const approved: boolean = await isApproved({
      token: lbTokenAddress,
      user,
      spender: this.wbnbGatewayAddress,
      amount,
    });

    if (!approved) {
      const approveTx: EthereumTransactionTypeExtended = approve({
        user,
        token: lbTokenAddress,
        spender: this.wbnbGatewayAddress,
        amount: constants.MaxUint256.toString(),
      });
      txs.push(approveTx);
    }

    const wbnbGatewayContract: IWBNBGateway = this.getContractInstance(
      this.wbnbGatewayAddress,
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        wbnbGatewayContract.populateTransaction.withdrawBNB(
          lendingPool,
          convertedAmount,
          onBehalfOf ?? user,
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.withdrawBNB,
      ),
    });

    return txs;
  }

  @WBNBValidator
  public repayBNB(
    @isBnbAddress('lendingPool')
    @isBnbAddress('user')
    @isBnbAddress('onBehalfOf')
    @isPositiveAmount('amount')
    {
      lendingPool,
      user,
      amount,
      interestRateMode,
      onBehalfOf,
    }: WBNBRepayParamsType,
  ): EthereumTransactionTypeExtended[] {
    const convertedAmount: string = valueToWei(amount, 18);
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;
    const wbnbGatewayContract: IWBNBGateway = this.getContractInstance(
      this.wbnbGatewayAddress,
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        wbnbGatewayContract.populateTransaction.repayBNB(
          lendingPool,
          convertedAmount,
          numericRateMode,
          onBehalfOf ?? user,
        ),
      gasSurplus: 30,
      from: user,
      value: convertedAmount,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
