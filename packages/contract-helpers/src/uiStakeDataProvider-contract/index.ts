import { providers } from 'ethers';
import { StakeUiDataProviderValidator } from '../commons/validators/methodValidators';
import { isBnbAddress } from '../commons/validators/paramValidators';
import { StakedTokenDataProvider } from './typechain/StakedTokenDataProvider';
import { StakedTokenDataProvider__factory } from './typechain/StakedTokenDataProviderFactory';
import {
  GeneralStakeUIData,
  GeneralStakeUIDataHumanized,
  GetUserStakeUIData,
  GetUserStakeUIDataHumanized,
} from './types';

export interface UiStakeDataProviderInterface {
  getUserStakeUIData: (params: { user: string }) => Promise<GetUserStakeUIData>;
  getGeneralStakeUIData: () => Promise<GeneralStakeUIData>;
  getUserStakeUIDataHumanized: (params: {
    user: string;
  }) => Promise<GetUserStakeUIDataHumanized>;
  getGeneralStakeUIDataHumanized: () => Promise<GeneralStakeUIDataHumanized>;
}

export type UiStakeDataProviderContext = {
  uiStakeDataProvider: string;
  provider: providers.Provider;
};

export class UiStakeDataProvider implements UiStakeDataProviderInterface {
  private readonly _contract: StakedTokenDataProvider;

  public constructor(context: UiStakeDataProviderContext) {
    this._contract = StakedTokenDataProvider__factory.connect(
      context.uiStakeDataProvider,
      context.provider,
    );
  }

  @StakeUiDataProviderValidator
  public async getUserStakeUIData(
    @isBnbAddress('user') { user }: { user: string },
  ): Promise<GetUserStakeUIData> {
    const {
      stkLootBridgeData,
      stkLootBridgeUserData,
      stkBptData,
      stkBptUserData,
      bnbPrice,
    } = await this._contract.getAllStakedTokenUserData(user);

    return {
      stkLootBridgeData: {
        ...stkLootBridgeData,
        stakedTokenUserBalance: stkLootBridgeUserData.stakedTokenUserBalance,
        underlyingTokenUserBalance:
          stkLootBridgeUserData.underlyingTokenUserBalance,
        stakedTokenRedeemableAmount:
          stkLootBridgeUserData.stakedTokenRedeemableAmount,
        userCooldownAmount: stkLootBridgeUserData.userCooldownAmount,
        userCooldownTimestamp: stkLootBridgeUserData.userCooldownTimestamp,
        rewardsToClaim: stkLootBridgeUserData.rewardsToClaim,
      },
      stkBptData: {
        ...stkBptData,
        stakedTokenUserBalance: stkBptUserData.stakedTokenUserBalance,
        underlyingTokenUserBalance: stkBptUserData.underlyingTokenUserBalance,
        stakedTokenRedeemableAmount: stkBptUserData.stakedTokenRedeemableAmount,
        userCooldownAmount: stkBptUserData.userCooldownAmount,
        userCooldownTimestamp: stkBptUserData.userCooldownTimestamp,
        rewardsToClaim: stkBptUserData.rewardsToClaim,
      },
      bnbPrice,
    };
  }

  @StakeUiDataProviderValidator
  public async getUserStakeUIDataHumanized(
    @isBnbAddress('user') { user }: { user: string },
  ): Promise<GetUserStakeUIDataHumanized> {
    const contractResult = await this.getUserStakeUIData({ user });

    return {
      lootbridge: {
        stakeTokenUserBalance:
          contractResult.stkLootBridgeData.stakedTokenUserBalance.toString(),
        underlyingTokenUserBalance:
          contractResult.stkLootBridgeData.underlyingTokenUserBalance.toString(),
        stakeTokenRedeemableAmount:
          contractResult.stkLootBridgeData.stakedTokenRedeemableAmount.toString(),
        userCooldownAmount:
          contractResult.stkLootBridgeData.userCooldownAmount.toString(),
        userCooldownTimestamp:
          contractResult.stkLootBridgeData.userCooldownTimestamp,
        userIncentivesToClaim:
          contractResult.stkLootBridgeData.rewardsToClaim.toString(),
        userCooldown:
          contractResult.stkLootBridgeData.userCooldownAmount.toNumber(),
        userPermitNonce: '',
      },
      bpt: {
        stakeTokenUserBalance:
          contractResult.stkBptData.stakedTokenUserBalance.toString(),
        underlyingTokenUserBalance:
          contractResult.stkBptData.underlyingTokenUserBalance.toString(),
        stakeTokenRedeemableAmount:
          contractResult.stkBptData.stakedTokenRedeemableAmount.toString(),
        userCooldownAmount:
          contractResult.stkBptData.userCooldownAmount.toString(),
        userCooldownTimestamp: contractResult.stkBptData.userCooldownTimestamp,
        userIncentivesToClaim:
          contractResult.stkBptData.rewardsToClaim.toString(),
        userCooldown: contractResult.stkBptData.userCooldownAmount.toNumber(),
        userPermitNonce: '',
      },
      // bnbPriceUsd: contractResult.bnbPrice.toString(),
      usdPriceBnb: contractResult.bnbPrice.toString(),
    };
  }

  public async getGeneralStakeUIData(): Promise<GeneralStakeUIData> {
    const { stkLootBridgeData, stkBptData, bnbPrice } =
      await this._contract.getAllStakedTokenData();

    return {
      stkLootBridgeData,
      stkBptData,
      bnbPrice,
    };
  }

  public async getGeneralStakeUIDataHumanized(): Promise<GeneralStakeUIDataHumanized> {
    const contractResult = await this.getGeneralStakeUIData();

    return {
      lootbridge: {
        stakeTokenTotalSupply:
          contractResult.stkLootBridgeData.stakedTokenTotalSupply.toString(),
        stakeTokenTotalRedeemableAmount:
          contractResult.stkLootBridgeData.stakedTokenTotalRedeemableAmount.toString(),
        stakeCooldownSeconds:
          contractResult.stkLootBridgeData.stakeCooldownSeconds.toNumber(),
        stakeUnstakeWindow:
          contractResult.stkLootBridgeData.stakeUnstakeWindow.toNumber(),
        stakeTokenPriceBnb:
          contractResult.stkLootBridgeData.stakedTokenPriceEth.toString(),
        rewardTokenPriceBnb:
          contractResult.stkLootBridgeData.rewardTokenPriceBnb.toString(),
        stakeApy: contractResult.stkLootBridgeData.stakeApy.toString(),
        distributionPerSecond:
          contractResult.stkLootBridgeData.distributionPerSecond.toString(),
        distributionEnd:
          contractResult.stkLootBridgeData.distributionEnd.toString(),
      },
      bpt: {
        stakeTokenTotalSupply:
          contractResult.stkBptData.stakedTokenTotalSupply.toString(),
        stakeTokenTotalRedeemableAmount:
          contractResult.stkLootBridgeData.stakedTokenTotalRedeemableAmount.toString(),
        stakeCooldownSeconds:
          contractResult.stkBptData.stakeCooldownSeconds.toNumber(),
        stakeUnstakeWindow:
          contractResult.stkBptData.stakeUnstakeWindow.toNumber(),
        stakeTokenPriceBnb:
          contractResult.stkBptData.stakedTokenPriceEth.toString(),
        rewardTokenPriceBnb:
          contractResult.stkBptData.rewardTokenPriceBnb.toString(),
        stakeApy: contractResult.stkBptData.stakeApy.toString(),
        distributionPerSecond:
          contractResult.stkBptData.distributionPerSecond.toString(),
        distributionEnd: contractResult.stkBptData.distributionEnd.toString(),
      },
      // bnbPriceUsd: contractResult.bnbPrice.toString(),
      usdPriceBnb: contractResult.bnbPrice.toString(),
    };
  }
}
