import { getPricingModel, getSubscriberDetails, setSubscriberDetails } from '@/services/api';
import { clone } from 'lodash';

const initialState = {
  planlist: [],
  subscriber: {},
  selectedPlan: {},
  planChangeError: '',
  planChangeConfirm: false,
  planDuration: 'yearly',
};
export default {
  namespace: 'plans',
  state: clone(initialState),
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getPricingModel, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *getSubscriber(
      {
        payload: { customerToken },
      },
      { call, put }
    ) {
      const response = yield call(getSubscriberDetails, customerToken);
      yield put({
        type: 'setSubscriber',
        payload: response.data,
      });
    },
    *chooseOnePlan({ payload }, { put }) {
      yield put({
        type: 'setPlan',
        payload,
      });
    },
    *subscribe({ payload }, { call, put }) {
      const response = yield call(setSubscriberDetails, payload);
      const setResponse = {
        type: 'confirmPlanChange',
        payload: response.data,
        isValid: response.result === 'success',
      };

      yield put(setResponse);
    },
    *reset({ put }) {
      yield put({
        type: 'resetPlanData',
      });
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        planlist: action.payload,
        selectedPlan: { ...(action.payload[2] || {}), selectedDuration: 'yearly' },
      };
    },
    confirmPlanChange(state, action) {
      const updateState = {};
      if (!action.isValid) {
        updateState.planChangeError = action.payload.message || 'Something went wrong';
      } else {
        updateState.planChangeConfirm = true;
      }
      return {
        ...state,
        ...updateState,
      };
    },
    setSubscriber(
      state,
      {
        payload: { fullName, customerToken, dot, email },
      }
    ) {
      return {
        ...state,
        subscriber: {
          fullName,
          customerToken,
          dot,
          email,
        },
      };
    },
    setPlan(state, action) {
      return {
        ...state,
        selectedPlan: action.payload,
      };
    },
    resetPlanData(state) {
      return { ...state, ...initialState };
    },
    setPlanDuration(
      state,
      {
        payload: { planDuration },
      }
    ) {
      return {
        ...state,
        planDuration,
      };
    },
  },
};
