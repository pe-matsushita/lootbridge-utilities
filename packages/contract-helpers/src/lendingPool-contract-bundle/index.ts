import { providers, PopulatedTransaction, BigNumber } from 'ethers';
import BaseService from '../commons/BaseService';
import {
  BorrowTxBuilder,
  InterestRate,
  LendingPoolMarketConfig,
  ProtocolAction,
  tEthereumAddress,
} from '../commons/types';
import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
} from '../commons/utils';
import {
  ApproveType,
  ERC20Service,
  IERC20ServiceInterface,
  TokenOwner,
} from '../erc20-contract';
import {
  LPBorrowParamsType,
  LPDepositParamsType,
} from '../lendingPool-contract/lendingPoolTypes';
import {
  ILendingPool,
  ILendingPoolInterface,
} from '../lendingPool-contract/typechain/ILendingPool';
import { ILendingPool__factory } from '../lendingPool-contract/typechain/ILendingPool__factory';
import { SynthetixInterface, SynthetixService } from '../synthetix-contract';
import {
  WBNBGatewayInterface,
  WBNBGatewayService,
} from '../wbnbgateway-contract';

export type DepositTxBuilder = {
  generateTxData: ({
    user,
    reserve,
    amount,
    onBehalfOf,
    referralCode,
  }: LPDepositParamsType) => PopulatedTransaction;
  getApprovedAmount: ({ user, token }: TokenOwner) => Promise<ApproveType>;
};

export interface LendingPoolBundleInterface {
  depositTxBuilder: DepositTxBuilder;
}

export class LendingPoolBundle
  extends BaseService<ILendingPool>
  implements LendingPoolBundleInterface
{
  readonly erc20Service: IERC20ServiceInterface;

  readonly lendingPoolAddress: tEthereumAddress;

  readonly synthetixService: SynthetixInterface;

  readonly wbnbGatewayService: WBNBGatewayInterface;

  readonly contractInterface: ILendingPoolInterface;

  readonly wbnbGatewayAddress: tEthereumAddress;

  depositTxBuilder: DepositTxBuilder;
  borrowTxBuilder: Omit<BorrowTxBuilder, 'useOptimizedPath' | 'encodedTxData'>;

  constructor(
    provider: providers.Provider,
    lendingPoolConfig?: LendingPoolMarketConfig,
  ) {
    super(provider, ILendingPool__factory);

    const { LENDING_POOL, WBNB_GATEWAY } = lendingPoolConfig ?? {};

    this.lendingPoolAddress = LENDING_POOL ?? '';
    this.wbnbGatewayAddress = WBNB_GATEWAY ?? '';

    // initialize services
    this.erc20Service = new ERC20Service(provider);
    this.synthetixService = new SynthetixService(provider);
    this.wbnbGatewayService = new WBNBGatewayService(
      provider,
      this.erc20Service,
      WBNB_GATEWAY,
    );

    this.contractInterface = ILendingPool__factory.createInterface();

    // Initialize depositTxBuilder
    this.depositTxBuilder = {
      getApprovedAmount: async (props: TokenOwner): Promise<ApproveType> => {
        const spender =
          props.token.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()
            ? this.wbnbGatewayAddress
            : this.lendingPoolAddress;
        const amount = await this.erc20Service.approvedAmount({
          ...props,
          spender,
        });
        return {
          ...props,
          spender,
          amount: amount.toString(),
        };
      },
      generateTxData: ({
        user,
        reserve,
        amount,
        onBehalfOf,
        referralCode,
      }: LPDepositParamsType): PopulatedTransaction => {
        let actionTx: PopulatedTransaction = {};
        if (reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()) {
          actionTx = this.wbnbGatewayService.generateDepositEthTxData({
            lendingPool: this.lendingPoolAddress,
            user,
            amount,
            onBehalfOf,
            referralCode,
          });
        } else {
          const txData = this.contractInterface.encodeFunctionData('deposit', [
            reserve,
            amount,
            onBehalfOf ?? user,
            referralCode ?? '0',
          ]);
          actionTx.to = this.lendingPoolAddress;
          actionTx.from = user;
          actionTx.data = txData;
          actionTx.gasLimit = BigNumber.from(
            gasLimitRecommendations[ProtocolAction.deposit].recommended,
          );
        }

        return actionTx;
      },
    };
    this.borrowTxBuilder = {
      generateTxData: ({
        user,
        reserve,
        amount,
        interestRateMode,
        debtTokenAddress,
        onBehalfOf,
        referralCode,
      }: Omit<
        LPBorrowParamsType,
        'useOptimizedPath' | 'encodedTxData'
      >): PopulatedTransaction => {
        let actionTx: PopulatedTransaction = {};
        const referralCodeParam = referralCode ?? '0';
        const onBehalfOfParam = onBehalfOf ?? user;
        const numericRateMode =
          interestRateMode === InterestRate.Variable ? 2 : 1;
        if (reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()) {
          if (!debtTokenAddress) {
            throw new Error(
              `To borrow BNB you need to pass the stable or variable WBNB debt Token Address corresponding the interestRateMode`,
            );
          }

          actionTx = this.wbnbGatewayService.generateBorrowEthTxData({
            lendingPool: this.lendingPoolAddress,
            user,
            amount,
            debtTokenAddress,
            interestRateMode,
            referralCode: referralCodeParam,
          });
        } else {
          const txData = this.contractInterface.encodeFunctionData('borrow', [
            reserve,
            amount,
            numericRateMode,
            referralCodeParam,
            onBehalfOfParam,
          ]);
          actionTx.to = this.lendingPoolAddress;
          actionTx.from = user;
          actionTx.data = txData;
          actionTx.gasLimit = BigNumber.from(
            gasLimitRecommendations[ProtocolAction.borrow].recommended,
          );
        }

        return actionTx;
      },
    };
  }
}
