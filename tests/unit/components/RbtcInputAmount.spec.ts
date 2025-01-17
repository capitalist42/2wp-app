import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';
import Vuetify from 'vuetify';
import {
  PegOutTxState, RootState, SatoshiBig, SessionState,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { pegOutTx } from '@/pegout/store/pegoutTx';
import WeiBig from '@/common/types/WeiBig';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { EnvironmentContext } from '@/common/providers/types';
import RbtcInputAmount from '../../../src/pegout/components/RbtcInputAmount.vue';

const localVue = createLocalVue();
let vuetify:any;
let store: Store<RootState>;
let state:PegOutTxState;
let sessionState: SessionState;

describe('RbtcInputAmount', () => {
  const defaultEnvironmentVariables = {
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  };
  let environmentContext: EnvironmentContext;
  beforeEach(() => {
    vuetify = new Vuetify();
    EnvironmentAccessorService.initializeEnvironmentVariables(defaultEnvironmentVariables);
    environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    localVue.use(Vuex);
    state = {
      amountToTransfer: new WeiBig(0, 'wei'),
      validAmount: false,
      calculatedFee: new WeiBig('30000', 'wei'),
      pegoutConfiguration: {
        minValue: new WeiBig('50000000', 'gwei'),
        maxValue: new WeiBig('1', 'rbtc'),
        bridgeContractAddress: '',
      },
      selectedFee: constants.BITCOIN_AVERAGE_FEE_LEVEL,
      estimatedBTCToRecieve: new SatoshiBig(0.00400000, 'btc'),
      gas: 20000,
      bitcoinPrice: 40537,
      btcEstimatedFee: new SatoshiBig(0, 'satoshi'),
    };
    sessionState = {
      account: '0xb3801eA8451ff89a081A0291A135dDdaB6786536',
      btcDerivedAddress: '',
      balance: new WeiBig('0.5', 'rbtc'),
      enabled: false,
      txType: 'PEG_OUT_TRANSACTION_TYPE',
      bitcoinPrice: 0,
    };

    const { getters, actions, mutations } = pegOutTx;
    store = new Vuex.Store({
      modules: {
        pegOutTx: {
          state,
          getters,
          actions,
          mutations,
          namespaced: true,
        },
        web3Session: {
          state: sessionState,
          namespaced: true,
        },
      },
    });
  });
  it('should show a message when the input value is below the minimum', async () => {
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '0.0009',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual(`The minimum accepted value is ${state.pegoutConfiguration.minValue.toRBTCTrimmedString()} ${environmentContext.getRbtcTicker()}`);
  });
  it('should show a message when the input value is above the maximum', async () => {
    sessionState.balance = new WeiBig('2.5', 'rbtc');
    const { getters, actions, mutations } = pegOutTx;
    store = new Vuex.Store({
      modules: {
        pegOutTx: {
          state,
          getters,
          actions,
          mutations,
          namespaced: true,
        },
        web3Session: {
          state: sessionState,
          namespaced: true,
        },
      },
    });
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '2.1',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual(`The maximum accepted value is ${state.pegoutConfiguration.maxValue.toRBTCTrimmedString()} ${environmentContext.getRbtcTicker()}`);
  });
  it('should show a message when the user balance + fee are not enough', async () => {
    sessionState.balance = new WeiBig('2', 'rbtc');
    const { getters, actions, mutations } = pegOutTx;
    store = new Vuex.Store({
      modules: {
        pegOutTx: {
          state,
          getters,
          actions,
          mutations,
          namespaced: true,
        },
        web3Session: {
          state: sessionState,
          namespaced: true,
        },
      },
    });
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '2',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual('You don\'t have the balance for this amount');
  });
  it('should not show any message when the input amount are between the balance and bounds', async () => {
    sessionState.balance = new WeiBig('4', 'rbtc');
    const { getters, actions, mutations } = pegOutTx;
    store = new Vuex.Store({
      modules: {
        pegOutTx: {
          state,
          getters,
          actions,
          mutations,
          namespaced: true,
        },
        web3Session: {
          state: sessionState,
          namespaced: true,
        },
      },
    });
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '0.5',
    });
    expect(wrapper.find('#rbtc-error-msg').exists()).toBeFalsy();
  });
  it('should show a message when the input amount are 0', async () => {
    const wrapper = shallowMount(RbtcInputAmount, {
      store,
      localVue,
      vuetify,
    });
    await wrapper.setData({
      rbtcAmount: '0',
    });
    expect(wrapper.find('#rbtc-error-msg')
      .text())
      .toEqual('Please, enter an amount');
  });
});
