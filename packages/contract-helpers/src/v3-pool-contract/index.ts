import { BytesLike, Signature, splitSignature } from '@ethersproject/bytes';
import {
  BigNumberish,
  constants,
  PopulatedTransaction,
  providers,
  utils,
} from 'ethers';
import BaseService from '../commons/BaseService';
import {
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  InterestRate,
  ProtocolAction,
  tEthereumAddress,
  transactionType,
} from '../commons/types';
import {
  API_ETH_MOCK_ADDRESS,
  augustusToAmountOffsetFromCalldata,
  DEFAULT_APPROVE_AMOUNT,
  getTxValue,
  SURPLUS,
  valueToWei,
} from '../commons/utils';
import {
  LPFlashLiquidationValidatorV3,
  LPRepayWithCollateralValidatorV3,
  LPSwapCollateralValidatorV3,
  LPValidatorV3,
} from '../commons/validators/methodValidators';
import {
  is0OrPositiveAmount,
  isBnbAddress,
  isPositiveAmount,
  isPositiveOrMinusOneAmount,
  isBnbAddressArray,
} from '../commons/validators/paramValidators';
import { ERC20_2612Service, ERC20_2612Interface } from '../erc20-2612';
import { ERC20Service, IERC20ServiceInterface } from '../erc20-contract';
import {
  augustusFromAmountOffsetFromCalldata,
  LiquiditySwapAdapterInterface,
  LiquiditySwapAdapterService,
} from '../paraswap-liquiditySwapAdapter-contract';
import {
  ParaswapRepayWithCollateral,
  ParaswapRepayWithCollateralInterface,
} from '../paraswap-repayWithCollateralAdapter-contract';
import { SynthetixInterface, SynthetixService } from '../synthetix-contract';
import { IMigrationHelper } from '../v3-migration-contract/typechain/IMigrationHelper';
import { L2Pool, L2PoolInterface } from '../v3-pool-rollups';
import {
  WBNBGatewayInterface,
  WBNBGatewayService,
} from '../wbnbgateway-contract';
import {
  LPBorrowParamsType,
  LPSupplyParamsType,
  LPFlashLiquidation,
  LPLiquidationCall,
  LPParaswapRepayWithCollateral,
  LPRepayParamsType,
  LPRepayWithLBTokensType,
  LPRepayWithPermitParamsType,
  LPSetUsageAsCollateral,
  LPSetUserEModeType,
  LPSignERC20ApprovalType,
  LPSupplyWithPermitType,
  LPSwapBorrowRateMode,
  LPSwapCollateral,
  LPWithdrawParamsType,
  LPV3MigrationParamsType,
} from './lendingPoolTypes';
import { IPool } from './typechain/IPool';
import { IPool__factory } from './typechain/IPool__factory';

export interface PoolInterface {
  deposit: (
    args: LPSupplyParamsType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  supply: (
    args: LPSupplyParamsType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  signERC20Approval: (args: LPSignERC20ApprovalType) => Promise<string>;
  supplyWithPermit: (
    args: LPSupplyWithPermitType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  withdraw: (
    args: LPWithdrawParamsType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  borrow: (
    args: LPBorrowParamsType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  repay: (
    args: LPRepayParamsType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  repayWithPermit: (
    args: LPRepayWithPermitParamsType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  swapBorrowRateMode: (
    args: LPSwapBorrowRateMode,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  setUsageAsCollateral: (
    args: LPSetUsageAsCollateral,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  swapCollateral: (
    args: LPSwapCollateral,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  flashLiquidation: (
    args: LPFlashLiquidation,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  repayWithLBTokens: (
    args: LPRepayWithLBTokensType,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  liquidationCall: (
    args: LPLiquidationCall,
  ) => Promise<EthereumTransactionTypeExtended[]>;
  setUserEMode: (args: LPSetUserEModeType) => EthereumTransactionTypeExtended[];
  paraswapRepayWithCollateral(
    args: LPParaswapRepayWithCollateral,
  ): Promise<EthereumTransactionTypeExtended[]>;
}

export type LendingPoolMarketConfigV3 = {
  POOL: tEthereumAddress;
  WBNB_GATEWAY?: tEthereumAddress;
  FLASH_LIQUIDATION_ADAPTER?: tEthereumAddress;
  REPAY_WITH_COLLATERAL_ADAPTER?: tEthereumAddress;
  SWAP_COLLATERAL_ADAPTER?: tEthereumAddress;
  L2_ENCODER?: tEthereumAddress;
  L2_POOL?: tEthereumAddress;
};

const buildParaSwapLiquiditySwapParams = (
  assetToSwapTo: tEthereumAddress,
  minAmountToReceive: BigNumberish,
  swapAllBalanceOffset: BigNumberish,
  swapCalldata: string | Buffer | BytesLike,
  augustus: tEthereumAddress,
  permitAmount: BigNumberish,
  deadline: BigNumberish,
  v: BigNumberish,
  r: string | Buffer | BytesLike,
  s: string | Buffer | BytesLike,
) => {
  return utils.defaultAbiCoder.encode(
    [
      'address',
      'uint256',
      'uint256',
      'bytes',
      'address',
      'tuple(uint256,uint256,uint8,bytes32,bytes32)',
    ],
    [
      assetToSwapTo,
      minAmountToReceive,
      swapAllBalanceOffset,
      swapCalldata,
      augustus,
      [permitAmount, deadline, v, r, s],
    ],
  );
};

export class Pool extends BaseService<IPool> implements PoolInterface {
  readonly erc20Service: IERC20ServiceInterface;

  readonly poolAddress: string;

  readonly synthetixService: SynthetixInterface;

  readonly wbnbGatewayService: WBNBGatewayInterface;

  readonly liquiditySwapAdapterService: LiquiditySwapAdapterInterface;

  readonly paraswapRepayWithCollateralAdapterService: ParaswapRepayWithCollateralInterface;

  readonly erc20_2612Service: ERC20_2612Interface;

  readonly flashLiquidationAddress: string;

  readonly swapCollateralAddress: string;

  readonly repayWithCollateralAddress: string;

  readonly l2EncoderAddress: string;

  readonly l2PoolAddress: string;

  readonly l2PoolService: L2PoolInterface;

  constructor(
    provider: providers.Provider,
    lendingPoolConfig?: LendingPoolMarketConfigV3,
  ) {
    super(provider, IPool__factory);

    const {
      POOL,
      FLASH_LIQUIDATION_ADAPTER,
      REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER,
      WBNB_GATEWAY,
      L2_ENCODER,
    } = lendingPoolConfig ?? {};

    this.poolAddress = POOL ?? '';
    this.flashLiquidationAddress = FLASH_LIQUIDATION_ADAPTER ?? '';
    this.swapCollateralAddress = SWAP_COLLATERAL_ADAPTER ?? '';
    this.repayWithCollateralAddress = REPAY_WITH_COLLATERAL_ADAPTER ?? '';
    this.l2EncoderAddress = L2_ENCODER ?? '';

    // initialize services
    this.erc20_2612Service = new ERC20_2612Service(provider);
    this.erc20Service = new ERC20Service(provider);
    this.synthetixService = new SynthetixService(provider);
    this.wbnbGatewayService = new WBNBGatewayService(
      provider,
      this.erc20Service,
      WBNB_GATEWAY,
    );
    this.liquiditySwapAdapterService = new LiquiditySwapAdapterService(
      provider,
      SWAP_COLLATERAL_ADAPTER,
    );

    this.paraswapRepayWithCollateralAdapterService =
      new ParaswapRepayWithCollateral(provider, REPAY_WITH_COLLATERAL_ADAPTER);

    this.l2PoolService = new L2Pool(provider, {
      l2PoolAddress: this.poolAddress,
      encoderAddress: this.l2EncoderAddress,
    });
  }

  @LPValidatorV3
  public async deposit(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    @isPositiveAmount('amount')
    @isBnbAddress('onBehalfOf')
    { user, reserve, amount, onBehalfOf, referralCode }: LPSupplyParamsType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    if (reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()) {
      return this.wbnbGatewayService.depositBNB({
        lendingPool: this.poolAddress,
        user,
        amount,
        onBehalfOf,
        referralCode,
      });
    }

    const { isApproved, approve, decimalsOf }: IERC20ServiceInterface =
      this.erc20Service;
    const txs: EthereumTransactionTypeExtended[] = [];
    const reserveDecimals: number = await decimalsOf(reserve);
    const convertedAmount: string = valueToWei(amount, reserveDecimals);

    const fundsAvailable: boolean =
      await this.synthetixService.synthetixValidation({
        user,
        reserve,
        amount: convertedAmount,
      });
    if (!fundsAvailable) {
      throw new Error('Not enough funds to execute operation');
    }

    const approved = await isApproved({
      token: reserve,
      user,
      spender: this.poolAddress,
      amount,
    });

    if (!approved) {
      const approveTx: EthereumTransactionTypeExtended = approve({
        user,
        token: reserve,
        spender: this.poolAddress,
        amount: DEFAULT_APPROVE_AMOUNT,
      });
      txs.push(approveTx);
    }

    const lendingPoolContract: IPool = this.getContractInstance(
      this.poolAddress,
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        lendingPoolContract.populateTransaction.deposit(
          reserve,
          convertedAmount,
          onBehalfOf ?? user,
          referralCode ?? '0',
        ),
      from: user,
      value: getTxValue(reserve, convertedAmount),
      action: ProtocolAction.supply,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.supply,
      ),
    });

    return txs;
  }

  @LPValidatorV3
  public async supply(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    @isPositiveAmount('amount')
    @isBnbAddress('onBehalfOf')
    {
      user,
      reserve,
      amount,
      onBehalfOf,
      referralCode,
      useOptimizedPath,
    }: LPSupplyParamsType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    if (reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()) {
      return this.wbnbGatewayService.depositBNB({
        lendingPool: this.poolAddress,
        user,
        amount,
        onBehalfOf,
        referralCode,
      });
    }

    const { isApproved, approve, decimalsOf }: IERC20ServiceInterface =
      this.erc20Service;
    const txs: EthereumTransactionTypeExtended[] = [];
    const reserveDecimals: number = await decimalsOf(reserve);
    const convertedAmount: string = valueToWei(amount, reserveDecimals);

    const fundsAvailable: boolean =
      await this.synthetixService.synthetixValidation({
        user,
        reserve,
        amount: convertedAmount,
      });
    if (!fundsAvailable) {
      throw new Error('Not enough funds to execute operation');
    }

    const approved = await isApproved({
      token: reserve,
      user,
      spender: this.poolAddress,
      amount,
    });

    if (!approved) {
      const approveTx: EthereumTransactionTypeExtended = approve({
        user,
        token: reserve,
        spender: this.poolAddress,
        amount: DEFAULT_APPROVE_AMOUNT,
      });
      txs.push(approveTx);
    }

    const lendingPoolContract: IPool = this.getContractInstance(
      this.poolAddress,
    );

    // use optimized path
    if (useOptimizedPath) {
      return this.l2PoolService.supply(
        { user, reserve, amount: convertedAmount, referralCode },
        txs,
      );
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        lendingPoolContract.populateTransaction.supply(
          reserve,
          convertedAmount,
          onBehalfOf ?? user,
          referralCode ?? '0',
        ),
      from: user,
      value: getTxValue(reserve, convertedAmount),
      action: ProtocolAction.supply,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.supply,
      ),
    });

    return txs;
  }

  // Sign permit supply
  @LPValidatorV3
  public async signERC20Approval(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    @isPositiveOrMinusOneAmount('amount')
    { user, reserve, amount, deadline }: LPSignERC20ApprovalType,
  ): Promise<string> {
    const { getTokenData, isApproved } = this.erc20Service;
    const { name, decimals } = await getTokenData(reserve);

    const convertedAmount =
      amount === '-1'
        ? constants.MaxUint256.toString()
        : valueToWei(amount, decimals);

    const approved = await isApproved({
      token: reserve,
      user,
      spender: this.poolAddress,
      amount,
    });

    if (approved) {
      return '';
    }

    const { chainId } = await this.provider.getNetwork();

    const nonce = await this.erc20_2612Service.getNonce({
      token: reserve,
      owner: user,
    });

    if (nonce === null) {
      return '';
    }

    const typeData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'Permit',
      domain: {
        name,
        version: '1',
        chainId,
        verifyingContract: reserve,
      },
      message: {
        owner: user,
        spender: this.poolAddress,
        value: convertedAmount,
        nonce,
        deadline,
      },
    };
    return JSON.stringify(typeData);
  }

  @LPValidatorV3
  public async supplyWithPermit(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    @isBnbAddress('onBehalfOf')
    @isPositiveAmount('amount')
    @isPositiveAmount('referralCode')
    {
      user,
      reserve,
      onBehalfOf,
      amount,
      referralCode,
      signature,
      useOptimizedPath,
      deadline,
    }: LPSupplyWithPermitType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const { decimalsOf } = this.erc20Service;
    const poolContract: IPool = this.getContractInstance(this.poolAddress);
    const stakedTokenDecimals: number = await decimalsOf(reserve);
    const convertedAmount: string = valueToWei(amount, stakedTokenDecimals);
    // const sig: Signature = utils.splitSignature(signature);
    const sig: Signature = splitSignature(signature);
    const fundsAvailable: boolean =
      await this.synthetixService.synthetixValidation({
        user,
        reserve,
        amount: convertedAmount,
      });
    if (!fundsAvailable) {
      throw new Error('Not enough funds to execute operation');
    }

    if (useOptimizedPath) {
      return this.l2PoolService.supplyWithPermit(
        {
          user,
          reserve,
          amount: convertedAmount,
          referralCode,
          deadline,
          permitV: sig.v,
          permitR: sig.r,
          permitS: sig.s,
        },
        txs,
      );
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        poolContract.populateTransaction.supplyWithPermit(
          reserve,
          convertedAmount,
          onBehalfOf ?? user,
          referralCode ?? 0,
          deadline,
          sig.v,
          sig.r,
          sig.s,
        ),
      from: user,
      action: ProtocolAction.supplyWithPermit,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.supplyWithPermit,
      ),
    });

    return txs;
  }

  @LPValidatorV3
  public async withdraw(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    @isPositiveOrMinusOneAmount('amount')
    @isBnbAddress('onBehalfOf')
    @isBnbAddress('lbTokenAddress')
    {
      user,
      reserve,
      amount,
      onBehalfOf,
      lbTokenAddress,
      useOptimizedPath,
    }: LPWithdrawParamsType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    if (reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()) {
      if (!lbTokenAddress) {
        throw new Error(
          'To withdraw ETH you need to pass the aWBNB token address',
        );
      }

      return this.wbnbGatewayService.withdrawBNB({
        lendingPool: this.poolAddress,
        user,
        amount,
        onBehalfOf,
        lbTokenAddress,
      });
    }

    const { decimalsOf }: IERC20ServiceInterface = this.erc20Service;
    const decimals: number = await decimalsOf(reserve);

    const convertedAmount: string =
      amount === '-1'
        ? constants.MaxUint256.toString()
        : valueToWei(amount, decimals);

    if (useOptimizedPath) {
      return this.l2PoolService.withdraw({
        user,
        reserve,
        amount: convertedAmount,
      });
    }

    const poolContract: IPool = this.getContractInstance(this.poolAddress);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        poolContract.populateTransaction.withdraw(
          reserve,
          convertedAmount,
          onBehalfOf ?? user,
        ),
      from: user,
      action: ProtocolAction.withdraw,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation(
          [],
          txCallback,
          ProtocolAction.withdraw,
        ),
      },
    ];
  }

  @LPValidatorV3
  public async borrow(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    @isPositiveAmount('amount')
    @isBnbAddress('debtTokenAddress')
    @isBnbAddress('onBehalfOf')
    {
      user,
      reserve,
      amount,
      interestRateMode,
      debtTokenAddress,
      onBehalfOf,
      referralCode,
      useOptimizedPath,
    }: LPBorrowParamsType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    if (reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()) {
      if (!debtTokenAddress) {
        throw new Error(
          `To borrow ETH you need to pass the stable or variable WBNB debt Token Address corresponding the interestRateMode`,
        );
      }

      return this.wbnbGatewayService.borrowBNB({
        lendingPool: this.poolAddress,
        user,
        amount,
        debtTokenAddress,
        interestRateMode,
        referralCode,
      });
    }

    const { decimalsOf }: IERC20ServiceInterface = this.erc20Service;
    const reserveDecimals = await decimalsOf(reserve);
    const formatAmount: string = valueToWei(amount, reserveDecimals);

    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;

    if (useOptimizedPath) {
      return this.l2PoolService.borrow({
        user,
        reserve,
        amount: formatAmount,
        numericRateMode,
        referralCode,
      });
    }

    const poolContract = this.getContractInstance(this.poolAddress);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        poolContract.populateTransaction.borrow(
          reserve,
          formatAmount,
          numericRateMode,
          referralCode ?? 0,
          onBehalfOf ?? user,
        ),
      from: user,
      action: ProtocolAction.borrow,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation(
          [],
          txCallback,
          ProtocolAction.borrow,
        ),
      },
    ];
  }

  @LPValidatorV3
  public async repay(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    @isPositiveOrMinusOneAmount('amount')
    @isBnbAddress('onBehalfOf')
    {
      user,
      reserve,
      amount,
      interestRateMode,
      onBehalfOf,
      useOptimizedPath,
    }: LPRepayParamsType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    if (reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()) {
      return this.wbnbGatewayService.repayBNB({
        lendingPool: this.poolAddress,
        user,
        amount,
        interestRateMode,
        onBehalfOf,
      });
    }

    const txs: EthereumTransactionTypeExtended[] = [];
    const { isApproved, approve, decimalsOf }: IERC20ServiceInterface =
      this.erc20Service;

    const poolContract = this.getContractInstance(this.poolAddress);
    const { populateTransaction }: IPool = poolContract;
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;
    const decimals: number = await decimalsOf(reserve);

    const convertedAmount: string =
      amount === '-1'
        ? constants.MaxUint256.toString()
        : valueToWei(amount, decimals);

    if (amount !== '-1') {
      const fundsAvailable: boolean =
        await this.synthetixService.synthetixValidation({
          user,
          reserve,
          amount: convertedAmount,
        });
      if (!fundsAvailable) {
        throw new Error('Not enough funds to execute operation');
      }
    }

    const approved: boolean = await isApproved({
      token: reserve,
      user,
      spender: this.poolAddress,
      amount,
    });

    if (!approved) {
      const approveTx: EthereumTransactionTypeExtended = approve({
        user,
        token: reserve,
        spender: this.poolAddress,
        amount: DEFAULT_APPROVE_AMOUNT,
      });
      txs.push(approveTx);
    }

    if (useOptimizedPath) {
      return this.l2PoolService.repay(
        {
          user,
          reserve,
          amount: convertedAmount,
          numericRateMode,
        },
        txs,
      );
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        populateTransaction.repay(
          reserve,
          convertedAmount,
          numericRateMode,
          onBehalfOf ?? user,
        ),
      from: user,
      value: getTxValue(reserve, convertedAmount),
      action: ProtocolAction.repay,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.repay,
      ),
    });

    return txs;
  }

  @LPValidatorV3
  public async repayWithPermit(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    @isPositiveOrMinusOneAmount('amount')
    @isBnbAddress('onBehalfOf')
    {
      user,
      reserve,
      amount,
      interestRateMode,
      onBehalfOf,
      signature,
      useOptimizedPath,
      deadline,
    }: LPRepayWithPermitParamsType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const { decimalsOf }: IERC20ServiceInterface = this.erc20Service;

    const poolContract = this.getContractInstance(this.poolAddress);
    const { populateTransaction }: IPool = poolContract;
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;
    const decimals: number = await decimalsOf(reserve);
    const sig: Signature = splitSignature(signature);

    const convertedAmount: string =
      amount === '-1'
        ? constants.MaxUint256.toString()
        : valueToWei(amount, decimals);

    if (amount !== '-1') {
      const fundsAvailable: boolean =
        await this.synthetixService.synthetixValidation({
          user,
          reserve,
          amount: convertedAmount,
        });
      if (!fundsAvailable) {
        throw new Error('Not enough funds to execute operation');
      }
    }

    if (useOptimizedPath) {
      return this.l2PoolService.repayWithPermit(
        {
          user,
          reserve,
          amount: convertedAmount,
          numericRateMode,
          deadline,
          permitR: sig.r,
          permitS: sig.s,
          permitV: sig.v,
        },
        txs,
      );
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        populateTransaction.repayWithPermit(
          reserve,
          convertedAmount,
          numericRateMode,
          onBehalfOf ?? user,
          deadline,
          sig.v,
          sig.r,
          sig.s,
        ),
      from: user,
      value: getTxValue(reserve, convertedAmount),
      action: ProtocolAction.repayWithPermit,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.repayWithPermit,
      ),
    });

    return txs;
  }

  @LPValidatorV3
  public async swapBorrowRateMode(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    { user, reserve, interestRateMode, useOptimizedPath }: LPSwapBorrowRateMode,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;

    if (useOptimizedPath) {
      return this.l2PoolService.swapBorrowRateMode({
        user,
        reserve,
        numericRateMode,
      });
    }

    const poolContract: IPool = this.getContractInstance(this.poolAddress);
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        poolContract.populateTransaction.swapBorrowRateMode(
          reserve,
          numericRateMode,
        ),
      from: user,
    });

    return [
      {
        txType: eEthereumTxType.DLP_ACTION,
        tx: txCallback,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @LPValidatorV3
  public async setUsageAsCollateral(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    {
      user,
      reserve,
      usageAsCollateral,
      useOptimizedPath,
    }: LPSetUsageAsCollateral,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const poolContract: IPool = this.getContractInstance(this.poolAddress);

    if (useOptimizedPath) {
      return this.l2PoolService.setUserUseReserveAsCollateral({
        user,
        reserve,
        usageAsCollateral,
      });
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        poolContract.populateTransaction.setUserUseReserveAsCollateral(
          reserve,
          usageAsCollateral,
        ),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @LPValidatorV3
  public async liquidationCall(
    @isBnbAddress('liquidator')
    @isBnbAddress('liquidatedUser')
    @isBnbAddress('debtReserve')
    @isBnbAddress('collateralReserve')
    @isPositiveAmount('purchaseAmount')
    {
      liquidator,
      liquidatedUser,
      debtReserve,
      collateralReserve,
      purchaseAmount,
      getLBToken,
      liquidateAll,
      useOptimizedPath,
    }: LPLiquidationCall,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const { isApproved, approve, decimalsOf }: IERC20ServiceInterface =
      this.erc20Service;

    const approved = await isApproved({
      token: debtReserve,
      user: liquidator,
      spender: this.poolAddress,
      amount: purchaseAmount,
    });

    if (!approved) {
      const approveTx: EthereumTransactionTypeExtended = approve({
        user: liquidator,
        token: debtReserve,
        spender: this.poolAddress,
        amount: DEFAULT_APPROVE_AMOUNT,
      });

      txs.push(approveTx);
    }

    let convertedAmount = constants.MaxUint256.toString();
    if (!liquidateAll) {
      const reserveDecimals = await decimalsOf(debtReserve);
      convertedAmount = valueToWei(purchaseAmount, reserveDecimals);
    }

    if (useOptimizedPath) {
      return this.l2PoolService.liquidationCall(
        {
          liquidator,
          liquidatedUser,
          debtReserve,
          collateralReserve,
          debtToCover: convertedAmount,
          getLBToken,
        },
        txs,
      );
    }

    const poolContract = this.getContractInstance(this.poolAddress);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        poolContract.populateTransaction.liquidationCall(
          collateralReserve,
          debtReserve,
          liquidatedUser,
          convertedAmount,
          getLBToken ?? false,
        ),
      from: liquidator,
      value: getTxValue(debtReserve, convertedAmount),
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.liquidationCall,
      ),
    });

    return txs;
  }

  @LPSwapCollateralValidatorV3
  public async swapCollateral(
    @isBnbAddress('user')
    @isBnbAddress('fromAsset')
    @isBnbAddress('fromLBToken')
    @isBnbAddress('toAsset')
    @isBnbAddress('augustus')
    @isPositiveAmount('fromAmount')
    @isPositiveAmount('minToAmount')
    {
      user,
      flash,
      fromAsset,
      fromLBToken,
      toAsset,
      fromAmount,
      minToAmount,
      permitSignature,
      swapAll,
      referralCode,
      augustus,
      swapCallData,
    }: LPSwapCollateral,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];

    const permitParams = permitSignature ?? {
      amount: '0',
      deadline: '0',
      v: 0,
      r: '0x0000000000000000000000000000000000000000000000000000000000000000',
      s: '0x0000000000000000000000000000000000000000000000000000000000000000',
    };

    const approved: boolean = await this.erc20Service.isApproved({
      token: fromLBToken,
      user,
      spender: this.swapCollateralAddress,
      amount: fromAmount,
    });

    if (!approved) {
      const approveTx: EthereumTransactionTypeExtended =
        this.erc20Service.approve({
          user,
          token: fromLBToken,
          spender: this.swapCollateralAddress,
          amount: constants.MaxUint256.toString(),
        });

      txs.push(approveTx);
    }

    const tokenDecimals: number = await this.erc20Service.decimalsOf(fromAsset);

    const convertedAmount: string = valueToWei(fromAmount, tokenDecimals);

    const tokenToDecimals: number = await this.erc20Service.decimalsOf(toAsset);

    const amountSlippageConverted: string = valueToWei(
      minToAmount,
      tokenToDecimals,
    );

    const poolContract = this.getContractInstance(this.poolAddress);

    if (flash) {
      const params = buildParaSwapLiquiditySwapParams(
        toAsset,
        amountSlippageConverted,
        swapAll
          ? augustusFromAmountOffsetFromCalldata(swapCallData as string)
          : 0,
        swapCallData,
        augustus,
        permitParams.amount,
        permitParams.deadline,
        permitParams.v,
        permitParams.r,
        permitParams.s,
      );

      const amountWithSurplus: string = (
        Number(fromAmount) +
        (Number(fromAmount) * Number(SURPLUS)) / 100
      ).toString();

      const convertedAmountWithSurplus: string = valueToWei(
        amountWithSurplus,
        tokenDecimals,
      );

      const txCallback: () => Promise<transactionType> =
        this.generateTxCallback({
          rawTxMethod: async () =>
            poolContract.populateTransaction.flashLoanSimple(
              this.swapCollateralAddress,
              fromAsset,
              swapAll ? convertedAmountWithSurplus : convertedAmount,
              params,
              referralCode ?? '0',
            ),
          from: user,
          action: ProtocolAction.swapCollateral,
        });

      txs.push({
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation(
          txs,
          txCallback,
          ProtocolAction.swapCollateral,
        ),
      });
      return txs;
    }

    // Direct call to swap and deposit
    const swapAndDepositTx: EthereumTransactionTypeExtended =
      this.liquiditySwapAdapterService.swapAndDeposit(
        {
          user,
          assetToSwapFrom: fromAsset,
          assetToSwapTo: toAsset,
          amountToSwap: convertedAmount,
          minAmountToReceive: amountSlippageConverted,
          swapAll,
          swapCallData,
          augustus,
          permitParams,
        },
        txs,
      );

    txs.push(swapAndDepositTx);
    return txs;
  }

  @LPRepayWithCollateralValidatorV3
  public async paraswapRepayWithCollateral(
    @isBnbAddress('user')
    @isBnbAddress('fromAsset')
    @isBnbAddress('fromLBToken')
    @isBnbAddress('assetToRepay')
    @isPositiveAmount('repayWithAmount')
    @isPositiveAmount('repayAmount')
    @isBnbAddress('augustus')
    {
      user,
      fromAsset,
      fromLBToken,
      assetToRepay,
      repayWithAmount,
      repayAmount,
      permitSignature,
      repayAllDebt,
      rateMode,
      referralCode,
      flash,
      swapAndRepayCallData,
      augustus,
    }: LPParaswapRepayWithCollateral,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];

    const permitParams = permitSignature ?? {
      amount: '0',
      deadline: '0',
      v: 0,
      r: '0x0000000000000000000000000000000000000000000000000000000000000000',
      s: '0x0000000000000000000000000000000000000000000000000000000000000000',
    };

    const approved: boolean = await this.erc20Service.isApproved({
      token: fromLBToken,
      user,
      spender: this.repayWithCollateralAddress,
      amount: repayWithAmount,
    });

    if (!approved) {
      const approveTx: EthereumTransactionTypeExtended =
        this.erc20Service.approve({
          user,
          token: fromLBToken,
          spender: this.repayWithCollateralAddress,
          amount: constants.MaxUint256.toString(),
        });

      txs.push(approveTx);
    }

    const fromDecimals: number = await this.erc20Service.decimalsOf(fromAsset);
    const convertedRepayWithAmount: string = valueToWei(
      repayWithAmount,
      fromDecimals,
    );

    const repayWithAmountWithSurplus: string = (
      Number(repayWithAmount) +
      (Number(repayWithAmount) * Number(SURPLUS)) / 100
    ).toString();

    const convertedRepayWithAmountWithSurplus: string = valueToWei(
      repayWithAmountWithSurplus,
      fromDecimals,
    );

    const decimals: number = await this.erc20Service.decimalsOf(assetToRepay);
    const convertedRepayAmount: string = valueToWei(repayAmount, decimals);

    const numericInterestRate = rateMode === InterestRate.Stable ? 1 : 2;

    if (flash) {
      const callDataEncoded = utils.defaultAbiCoder.encode(
        ['bytes', 'address'],
        [swapAndRepayCallData, augustus],
      );

      const params: string = utils.defaultAbiCoder.encode(
        [
          'address',
          'uint256',
          'uint256',
          'uint256',
          'bytes',
          'uint256',
          'uint256',
          'uint8',
          'bytes32',
          'bytes32',
        ],
        [
          assetToRepay,
          convertedRepayAmount,
          repayAllDebt
            ? augustusToAmountOffsetFromCalldata(swapAndRepayCallData as string)
            : 0,
          numericInterestRate,
          callDataEncoded,
          permitParams.amount,
          permitParams.deadline,
          permitParams.v,
          permitParams.r,
          permitParams.s,
        ],
      );

      const poolContract = this.getContractInstance(this.poolAddress);

      const txCallback: () => Promise<transactionType> =
        this.generateTxCallback({
          rawTxMethod: async () =>
            poolContract.populateTransaction.flashLoanSimple(
              this.repayWithCollateralAddress,
              fromAsset,
              repayAllDebt
                ? convertedRepayWithAmountWithSurplus
                : convertedRepayWithAmount,
              params,
              referralCode ?? '0',
            ),
          from: user,
          action: ProtocolAction.repayCollateral,
        });

      txs.push({
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation(
          txs,
          txCallback,
          ProtocolAction.repayCollateral,
        ),
      });

      return txs;
    }

    const swapAndRepayTx: EthereumTransactionTypeExtended =
      this.paraswapRepayWithCollateralAdapterService.swapAndRepay(
        {
          user,
          collateralAsset: fromAsset,
          debtAsset: assetToRepay,
          collateralAmount: convertedRepayWithAmount,
          debtRepayAmount: convertedRepayAmount,
          debtRateMode: rateMode,
          permitParams,
          repayAll: repayAllDebt ?? false,
          swapAndRepayCallData,
          augustus,
        },
        txs,
      );

    txs.push(swapAndRepayTx);

    return txs;
  }

  @LPFlashLiquidationValidatorV3
  public async flashLiquidation(
    @isBnbAddress('user')
    @isBnbAddress('collateralAsset')
    @isBnbAddress('borrowedAsset')
    @isPositiveAmount('debtTokenCover')
    @isBnbAddress('initiator')
    {
      user,
      collateralAsset,
      borrowedAsset,
      debtTokenCover,
      liquidateAll,
      initiator,
      useEthPath,
    }: LPFlashLiquidation,
  ): Promise<EthereumTransactionTypeExtended[]> {
    const addSurplus = (amount: string): string => {
      return (
        Number(amount) +
        (Number(amount) * Number(amount)) / 100
      ).toString();
    };

    const txs: EthereumTransactionTypeExtended[] = [];

    const poolContract: IPool = this.getContractInstance(this.poolAddress);

    const tokenDecimals: number = await this.erc20Service.decimalsOf(
      borrowedAsset,
    );

    const convertedDebt = valueToWei(debtTokenCover, tokenDecimals);

    const convertedDebtTokenCover: string = liquidateAll
      ? constants.MaxUint256.toString()
      : convertedDebt;

    const flashBorrowAmount = liquidateAll
      ? valueToWei(addSurplus(debtTokenCover), tokenDecimals)
      : convertedDebt;

    const params: string = utils.defaultAbiCoder.encode(
      ['address', 'address', 'address', 'uint256', 'bool'],
      [
        collateralAsset,
        borrowedAsset,
        user,
        convertedDebtTokenCover,
        useEthPath ?? false,
      ],
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        poolContract.populateTransaction.flashLoanSimple(
          this.flashLiquidationAddress,
          borrowedAsset,
          flashBorrowAmount,
          params,
          '0',
        ),
      from: initiator,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.liquidationFlash,
      ),
    });
    return txs;
  }

  @LPValidatorV3
  public async repayWithLBTokens(
    @isBnbAddress('user')
    @isBnbAddress('reserve')
    @isPositiveOrMinusOneAmount('amount')
    {
      user,
      amount,
      reserve,
      rateMode,
      useOptimizedPath,
    }: LPRepayWithLBTokensType,
  ): Promise<EthereumTransactionTypeExtended[]> {
    if (reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()) {
      throw new Error(
        'Can not repay with lbTokens with bnb. Should be WETH instead',
      );
    }

    const txs: EthereumTransactionTypeExtended[] = [];
    const { decimalsOf }: IERC20ServiceInterface = this.erc20Service;

    const poolContract = this.getContractInstance(this.poolAddress);
    const { populateTransaction }: IPool = poolContract;
    const numericRateMode = rateMode === InterestRate.Variable ? 2 : 1;
    const decimals: number = await decimalsOf(reserve);

    const convertedAmount: string =
      amount === '-1'
        ? constants.MaxUint256.toString()
        : valueToWei(amount, decimals);

    if (useOptimizedPath) {
      return this.l2PoolService.repayWithLBTokens(
        {
          user,
          reserve,
          amount: convertedAmount,
          numericRateMode,
        },
        txs,
      );
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        populateTransaction.repayWithLBTokens(
          reserve,
          convertedAmount,
          numericRateMode,
        ),
      from: user,
      value: getTxValue(reserve, convertedAmount),
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.repay,
      ),
    });

    return txs;
  }

  @LPValidatorV3
  public setUserEMode(
    @isBnbAddress('user')
    @is0OrPositiveAmount('categoryId')
    { user, categoryId }: LPSetUserEModeType,
  ): EthereumTransactionTypeExtended[] {
    const poolContract = this.getContractInstance(this.poolAddress);
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        poolContract.populateTransaction.setUserEMode(categoryId),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation(
          [],
          txCallback,
          ProtocolAction.repay,
        ),
      },
    ];
  }

  @LPValidatorV3
  public async migrateV3(
    @isBnbAddress('migrator')
    @isBnbAddress('user')
    @isBnbAddressArray('borrowedAssets')
    {
      migrator,
      borrowedAssets,
      borrowedAmounts,
      interestRatesModes,
      user,
      suppliedPositions,
      borrowedPositions,
      permits,
    }: LPV3MigrationParamsType,
  ): Promise<PopulatedTransaction> {
    const poolContract = this.getContractInstance(this.poolAddress);

    const mappedBorrowedPositions = borrowedPositions.map(borrowPosition => [
      borrowPosition.address,
      borrowPosition.amount,
      borrowPosition.rateMode.toString(),
    ]);

    const mappedPermits = permits.map(
      (permit: IMigrationHelper.PermitInputStruct) => [
        permit.lbToken,
        permit.value,
        permit.deadline,
        permit.v,
        permit.r,
        permit.s,
      ],
    );

    const params: string = utils.defaultAbiCoder.encode(
      [
        'address[]',
        '(address, uint256, uint256)[]',
        '(address, uint256, uint256, uint8, bytes32, bytes32)[]',
      ],
      [suppliedPositions, mappedBorrowedPositions, mappedPermits],
    );

    return poolContract.populateTransaction.flashLoan(
      migrator,
      borrowedAssets,
      borrowedAmounts,
      interestRatesModes,
      user,
      params,
      '0',
    );
  }
}
