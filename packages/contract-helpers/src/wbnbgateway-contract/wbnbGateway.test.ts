import { BigNumber, constants, providers, utils } from 'ethers';
import {
  eEthereumTxType,
  GasType,
  InterestRate,
  transactionType,
} from '../commons/types';
import { valueToWei } from '../commons/utils';
import { ERC20Service } from '../erc20-contract';
import { WBNBGatewayService } from './index';

jest.mock('../commons/gasStation', () => {
  return {
    __esModule: true,
    estimateGasByNetwork: jest
      .fn()
      .mockImplementation(async () => Promise.resolve(BigNumber.from(1))),
    estimateGas: jest.fn(async () => Promise.resolve(BigNumber.from(1))),
  };
});

describe('WethGatewayService', () => {
  const wbnbGatewayAddress = '0x0000000000000000000000000000000000000001';
  const lendingPool = '0x0000000000000000000000000000000000000002';
  describe('Initialization', () => {
    const provider: providers.Provider = new providers.JsonRpcProvider();
    const erc20Service = new ERC20Service(provider);
    it('Expects to be initialized', () => {
      expect(
        () =>
          new WBNBGatewayService(provider, erc20Service, wbnbGatewayAddress),
      ).not.toThrow();
    });
    it('Expects to initialize without wethgateway address', () => {
      expect(
        () => new WBNBGatewayService(provider, erc20Service),
      ).not.toThrow();
    });
  });
  describe('generateDepositEthTxData', () => {
    it('generates depositBNB tx data', () => {
      const provider: providers.Provider = new providers.JsonRpcProvider();
      const erc20Service = new ERC20Service(provider);
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const user = '0x0000000000000000000000000000000000000003';
      const txData = wbnb.generateDepositEthTxData({
        lendingPool,
        user,
        amount: '1',
      });

      expect(txData.to).toEqual(wbnbGatewayAddress);
      expect(txData.from).toEqual(user);
      expect(txData.data).toEqual(
        '0x474cf53d000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000',
      );

      const onBehalfOf = '0x0000000000000000000000000000000000000004';

      const txDataUpdatedParams = wbnb.generateDepositEthTxData({
        lendingPool,
        user,
        amount: '1',
        onBehalfOf,
        referralCode: '0',
      });

      expect(txDataUpdatedParams.to).toEqual(wbnbGatewayAddress);
      expect(txDataUpdatedParams.from).toEqual(user);
      expect(txDataUpdatedParams.data).toEqual(
        '0x474cf53d000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000',
      );
    });
  });
  describe('generateBorrowEthTxData', () => {
    it('generates borrowBNB tx data', async () => {
      const provider: providers.Provider = new providers.JsonRpcProvider();
      const erc20Service = new ERC20Service(provider);
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const user = '0x0000000000000000000000000000000000000003';
      const txData = wbnb.generateBorrowEthTxData({
        lendingPool,
        user,
        amount: '1',
        interestRateMode: InterestRate.Variable,
        referralCode: '0',
      });

      expect(txData.to).toEqual(wbnbGatewayAddress);
      expect(txData.from).toEqual(user);
      expect(txData.data).toEqual(
        '0x66514c970000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000',
      );

      const txDataStable = wbnb.generateBorrowEthTxData({
        lendingPool,
        user,
        amount: '1',
        interestRateMode: InterestRate.Stable,
        debtTokenAddress: '',
      });

      expect(txDataStable.data).toEqual(
        '0x66514c970000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000',
      );
    });
  });
  describe('depositBNB', () => {
    const user = '0x0000000000000000000000000000000000000003';
    const onBehalfOf = '0x0000000000000000000000000000000000000004';
    const amount = '123.456';
    const referralCode = '0';
    const provider: providers.Provider = new providers.JsonRpcProvider();
    jest
      .spyOn(provider, 'getGasPrice')
      .mockImplementation(async () => Promise.resolve(BigNumber.from(1)));
    const erc20Service = new ERC20Service(provider);
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Expects the deposit tx object to be correct with all params', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const txObj = wbnb.depositBNB({
        lendingPool,
        user,
        amount,
        onBehalfOf,
        referralCode,
      });
      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'address', 'uint16'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(onBehalfOf);
      expect(decoded[2]).toEqual(Number(referralCode));

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the deposit tx object to be correct without onBehalfOf', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const txObj = wbnb.depositBNB({
        lendingPool,
        user,
        amount,
        referralCode,
      });
      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'address', 'uint16'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(user);
      expect(decoded[2]).toEqual(Number(referralCode));

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the deposit tx object to be correct without referralCode', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const txObj = wbnb.depositBNB({
        lendingPool,
        user,
        amount,
      });
      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'address', 'uint16'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(user);
      expect(decoded[2]).toEqual(0);

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects to fail when initialized without gateway address', () => {
      const wbnb = new WBNBGatewayService(provider, erc20Service);

      const txObj = wbnb.depositBNB({
        lendingPool,
        user,
        amount,
      });

      expect(txObj.length).toEqual(0);
    });
    it('Expects to fail when user is not address', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const user = 'asdf';
      expect(() =>
        wbnb.depositBNB({
          lendingPool,
          user,
          amount,
          onBehalfOf,
          referralCode,
        }),
      ).toThrowError(`Address: ${user} is not a valid ethereum Address`);
    });
    it('Expects to fail when lendingPool is not address', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const lendingPool = 'asdf';
      expect(() =>
        wbnb.depositBNB({
          lendingPool,
          user,
          amount,
          onBehalfOf,
          referralCode,
        }),
      ).toThrowError(`Address: ${lendingPool} is not a valid ethereum Address`);
    });
    it('Expects to fail when amount is not positive', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const amount = '0';
      expect(() =>
        wbnb.depositBNB({
          lendingPool,
          user,
          amount,
          onBehalfOf,
          referralCode,
        }),
      ).toThrowError(`Amount: ${amount} needs to be greater than 0`);
    });
    it('Expects to fail when amount is not number', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const amount = 'asdf';
      expect(() =>
        wbnb.depositBNB({
          lendingPool,
          user,
          amount,
          onBehalfOf,
          referralCode,
        }),
      ).toThrowError(`Amount: ${amount} needs to be greater than 0`);
    });
    it('Expects to fail when onBehalfOf is not address', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const onBehalfOf = 'asdf';
      expect(() =>
        wbnb.depositBNB({
          lendingPool,
          user,
          amount,
          onBehalfOf,
          referralCode,
        }),
      ).toThrowError(`Address: ${onBehalfOf} is not a valid ethereum Address`);
    });
    it('Expects to fail when referral is not number', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const referralCode = 'asdf';
      expect(() =>
        wbnb.depositBNB({
          lendingPool,
          user,
          amount,
          onBehalfOf,
          referralCode,
        }),
      ).toThrowError(
        `Amount: ${referralCode} needs to be greater or equal than 0`,
      );
    });
  });
  describe('withdrawBNB', () => {
    const user = '0x0000000000000000000000000000000000000003';
    const debtTokenAddress = '0x0000000000000000000000000000000000000005';
    const interestRateMode = InterestRate.Stable;
    const amount = '123.456';
    const referralCode = '0';
    const provider: providers.Provider = new providers.JsonRpcProvider();
    jest
      .spyOn(provider, 'getGasPrice')
      .mockImplementation(async () => Promise.resolve(BigNumber.from(1)));
    const erc20Service = new ERC20Service(provider);

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('Expects the borrow tx object to be correct with all params and variable stable rate without approval', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );

      const isApprovedSpy = jest
        .spyOn(wbnb.baseDebtTokenService, 'isDelegationApproved')
        .mockImplementation(async () => Promise.resolve(false));

      const approveSpy = jest
        .spyOn(wbnb.baseDebtTokenService, 'approveDelegation')
        .mockImplementation(() => ({
          txType: eEthereumTxType.ERC20_APPROVAL,
          tx: async () => ({}),
          gas: async () => ({
            gasLimit: '1',
            gasPrice: '1',
          }),
        }));
      const interestRateMode = InterestRate.Variable;
      const txObj = await wbnb.borrowBNB({
        lendingPool,
        user,
        amount,
        debtTokenAddress,
        interestRateMode,
        referralCode,
      });

      await expect(async () =>
        wbnb.borrowBNB({
          lendingPool,
          user,
          amount,
          interestRateMode,
          referralCode,
        }),
      ).rejects.toThrowError(
        `To borrow ETH you need to pass the stable or variable WBNB debt Token Address corresponding the interestRateMode`,
      );

      expect(isApprovedSpy).toHaveBeenCalled();
      expect(approveSpy).toHaveBeenCalled();
      expect(txObj.length).toEqual(2);
      expect(txObj[1].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[1].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'uint16'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(BigNumber.from(2));
      expect(decoded[3]).toEqual(Number(referralCode));

      // gas price
      const gasPrice: GasType | null = await txObj[1].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('450000');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the borrow tx object to be correct with all params and stable stable rate already approved', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );

      const isApprovedSpy = jest
        .spyOn(wbnb.baseDebtTokenService, 'isDelegationApproved')
        .mockImplementation(async () => Promise.resolve(true));

      const txObj = await wbnb.borrowBNB({
        lendingPool,
        user,
        amount,
        debtTokenAddress,
        interestRateMode,
        referralCode,
      });

      expect(isApprovedSpy).toHaveBeenCalled();
      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'uint16'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(BigNumber.from(1));
      expect(decoded[3]).toEqual(Number(referralCode));

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the borrow tx object to be correct with all params and none stable rate', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );

      const isApprovedSpy = jest
        .spyOn(wbnb.baseDebtTokenService, 'isDelegationApproved')
        .mockImplementation(async () => Promise.resolve(true));

      const interestRateMode = InterestRate.None;
      const txObj = await wbnb.borrowBNB({
        lendingPool,
        user,
        amount,
        debtTokenAddress,
        interestRateMode,
        referralCode,
      });

      expect(isApprovedSpy).toHaveBeenCalled();
      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'uint16'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(BigNumber.from(1));
      expect(decoded[3]).toEqual(Number(referralCode));

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the borrow tx object to be correct without referralCode', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );

      const isApprovedSpy = jest
        .spyOn(wbnb.baseDebtTokenService, 'isDelegationApproved')
        .mockImplementation(async () => Promise.resolve(true));

      const interestRateMode = InterestRate.None;
      const txObj = await wbnb.borrowBNB({
        lendingPool,
        user,
        amount,
        debtTokenAddress,
        interestRateMode,
      });

      expect(isApprovedSpy).toHaveBeenCalled();
      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'uint16'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(BigNumber.from(1));
      expect(decoded[3]).toEqual(0);

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects to fail when initialized without gateway address', async () => {
      const wbnb = new WBNBGatewayService(provider, erc20Service);

      const txObj = await wbnb.borrowBNB({
        lendingPool,
        user,
        amount,
        debtTokenAddress,
        interestRateMode,
        referralCode,
      });

      expect(txObj.length).toEqual(0);
    });
    it('Expects to fail when user is not address', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const user = 'asdf';
      await expect(async () =>
        wbnb.borrowBNB({
          lendingPool,
          user,
          amount,
          debtTokenAddress,
          interestRateMode,
          referralCode,
        }),
      ).rejects.toThrowError(
        `Address: ${user} is not a valid ethereum Address`,
      );
    });
    it('Expects to fail when lendingPool is not address', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const lendingPool = 'asdf';
      await expect(async () =>
        wbnb.borrowBNB({
          lendingPool,
          user,
          amount,
          debtTokenAddress,
          interestRateMode,
          referralCode,
        }),
      ).rejects.toThrowError(
        `Address: ${lendingPool} is not a valid ethereum Address`,
      );
    });
    it('Expects to fail when amount is not positive', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const amount = '0';
      await expect(async () =>
        wbnb.borrowBNB({
          lendingPool,
          user,
          amount,
          debtTokenAddress,
          interestRateMode,
          referralCode,
        }),
      ).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
    });
    it('Expects to fail when amount is not number', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const amount = 'asdf';
      await expect(async () =>
        wbnb.borrowBNB({
          lendingPool,
          user,
          amount,
          debtTokenAddress,
          interestRateMode,
          referralCode,
        }),
      ).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
    });
    it('Expects to fail when debtTokenAddress is not address', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const debtTokenAddress = 'asdf';
      await expect(async () =>
        wbnb.borrowBNB({
          lendingPool,
          user,
          amount,
          debtTokenAddress,
          interestRateMode,
          referralCode,
        }),
      ).rejects.toThrowError(
        `Address: ${debtTokenAddress} is not a valid ethereum Address`,
      );
    });
    it('Expects to fail when referral is not number', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const referralCode = 'asdf';
      await expect(async () =>
        wbnb.borrowBNB({
          lendingPool,
          user,
          amount,
          debtTokenAddress,
          interestRateMode,
          referralCode,
        }),
      ).rejects.toThrowError(
        `Amount: ${referralCode} needs to be greater or equal than 0`,
      );
    });
  });
  describe('repayBNB', () => {
    const user = '0x0000000000000000000000000000000000000003';
    const onBehalfOf = '0x0000000000000000000000000000000000000004';
    const lbTokenAddress = '0x0000000000000000000000000000000000000005';
    const amount = '123.456';
    const provider: providers.Provider = new providers.JsonRpcProvider();
    jest
      .spyOn(provider, 'getGasPrice')
      .mockImplementation(async () => Promise.resolve(BigNumber.from(1)));
    const erc20Service = new ERC20Service(provider);

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('Expects the withdraw tx object to be correct with all params and not approved', async () => {
      const isApprovedSpy = jest
        .spyOn(erc20Service, 'isApproved')
        .mockImplementation(async () => Promise.resolve(false));
      const approveSpy = jest
        .spyOn(erc20Service, 'approve')
        .mockImplementation(() => ({
          txType: eEthereumTxType.ERC20_APPROVAL,
          tx: async () => ({}),
          gas: async () => ({
            gasLimit: '1',
            gasPrice: '1',
          }),
        }));

      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const txObj = await wbnb.withdrawBNB({
        lendingPool,
        user,
        amount,
        onBehalfOf,
        lbTokenAddress,
      });

      expect(isApprovedSpy).toHaveBeenCalled();
      expect(approveSpy).toHaveBeenCalled();
      expect(txObj.length).toEqual(2);
      expect(txObj[1].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[1].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'address'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(onBehalfOf);

      // gas price
      const gasPrice: GasType | null = await txObj[1].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('640000');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the withdraw tx object to be correct with all params and amount -1 and approved', async () => {
      const isApprovedSpy = jest
        .spyOn(erc20Service, 'isApproved')
        .mockImplementation(async () => Promise.resolve(true));

      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const amount = '-1';
      const txObj = await wbnb.withdrawBNB({
        lendingPool,
        user,
        amount,
        onBehalfOf,
        lbTokenAddress,
      });

      expect(isApprovedSpy).toHaveBeenCalled();
      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'address'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(constants.MaxUint256);
      expect(decoded[2]).toEqual(onBehalfOf);

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the withdraw tx object to be correct without onBehalfOf', async () => {
      const isApprovedSpy = jest
        .spyOn(erc20Service, 'isApproved')
        .mockImplementation(async () => Promise.resolve(true));

      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );

      const txObj = await wbnb.withdrawBNB({
        lendingPool,
        user,
        amount,
        lbTokenAddress,
      });

      expect(isApprovedSpy).toHaveBeenCalled();
      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'address'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(user);

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects to fail when initialized without gateway address', async () => {
      const wbnb = new WBNBGatewayService(provider, erc20Service);

      const txObj = await wbnb.withdrawBNB({
        lendingPool,
        user,
        amount,
        lbTokenAddress,
      });

      expect(txObj.length).toEqual(0);
    });
    it('Expects to fail when user is not address', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const user = 'asdf';
      await expect(async () =>
        wbnb.withdrawBNB({
          lendingPool,
          user,
          amount,
          lbTokenAddress,
        }),
      ).rejects.toThrowError(
        `Address: ${user} is not a valid ethereum Address`,
      );
    });
    it('Expects to fail when lendingPool is not address', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const lendingPool = 'asdf';
      await expect(async () =>
        wbnb.withdrawBNB({
          lendingPool,
          user,
          amount,
          lbTokenAddress,
        }),
      ).rejects.toThrowError(
        `Address: ${lendingPool} is not a valid ethereum Address`,
      );
    });
    it('Expects to fail when amount is not positive', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const amount = '0';
      await expect(async () =>
        wbnb.withdrawBNB({
          lendingPool,
          user,
          amount,
          lbTokenAddress,
        }),
      ).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
    });
    it('Expects to fail when amount is not number', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const amount = 'asdf';
      await expect(async () =>
        wbnb.withdrawBNB({
          lendingPool,
          user,
          amount,
          lbTokenAddress,
        }),
      ).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
    });
    it('Expects to fail when lbTokenAddress is not address', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const lbTokenAddress = 'asdf';
      await expect(async () =>
        wbnb.withdrawBNB({
          lendingPool,
          user,
          amount,
          lbTokenAddress,
        }),
      ).rejects.toThrowError(
        `Address: ${lbTokenAddress} is not a valid ethereum Address`,
      );
    });
    it('Expects to fail when onBehalfOf is not address', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const onBehalfOf = 'asdf';
      await expect(async () =>
        wbnb.withdrawBNB({
          lendingPool,
          user,
          amount,
          lbTokenAddress,
          onBehalfOf,
        }),
      ).rejects.toThrowError(
        `Address: ${onBehalfOf} is not a valid ethereum Address`,
      );
    });
  });
  describe('borrowBNB', () => {
    const user = '0x0000000000000000000000000000000000000003';
    const onBehalfOf = '0x0000000000000000000000000000000000000004';
    const interestRateMode = InterestRate.Stable;
    const amount = '123.456';
    const provider: providers.Provider = new providers.JsonRpcProvider();
    jest
      .spyOn(provider, 'getGasPrice')
      .mockImplementation(async () => Promise.resolve(BigNumber.from(1)));
    const erc20Service = new ERC20Service(provider);

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('Expects the repay tx object to be correct with all params and stable rate mode', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );

      const txObj = wbnb.repayBNB({
        lendingPool,
        user,
        amount,
        interestRateMode,
        onBehalfOf,
      });

      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(BigNumber.from(1));
      expect(decoded[3]).toEqual(onBehalfOf);

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the repay tx object to be correct with all params and variable rate mode', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const interestRateMode = InterestRate.Variable;
      const txObj = wbnb.repayBNB({
        lendingPool,
        user,
        amount,
        interestRateMode,
        onBehalfOf,
      });

      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(BigNumber.from(2));
      expect(decoded[3]).toEqual(onBehalfOf);

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the repay tx object to be correct with all params and none rate mode', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const interestRateMode = InterestRate.None;
      const txObj = wbnb.repayBNB({
        lendingPool,
        user,
        amount,
        interestRateMode,
        onBehalfOf,
      });

      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(BigNumber.from(1));
      expect(decoded[3]).toEqual(onBehalfOf);

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects the repay tx object to be correct without onBehalfOf', async () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );

      const txObj = wbnb.repayBNB({
        lendingPool,
        user,
        amount,
        interestRateMode,
      });

      expect(txObj.length).toEqual(1);
      expect(txObj[0].txType).toEqual(eEthereumTxType.DLP_ACTION);

      const tx: transactionType = await txObj[0].tx();
      expect(tx.to).toEqual(wbnbGatewayAddress);
      expect(tx.from).toEqual(user);
      expect(tx.gasLimit).toEqual(BigNumber.from(1));

      const decoded = utils.defaultAbiCoder.decode(
        ['address', 'uint256', 'uint256', 'address'],
        utils.hexDataSlice(tx.data ?? '', 4),
      );

      expect(decoded[0]).toEqual(lendingPool);
      expect(decoded[1]).toEqual(BigNumber.from(valueToWei(amount, 18)));
      expect(decoded[2]).toEqual(BigNumber.from(1));
      expect(decoded[3]).toEqual(user);

      // gas price
      const gasPrice: GasType | null = await txObj[0].gas();
      expect(gasPrice).not.toBeNull();
      expect(gasPrice?.gasLimit).toEqual('1');
      expect(gasPrice?.gasPrice).toEqual('1');
    });
    it('Expects to fail when initialized without gateway address', () => {
      const wbnb = new WBNBGatewayService(provider, erc20Service);

      const txObj = wbnb.repayBNB({
        lendingPool,
        user,
        amount,
        interestRateMode,
      });

      expect(txObj.length).toEqual(0);
    });
    it('Expects to fail when user is not address', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const user = 'asdf';
      expect(() =>
        wbnb.repayBNB({
          lendingPool,
          user,
          amount,
          interestRateMode,
        }),
      ).toThrowError(`Address: ${user} is not a valid ethereum Address`);
    });
    it('Expects to fail when lendingPool is not address', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const lendingPool = 'asdf';
      expect(() =>
        wbnb.repayBNB({
          lendingPool,
          user,
          amount,
          interestRateMode,
        }),
      ).toThrowError(`Address: ${lendingPool} is not a valid ethereum Address`);
    });
    it('Expects to fail when amount is not positive', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const amount = '0';
      expect(() =>
        wbnb.repayBNB({
          lendingPool,
          user,
          amount,
          interestRateMode,
        }),
      ).toThrowError(`Amount: ${amount} needs to be greater than 0`);
    });
    it('Expects to fail when amount is not number', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const amount = 'asdf';
      expect(() =>
        wbnb.repayBNB({
          lendingPool,
          user,
          amount,
          interestRateMode,
        }),
      ).toThrowError(`Amount: ${amount} needs to be greater than 0`);
    });
    it('Expects to fail when onBehalfOf is not address', () => {
      const wbnb = new WBNBGatewayService(
        provider,
        erc20Service,
        wbnbGatewayAddress,
      );
      const onBehalfOf = 'asdf';
      expect(() =>
        wbnb.repayBNB({
          lendingPool,
          user,
          amount,
          interestRateMode,
          onBehalfOf,
        }),
      ).toThrowError(`Address: ${onBehalfOf} is not a valid ethereum Address`);
    });
  });
});
