export default {
  namespace: 'cart',

  state: {
    cartVisible: false,
    showCartButton: true,
    totalInCart: 0,
    cartItems: [],
    hasRestored: false,
  },

  effects: {
    *addToCart({ payload }, { put, select }) {
      yield put({
        type: 'addCart',
        payload,
      });
      const cartItems = yield select(state => state.cart.cartItems);
      const totalInCart = yield select(state => state.cart.totalInCart);
      try {
        localStorage.setItem(
          'cartItems',
          JSON.stringify({
            cartItems,
            totalInCart,
          })
        );
      } catch (error) {
        return error;
      }
      return null;
    },

    *update({ payload }, { put, select }) {
      yield put({
        type: 'updateCart',
        payload,
      });
      const cartItems = yield select(state => state.cart.cartItems);
      const totalInCart = yield select(state => state.cart.totalInCart);
      try {
        localStorage.setItem(
          'cartItems',
          JSON.stringify({
            cartItems,
            totalInCart,
          })
        );
      } catch (error) {
        return error;
      }
      return null;
    },

    *delete({ payload }, { put, select }) {
      yield put({
        type: 'deleteItem',
        payload,
      });
      const cartItems = yield select(state => state.cart.cartItems);
      const totalInCart = yield select(state => state.cart.totalInCart);
      try {
        localStorage.setItem(
          'cartItems',
          JSON.stringify({
            cartItems,
            totalInCart,
          })
        );
      } catch (error) {
        return error;
      }
      return null;
    },
  },

  reducers: {
    // Toggle the cart display
    toggleCart(state, { payload }) {
      return {
        ...state,
        cartVisible: payload,
      };
    },

    // Toggle the cart button on the nav bar
    toggleCartButton(state, { payload }) {
      return {
        ...state,
        showCartButton: payload,
      };
    },

    // Add items to the cart
    addCart(state, { payload }) {
      let flag = false;
      // Combine same item in the cart
      let newItems = state.cartItems.map(item => {
        if (item.device_type === payload.product.device_type) {
          flag = true;
        }
        return item.device_type === payload.product.device_type
          ? {
              ...item,
              quantity: item.quantity + payload.numAdded,
              subscription_type: payload.product.subscription_type,
              selectedPlan: payload.product.selectedPlan,
            }
          : item;
      });
      if (!flag) {
        newItems = newItems.concat({
          ...payload.product,
          extras: [],
        });
      }
      return {
        ...state,
        totalInCart: state.totalInCart + payload.numAdded,
        cartItems: newItems,
      };
    },

    restoreCartItems(state, { payload }) {
      if (payload.isACH) {
        let newItems = [];
        let count = 0;
        if (payload.data.cart_item.length > 0) {
          newItems = payload.data.cart_item.map(item => {
            count += item.quantity;
            const selectedPlan = {
              plan_id: item.plan_id,
              period: item.period,
              plan_name: item.plan_name,
              onetime_charge: item.onetime_charge,
              price: item.price,
              discount: item.discount,
            };
            return {
              ...item,
              selectedPlan,
            };
          });
        }
        return {
          ...state,
          cartItems: newItems,
          totalInCart: count,
        };
      }
      return {
        ...state,
        hasRestored: true,
        totalInCart: payload.totalInCart,
        cartItems: payload.cartItems,
      };
    },

    updateCart(state, { payload }) {
      const newItems = state.cartItems.map(item => {
        if (item.device_type === payload.product.device_type) {
          let newExtras = [];
          if (payload.extras.length > 0) {
            newExtras = item.extras.concat(payload.extras);
            for (let i = 0; i < newExtras.length; i += 1) {
              for (let j = i + 1; j < newExtras.length; j += 1) {
                if (i >= newExtras.length || j >= newExtras.length) break;
                if (newExtras[i].id === newExtras[j].id) {
                  newExtras[i].quantity += newExtras[j].quantity;
                  newExtras.splice(j, 1);
                }
              }
            }
          } else {
            newExtras = [...item.extras];
          }
          return {
            ...item,
            quantity: item.quantity + payload.quantity,
            extras: newExtras,
          };
        }
        return item;
      });
      return {
        ...state,
        totalInCart: state.totalInCart + payload.quantity,
        cartItems: newItems,
      };
    },

    // Remove item from the cart
    deleteItem(state, { payload }) {
      return {
        ...state,
        totalInCart: state.totalInCart - payload.quantity,
        cartItems: state.cartItems.filter(item => item.device_type !== payload.device_type),
      };
    },

    clearAllItems(state) {
      return {
        ...state,
        cartItems: [],
        totalInCart: 0,
      };
    },
  },
};
