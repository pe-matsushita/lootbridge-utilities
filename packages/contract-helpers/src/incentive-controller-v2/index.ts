import { constants, providers } from 'ethers';
import BaseService from '../commons/BaseService';
import {
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  transactionType,
} from '../commons/types';
import { IncentivesValidator } from '../commons/validators/methodValidators';
import {
  isBnbAddress,
  isBnbAddressArray,
} from '../commons/validators/paramValidators';
import { ILootBridgeIncentivesControllerV2 } from './typechain/ILootBridgeIncentivesControllerV2';
import { ILootBridgeIncentivesControllerV2__factory } from './typechain/ILootBridgeIncentivesControllerV2__factory';

export type ClaimRewardsV2MethodType = {
  user: string;
  assets: string[];
  reward: string;
  to?: string;
  incentivesControllerAddress: string;
};

export type ClaimAllRewardsV2MethodType = {
  user: string;
  assets: string[];
  to?: string;
  incentivesControllerAddress: string;
};

export interface IncentivesControllerV2Interface {
  claimRewards: (
    args: ClaimRewardsV2MethodType,
  ) => EthereumTransactionTypeExtended[];
  claimAllRewards: (
    args: ClaimAllRewardsV2MethodType,
  ) => EthereumTransactionTypeExtended[];
}

export class IncentivesControllerV2
  extends BaseService<ILootBridgeIncentivesControllerV2>
  implements IncentivesControllerV2Interface
{
  constructor(provider: providers.Provider) {
    super(provider, ILootBridgeIncentivesControllerV2__factory);
  }

  @IncentivesValidator
  public claimRewards(
    @isBnbAddress('user')
    @isBnbAddress('incentivesControllerAddress')
    @isBnbAddress('to')
    @isBnbAddress('reward')
    @isBnbAddressArray('assets')
    {
      user,
      assets,
      to,
      incentivesControllerAddress,
      reward,
    }: ClaimRewardsV2MethodType,
  ): EthereumTransactionTypeExtended[] {
    const incentivesContract: ILootBridgeIncentivesControllerV2 =
      this.getContractInstance(incentivesControllerAddress);
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        incentivesContract.populateTransaction.claimRewards(
          assets,
          constants.MaxUint256.toString(),
          to ?? user,
          reward,
        ),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.REWARD_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @IncentivesValidator
  public claimAllRewards(
    @isBnbAddress('user')
    @isBnbAddress('incentivesControllerAddress')
    @isBnbAddress('to')
    @isBnbAddressArray('assets')
    {
      user,
      assets,
      to,
      incentivesControllerAddress,
    }: ClaimAllRewardsV2MethodType,
  ): EthereumTransactionTypeExtended[] {
    const incentivesContract: ILootBridgeIncentivesControllerV2 =
      this.getContractInstance(incentivesControllerAddress);
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        incentivesContract.populateTransaction.claimAllRewards(
          assets,
          to ?? user,
        ),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.REWARD_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
