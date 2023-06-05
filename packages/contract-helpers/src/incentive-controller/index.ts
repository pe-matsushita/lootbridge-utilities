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
import { ILootBridgeIncentivesController } from './typechain/ILootBridgeIncentivesController';
import { ILootBridgeIncentivesController__factory } from './typechain/ILootBridgeIncentivesController__factory';

export type ClaimRewardsMethodType = {
  user: string;
  assets: string[];
  to?: string;
  incentivesControllerAddress: string;
};

export interface IncentivesControllerInterface {
  claimRewards: (
    args: ClaimRewardsMethodType,
  ) => EthereumTransactionTypeExtended[];
}

export class IncentivesController
  extends BaseService<ILootBridgeIncentivesController>
  implements IncentivesControllerInterface
{
  constructor(provider: providers.Provider) {
    super(provider, ILootBridgeIncentivesController__factory);
  }

  @IncentivesValidator
  public claimRewards(
    @isBnbAddress('user')
    @isBnbAddress('incentivesControllerAddress')
    @isBnbAddress('to')
    @isBnbAddressArray('assets')
    { user, assets, to, incentivesControllerAddress }: ClaimRewardsMethodType,
  ): EthereumTransactionTypeExtended[] {
    const incentivesContract: ILootBridgeIncentivesController =
      this.getContractInstance(incentivesControllerAddress);
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        incentivesContract.populateTransaction.claimRewards(
          assets,
          constants.MaxUint256.toString(),
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
