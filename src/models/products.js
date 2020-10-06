import { getProductsList, getProductsDetail, getPlanDetails } from '@/services/api';

export default {
  namespace: 'products',

  state: {
    productsList: [],
    productDetail: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(getProductsList);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchOne({ payload }, { call, put }) {
      const response = yield call(getProductsDetail, payload);
      const planResponse = yield call(getPlanDetails, payload);
      yield put({
        type: 'saveOne',
        payload: {
          product: response,
          plan: planResponse,
        },
      });
    },
  },

  reducers: {
    save(state, action) {
      const lists = action.payload.data.map(list => {
        if (list.plans.length > 0) {
          let defaultPlan = {};
          // Filter valid plans for lte device
          if (list.device_type === 'lte') {
            for (let i = 0; i < list.plans.length; i += 1) {
              if (list.plans[i].plan_id === 'dummy') {
                defaultPlan = { ...list.plans[i] };
              }
            }
            return { ...list, defaultPlan, plans: [defaultPlan] };
          }

          // Filter valid plans for bluetooth device
          if (list.device_type === 'bluetooth') {
            const planIds = [
              'dummy'
            ];
            const plans = [];
            for (let i = 0; i < list.plans.length; i += 1) {
              if (planIds.includes(list.plans[i].plan_id)) {
                if (list.plans[i].plan_id === 'dummy') {
                  defaultPlan = { ...list.plans[i] };
                }
                plans.push(list.plans[i]);
              }
            }

            return { ...list, defaultPlan, plans };
          }

          let minPrice = 1000000;
          for (let i = 0; i < list.plans.length; i += 1) {
            if (list.plans[i].period === 'monthly') {
              if (list.plans[i].price < minPrice) {
                defaultPlan = { ...list.plans[i] };
                minPrice = list.plans[i].price;
              }
            } else if (list.plans[i].period === 'quarterly') {
              if (list.plans[i].price / 3 < minPrice) {
                defaultPlan = { ...list.plans[i] };
                minPrice = list.plans[i].price / 3;
              }
            } else if (list.plans[i].period === 'yearly') {
              if (list.plans[i].price / 12 < minPrice) {
                defaultPlan = { ...list.plans[i] };
                minPrice = list.plans[i].price / 12;
              }
            }
          }
          return { ...list, defaultPlan };
        }
        return { ...list, defaultPlan: {} };
      });

      return {
        ...state,
        productsList: lists,
      };
    },

    clearProductDetail(state) {
      return {
        ...state,
        productDetail: {},
      };
    },

    saveOne(state, action) {
      return {
        ...state,
        productDetail: {
          product: action.payload,
          // plans: action.payload.plans
        },
      };
    },
  },
};
