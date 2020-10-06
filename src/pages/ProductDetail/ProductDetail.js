import React, { Component } from 'react';
import { Row, Col, InputNumber, Button, Icon, Spin, Radio } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import { isEmpty, startCase } from 'lodash';
import { AsyncLoadBizCharts } from '@/components/Charts/AsyncLoadBizCharts';
import ConfirmModal from '@/components/ConfirmModal';
import CartDrawer from '@/components/CartDrawer';
// import desc from '../../assets/image/desc.png';
import styles from './ProductDetail.less';
import {
  oneTimeLTECharge,
  threeTimesLTECharges,
  sixTimesLTECharges,
  featuresMapping,
} from '@/utils/constants';

@connect(({ user, cart, products, loading, reseller }) => ({
  user,
  cart,
  products,
  loading: loading.effects['products/fetchOne'],
  reseller,
}))
class ProductDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      quantity: 1,
      productAdded: {},
      selectedPlan: {},
      installmentOption: oneTimeLTECharge,
      planPeriod: 'yearly',
      planType: 'Standard',
    };
  }

  componentDidMount() {
    const {
      dispatch,
      location,
      user: { currentUser },
    } = this.props;
    dispatch({
      type: 'products/saveOne',
      payload: location.state.product,
    });
    this.setState({
      selectedPlan: location.state.product.defaultPlan,
    });
    if (Object.keys(currentUser).length === 0 && process.env.NODE_ENV === 'production') {
      window.drift.load(DRIFT_CHAT_KEY);
      window.drift.show();
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'cart/toggleCart',
      payload: false,
    });

    dispatch({
      type: 'products/clearProductDetail',
    });
    window.drift.hide();
  }

  handleQuantityChange = val => {
    this.setState({
      quantity: val,
    });
  };

  handleAddToCart = productDetail => {
    const { quantity, installmentOption, selectedPlan } = this.state;
    this.setState({
      modalVisible: true,
      productAdded: {
        ...productDetail.product,
        selectedPlan,
        quantity,
      },
    });
    const { dispatch } = this.props;
    if (productDetail.product.device_type === 'lte') {
      dispatch({
        type: 'cart/addToCart',
        payload: {
          numAdded: quantity,
          product: {
            ...productDetail.product,
            selectedPlan,
            quantity,
            subscription_type: installmentOption,
          },
        },
      });
    } else {
      dispatch({
        type: 'cart/addToCart',
        payload: {
          numAdded: quantity,
          product: {
            ...productDetail.product,
            selectedPlan,
            quantity,
          },
        },
      });
    }
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

  handleInstallmentChange = e => {
    this.setState({
      installmentOption: e.target.value,
    });

    const { dispatch } = this.props;

    dispatch({
      type: 'reseller/setLTEChargesSubscription',
      payload: {
        selectedLTEChargesSubscription: e.target.value,
      },
    });
  };

  handlePlanChange = e => {
    const {
      products: { productDetail },
    } = this.props;
    const { planType } = this.state;
    const {plans} = productDetail.product;
    this.setState({
      planPeriod: e.target.value,
    });

    if (productDetail.product.device_type !== 'bluetooth') {
      for (const plan of plans) {
        if (plan.period === e.target.value) {
          this.setState({
            selectedPlan: plan,
          });
          break;
        }
      }
    } else {
      // Only bluetooth has different plans for the same period
      for (const plan of plans) {
        if (plan.period === e.target.value) {
          switch (planType) {
            case 'Standard':
            case 'Premium Plus':
              if (plan.plan_name.includes(planType)) {
                this.setState({
                  selectedPlan: plan,
                });
              }
              break;
            case 'Premium':
              if (plan.plan_name.includes(planType) && !plan.plan_name.includes('Plus')) {
                this.setState({
                  selectedPlan: plan,
                });
              }
              break;
            default:
              break;
          }
        }
      }
    }
  };

  handlePlanTypeChange = e => {
    const { planPeriod } = this.state;
    const {
      products: { productDetail },
    } = this.props;
    const {plans} = productDetail.product;
    this.setState({
      planType: e.target.value,
    });
    const planType = e.target.value;
    for (const plan of plans) {
      if (plan.period === planPeriod) {
        switch (planType) {
          case 'Standard':
          case 'Premium Plus':
            if (plan.plan_name.includes(planType)) {
              this.setState({
                selectedPlan: plan,
              });
            }
            break;
          case 'Premium':
            if (plan.plan_name.includes(planType) && !plan.plan_name.includes('Plus')) {
              this.setState({
                selectedPlan: plan,
              });
            }
            break;
          default:
            break;
        }
      }
    }
  };

  renderInstallmentOption = product => {
    const {
      user: { currentUser },
    } = this.props;

    if (isEmpty(currentUser)) {
      return '';
    }

    const area = {
      borderRadius: '40px',
      border: '2px solid #F0F0F0',
      background: '#F6F6F6',
      boxSizing: 'border-box',
      marginTop: "10px",
      marginBottom: "10px"
    };

    return (
      <Row>
        <Col xl={12} sm={0}/>
        <Col xl={12} sm={24} style={area}>
          <Radio.Group
            onChange={this.handleInstallmentChange}
            buttonStyle="outline"
            style={{ width: '100%' }}
          >
            <Col span={8} >
              <Row type="flex" justify="center">
                <Radio.Button className={styles.installmentButton} value={oneTimeLTECharge}>
                  1 month - ${product.price}/mo
                </Radio.Button>
              </Row>
            </Col>
            <Col span={8}>
              <Row type="flex" justify="center">
                <Radio.Button className={styles.installmentButton} value={threeTimesLTECharges}>
                  3 months - ${product.price / 3}/mo
                </Radio.Button>
              </Row>
            </Col>
            <Col span={8}>
              <Row type="flex" justify="center">
                <Radio.Button className={styles.installmentButton} value={sixTimesLTECharges}>
                  6 months - ${product.price / 6}/mo
                </Radio.Button>
              </Row>
            </Col>
          </Radio.Group>
        </Col>
      </Row>
    );
  };

  renderPlans = () => {
    const {
      products: { productDetail },
    } = this.props;
    const {plans} = productDetail.product;
    const { selectedPlan } = this.state;
    const periods = [];
    for (const plan of plans) {
      if (!periods.includes(plan.period)) {
        periods.push(plan.period);
      }
    }
    const numOfPeriod = periods.length;
    const periodOptions = periods.map(period => {
      return (
        <Col span={24 / numOfPeriod} key={period}>
          <Row
            type="flex"
            justify="center"
            style={{ paddingTop: '5%' }}
            className={styles.planOption}
          >
            <Radio.Button value={period}>{period}</Radio.Button>
          </Row>
        </Col>
      );
    });
    const planTypeOptions =
      productDetail.product.device_type === 'bluetooth' ? (
        <Row>
          <Radio.Group onChange={this.handlePlanTypeChange} style={{ width: '100%' }}>
            <Col xl={8} sm={24} className={styles.planTypeOption}>
              <Radio.Button value="Standard">
                ${selectedPlan.period === 'yearly' ? 18 : 20}/mo Standard
              </Radio.Button>
            </Col>
            <Col xl={8} sm={24} className={styles.planTypeOption}>
              <Radio.Button value="Premium">
                ${selectedPlan.period === 'yearly' ? 22.5 : 25}/mo Premium
              </Radio.Button>
            </Col>
            <Col xl={8} sm={24} className={styles.planTypeOption}>
              <Radio.Button value="Premium Plus">
                ${selectedPlan.period === 'yearly' ? 27 : 30}/mo Premium Plus
              </Radio.Button>
            </Col>
          </Radio.Group>
        </Row>
      ) : (
        ''
      );

    if (numOfPeriod !== 1) {
      return (
        <div>
          <Row>
            <Col span={12} className={styles.planPeriodArea}>
              <Radio.Group
                style={{ width: '100%' }}
                defaultValue={selectedPlan.period}
                onChange={this.handlePlanChange}
              >
                {periodOptions}
              </Radio.Group>
            </Col>
          </Row>
          {planTypeOptions}
        </div>
      );
    } 
      return '';
    
  };

  renderFeatures = () => {
    const {
      products: { productDetail },
    } = this.props;
    const { planType } = this.state;
    const featureRow = [];
    let featureCol = [];
    let features = [];
    let i = 0;
    if (productDetail.product.device_type === 'bluetooth') {
      const featureKey = `bluetooth${  planType.split(' ').join('')}`;
      features = featuresMapping[featureKey];
    } else {
      features = featuresMapping[productDetail.product.device_type];
    }
    for (const feature of features) {
      if (i % 2 === 0) {
        featureCol.push(
          <Col xs={24} sm={24} xl={12} className={styles.features} key={feature}>
            {feature}
          </Col>
        );
        if (i + 1 === features.length) {
          featureRow.push(
            <Row type="flex" key={i}>
              {featureCol}
            </Row>
          );
        }
      } else {
        featureCol.push(
          <Col xs={24} sm={24} xl={12} className={styles.features} key={feature}>
            {feature}
          </Col>
        );
        featureRow.push(
          <Row type="flex" key={i}>
            {featureCol}
          </Row>
        );
        featureCol = [];
      }
      i += 1;
    }
    return (
      <div>
        <Row>
          <Col className={styles.featureTitle}>Features with Device</Col>
        </Row>
        {featureRow}
      </div>
    );
  };

  periodInMonth = period => {
    switch (period) {
      case 'yearly':
        return 12;
      case 'quarterly':
        return 3;
      case 'monthly':
        return 1;
      default:
        break;
    }
  };

  render() {
    const { modalVisible, productAdded, quantity, selectedPlan } = this.state;
    const {
      cart: { cartVisible },
      products: { productDetail },
      loading,
    } = this.props;
    return (
      <div>
        <Spin spinning={loading === undefined ? false : loading} tip="Loading">
          <Row className={styles.detailSection}>
            <Row type="flex" justify="end">
              <p>
                <Link to="/new">
                  <Icon type="close-circle" style={{ fontSize: 'xx-large', color: '#354168' }} />
                </Link>
              </p>
            </Row>
            <Row type="flex">
              <Col xs={24} sm={10} xl={12} className={styles.blueBold}>
                {/* <Col span={12} className={styles.blueBold}> */}
                {productDetail.product ? startCase(productDetail.product.name) : ''}
              </Col>

              {productDetail.product && productDetail.product.price !== 0 ? (
                <Col xs={8} sm={6} xl={5} className={styles.blueBold}>
                  ${productDetail.product.price}
                </Col>
              ) : (
                ''
              )}
              {productDetail.product && productDetail.product.price !== 0 ? (
                <Col xs={8} sm={2} xl={2} className={styles.blueBold}>
                  +
                </Col>
              ) : (
                ''
              )}
              <Col xs={8} sm={6} xl={2} className={styles.blueBold}>
                {productDetail.product && !isEmpty(productDetail.product.plans)
                  ? `$${parseFloat(
                      (selectedPlan.price / this.periodInMonth(selectedPlan.period)).toFixed(2)
                    )}/monthly`
                  : null}
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={6} xl={10} className={styles.grayText}>
                {productDetail.product ? productDetail.product.description : ''}
              </Col>
              {productDetail.product && productDetail.product.price !== 0 ? (
                <Col xs={24} sm={6} xl={5} offset={2} className={styles.grayText}>
                  <div className={styles.adjustTagline}>One-time Hardware Cost</div>
                </Col>
              ) : (
                ''
              )}
              <Col xs={24} sm={6} xl={5} offset={2} className={styles.grayText}>
                <div className={styles.adjustTagline}>Periodic Service Charge</div>
              </Col>
            </Row>
            {productDetail.product && productDetail.product.device_type === 'lte'
              ? this.renderInstallmentOption(productDetail.product)
              : ''}
            <Row className={styles.addMargin}>
              <Col xs={24} sm={24} xl={12}>
                <Row type="flex" justify="center">
                  <img
                    src={productDetail.product ? productDetail.product.image : ''}
                    className={styles.productPic}
                    alt="Product"
                  />
                </Row>
              </Col>
              <Col xs={24} sm={24} xl={12}>
                <Row>
                  <InputNumber
                    defaultValue={1}
                    min={1}
                    value={quantity}
                    className={styles.inputNumber}
                    onChange={this.handleQuantityChange}
                  />
                  <Button
                    type="primary"
                    onClick={() => this.handleAddToCart(productDetail)}
                    className={styles.addToCart}
                  >
                    Add to Cart
                  </Button>
                </Row>
                {productDetail.product && productDetail.product.plans ? this.renderPlans() : ''}
                {productDetail.product && !isEmpty(productDetail.product.plans)
                  ? this.renderFeatures()
                  : ''}
                <Row className={styles.featureTitle}>1-Year Warranty</Row>
              </Col>
            </Row>
            <ConfirmModal
              visible={modalVisible}
              onCancel={this.handleCancel}
              product={productAdded}
            />
          </Row>
          <CartDrawer visible={cartVisible} onClose={this.handleCancel} />
        </Spin>
      </div>
    );
  }
}

export default props => (
  <AsyncLoadBizCharts>
    <ProductDetail {...props} />
  </AsyncLoadBizCharts>
);
