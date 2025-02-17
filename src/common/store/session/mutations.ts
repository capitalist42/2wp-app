import { MutationTree } from 'vuex';
import Web3 from 'web3';
import * as constants from '@/common/store/constants';
import { WeiBig } from '@/common/types';
import { TransactionType, SessionState } from '@/common/types/session';
import { getClearSessionState } from '@/common/utils';

export const mutations: MutationTree<SessionState> = {
  [constants.SESSION_SET_ACCOUNT]: (state, account: string) => {
    state.account = account;
  },
  [constants.SESSION_SET_WEB3_INSTANCE]: (state, web3Instance: Web3) => {
    state.web3 = web3Instance;
  },
  [constants.SESSION_IS_ENABLED]: (state, flag: boolean) => {
    state.enabled = flag;
  },
  [constants.SESSION_SET_RLOGIN]: (state, rLogin) => {
    state.rLogin = rLogin;
  },
  [constants.SESSION_SET_RLOGIN_INSTANCE]: (state, rLoginInstance) => {
    state.rLoginInstance = rLoginInstance;
  },
  [constants.SESSION_CLOSE_RLOGIN]: async (state) => {
    // eslint-disable-next-line no-unused-expressions
    await state.rLogin?.disconnect();
  },
  [constants.SESSION_SET_TX_TYPE]: (state, txType: TransactionType) => {
    state.txType = txType;
  },
  [constants.WEB3_SESSION_SET_BALANCE]: (state, balance: WeiBig) => {
    state.balance = balance;
  },
  [constants.SESSION_SET_BTC_ACCOUNT]: (state, btcDerivedAddress: string) => {
    state.btcDerivedAddress = btcDerivedAddress;
  },
  [constants.SESSION_SET_BITCOIN_PRICE]: (state, bitcoinPrice) => {
    state.bitcoinPrice = bitcoinPrice;
  },
  [constants.SESSION_CLEAR_STATE]: async (state) => {
    await state.rLogin?.disconnect();
    const clearState = getClearSessionState();
    clearState.rLoginInstance = state.rLoginInstance;
    Object.assign(state, clearState);
  },
};
