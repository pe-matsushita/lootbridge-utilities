import { BigNumber } from 'ethers';

export type GeneralStakeUIData = {
  stkLootBridgeData: {
    stakedTokenTotalSupply: BigNumber;
    stakedTokenTotalRedeemableAmount: BigNumber;
    stakeCooldownSeconds: BigNumber;
    stakeUnstakeWindow: BigNumber;
    rewardTokenPriceBnb: BigNumber;
    distributionEnd: BigNumber;
    distributionPerSecond: BigNumber;
    stakedTokenPriceEth: BigNumber;
    stakeApy: BigNumber;
  };
  stkBptData: {
    stakedTokenTotalSupply: BigNumber;
    stakedTokenTotalRedeemableAmount: BigNumber;
    stakeCooldownSeconds: BigNumber;
    stakeUnstakeWindow: BigNumber;
    rewardTokenPriceBnb: BigNumber;
    distributionEnd: BigNumber;
    distributionPerSecond: BigNumber;
    stakedTokenPriceEth: BigNumber;
    stakeApy: BigNumber;
  };
  bnbPrice: BigNumber;
};

export type GetUserStakeUIData = {
  stkLootBridgeData: {
    stakedTokenUserBalance: BigNumber;
    underlyingTokenUserBalance: BigNumber;
    stakedTokenRedeemableAmount: BigNumber;
    userCooldownAmount: BigNumber;
    userCooldownTimestamp: number;
    rewardsToClaim: BigNumber;
  };
  stkBptData: {
    stakedTokenUserBalance: BigNumber;
    underlyingTokenUserBalance: BigNumber;
    stakedTokenRedeemableAmount: BigNumber;
    userCooldownAmount: BigNumber;
    userCooldownTimestamp: number;
    rewardsToClaim: BigNumber;
  };
  bnbPrice: BigNumber;
};

export type GeneralStakeUIDataHumanized = {
  lootbridge: {
    stakeTokenTotalSupply: string;
    stakeTokenTotalRedeemableAmount: string;
    stakeCooldownSeconds: number;
    stakeUnstakeWindow: number;
    stakeTokenPriceBnb: string;
    rewardTokenPriceBnb: string;
    stakeApy: string;
    distributionPerSecond: string;
    distributionEnd: string;
  };
  bpt: {
    stakeTokenTotalSupply: string;
    stakeTokenTotalRedeemableAmount: string;
    stakeCooldownSeconds: number;
    stakeUnstakeWindow: number;
    stakeTokenPriceBnb: string;
    rewardTokenPriceBnb: string;
    stakeApy: string;
    distributionPerSecond: string;
    distributionEnd: string;
  };
  // bnbPriceUsd: string;
  usdPriceBnb: string;
};

export type GetUserStakeUIDataHumanized = {
  lootbridge: {
    stakeTokenUserBalance: string;
    underlyingTokenUserBalance: string;
    stakeTokenRedeemableAmount: string;
    userCooldownAmount: string;
    userCooldownTimestamp: number;
    userIncentivesToClaim: string;
    userCooldown: number;
    userPermitNonce: string;
  };
  bpt: {
    stakeTokenUserBalance: string;
    underlyingTokenUserBalance: string;
    stakeTokenRedeemableAmount: string;
    userCooldownAmount: string;
    userCooldownTimestamp: number;
    userIncentivesToClaim: string;
    userCooldown: number;
    userPermitNonce: string;
  };
  // bnbPriceUsd: string;
  usdPriceBnb: string;
};
