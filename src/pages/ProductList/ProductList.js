import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { AsyncLoadBizCharts } from '@/components/Charts/AsyncLoadBizCharts';
import { connect } from 'dva';
import ProductCard from '@/components/ProductCard';
import ConfirmModal from '@/components/ConfirmModal';
import CartDrawer from '@/components/CartDrawer';
import styles from './ProductList.less';
import { oneTimeLTECharge } from '@/utils/constants';

@connect(({ cart, products, user, plans }) => ({
  cart,
  products,
  user,
  plans,
}))
class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      productAdded: {},
    };
    const { dispatch } = this.props;
    dispatch({
      type: 'products/fetch',
    });
  }

  componentDidMount() {
    const {
      dispatch,
      cart: { hasRestored },
      user: { currentUser },
    } = this.props;

    // Show the cart on the header
    dispatch({
      type: 'cart/toggleCartButton',
      payload: true,
    });
    if (Object.keys(currentUser).length === 0 && process.env.NODE_ENV === 'production') {
      window.drift.load(DRIFT_CHAT_KEY);
      window.drift.show();
    }

    if (!hasRestored) {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems'));
        if (cartItems !== null) {
          dispatch({
            type: 'cart/restoreCartItems',
            payload: {
              cartItems: cartItems.cartItems,
              totalInCart: cartItems.totalInCart,
              isACH: false,
            },
          });
        }
      } catch (err) {
        return undefined;
      }
    }
    return 0;
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'cart/toggleCart',
      payload: false,
    });
    window.drift.hide();
  }

  renderProductsList = () => {
    const {
      products: { productsList },
    } = this.props;
    const list = [];
    for (let i = 0; i < productsList.length; i += 1) {
      if (i % 2 === 0) {
        list.push(
          <Row type="flex" justify="center" gutter={40} key={i} className={styles.producShowcase}>
            {productsList.map((product, index) => {
              if (product.device_type === 'bluetooth' || product.device_type === 'lte') {
                if (index === i || index === i + 1) {
                  if (i + 1 === productsList.length) {
                    return (
                      <Col xs={24} lg={{ span: 10, pull: 5 }} key={product.device_type}>
                        <Row type="flex" justify="center">
                          <ProductCard onAddToCart={this.handleAddToCart} product={product} />
                        </Row>
                      </Col>
                    );
                  }
                  if (product.name !== '') {
                    return (
                      <Col xs={24} lg={{ span: 10 }} key={product.device_type}>
                        <Row type="flex" justify="center">
                          <ProductCard onAddToCart={this.handleAddToCart} product={product} />
                        </Row>
                      </Col>
                    );
                  }
                }
              }

              return '';
            })}
          </Row>
        );
      } else {
        list.push('');
      }
    }
    return <div>{list}</div>;
  };

  renderSensorsList = () => {
    const {
      products: { productsList },
    } = this.props;
    const list = [];
    for (let i = 0; i < productsList.length; i += 1) {
      if (i % 2 === 0) {
        list.push(
          <Row type="flex" justify="center" gutter={40} key={i}>
            {productsList.map((product, index) => {
              if (product.device_type !== 'bluetooth' && product.device_type !== 'lte') {
                if (index === i || index === i + 1) {
                  if (i + 1 === productsList.length) {
                    return (
                      <Col xs={24} lg={{ span: 10, pull: 5 }} key={product.device_type}>
                        <Row type="flex" justify="center">
                          <ProductCard onAddToCart={this.handleAddToCart} product={product} />
                        </Row>
                      </Col>
                    );
                  }
                  if (product.name !== '') {
                    return (
                      <Col xs={24} lg={{ span: 10 }} key={product.device_type}>
                        <Row type="flex" justify="center">
                          <ProductCard onAddToCart={this.handleAddToCart} product={product} />
                        </Row>
                      </Col>
                    );
                  }
                }
              }

              return '';
            })}
          </Row>
        );
      } else {
        list.push('');
      }
    }
    return <div>{list}</div>;
  };

  handleAddToCart = (product, numAdded) => {
    this.setState({
      modalVisible: true,
      productAdded: {
        ...product,
        selectedPlan: product.defaultPlan,
      },
    });

    const { dispatch } = this.props;
    if (product.device_type === 'lte') {
      dispatch({
        type: 'cart/addToCart',
        payload: {
          numAdded,
          product: {
            ...product,
            selectedPlan: product.defaultPlan,
            quantity: numAdded,
            subscription_type: oneTimeLTECharge,
          },
        },
      });
    } else {
      dispatch({
        type: 'cart/addToCart',
        payload: {
          numAdded,
          product: {
            ...product,
            quantity: numAdded,
            selectedPlan: product.defaultPlan,
          },
        },
      });
    }
  };

  handleShowCart = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'cart/toggleCart',
      payload: true,
    });
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false,
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'cart/toggleCart',
      payload: false,
    });
  };

  render() {
    const { modalVisible, productAdded } = this.state;
    const {
      cart: { cartVisible },
    } = this.props;

    return (
      <div>
        <div>
          <ConfirmModal
            onCancel={this.handleCancel}
            visible={modalVisible}
            product={{ ...productAdded, quantity: 1 }}
          />
        </div>
        <CartDrawer visible={cartVisible} onClose={this.handleCancel} />
        <div className={styles.firstDevice}>
          <div className={styles.productCategory}>ELD Devices</div>
          {this.renderProductsList()}
        </div>
        {/* <div className={styles.devicesSection}>
          <div className={styles.productCategory}>Dashcams For Your Fleet</div>
          {this.renderProductsList()}
        </div> */}
        <div className={styles.devicesSection}>
          <div className={styles.productCategory}>Trailer Sensors and Adapters</div>
          {this.renderSensorsList()}
        </div>
        {/* <div style={{ backgroundColor: '#F6F6F6', paddingTop: '100px' }}>
          <div className={styles.productCategory}>Trailer Sensors and Adapters</div>
          {this.renderSensorsList()}
        </div> */}
      </div>
    );
  }
}

export default props => (
  <AsyncLoadBizCharts>
    <ProductList {...props} />
  </AsyncLoadBizCharts>
);
