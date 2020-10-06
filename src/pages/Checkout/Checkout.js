import React, { Component } from 'react';
import {
  Steps,
  Card,
  Row,
  Col,
  Button,
  InputNumber,
  Icon,
  Form,
  Input,
  notification,
  Alert,
  Popconfirm,
  Tooltip,
} from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import { isEmpty, startCase } from 'lodash';
import { AsyncLoadBizCharts } from '@/components/Charts/AsyncLoadBizCharts';
import ShippingForm from '@/components/ShippingForm';
import NewPaymentCard from '@/components/new-payment-card';
import ConfirmModal from '@/components/ConfirmModal';
import styles from './Checkout.less';
const { Step } = Steps;

@connect(({ user, cart, loading }) => ({
  user,
  cart,
  submitting: loading.effects[('user/current', 'user/storeInfo')],
}))
class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      totalPrice: 0,
      taxOnDevices: 0,
      coupon: '',
      addressInSearchBar: '',
      agreementStatus: false,
      noExpressShipping: false,
      productSelected: { quantity: 1 },
    };
    this.onCardSubmit = this.onCardSubmit.bind(this);
    this.handleAgreement = this.handleAgreement.bind(this);
  }

  componentDidMount() {
    const {
      dispatch,
      cart: { hasRestored },
      user: { currentUser },
    } = this.props;
    // Hide the cart on the header
    dispatch({
      type: 'cart/toggleCartButton',
      payload: false,
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
        notification.error({
          message: 'Error',
          description: err,
        });
      }
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/resetSteps',
    });
    window.drift.hide();
  }

  onCardSubmit(result, billingDetails, plaidSettings = null, isContactSupport = false) {
    const {
      dispatch,
      user: {
        noCommission,
        quickShipping,
        achPaymentUniqueLinkToken,
        userInfo: {
          firstName,
          lastName,
          email,
          phNumber,
          companyName,
          dotNumber,
          addressLine1,
          addressLine2,
          city,
          state,
          country,
          zipCode,
        },
      },
      cart: { cartItems },
    } = this.props;
    const { taxOnDevices, totalPrice } = this.state;
    if (result.token) {
      const items = cartItems.map(item => {
        const plan = { ...item.selectedPlan, plan_price: item.selectedPlan.price };
        delete plan.price;
        const newItem = {
          ...item,
          ...plan,
        };
        delete newItem.selectedPlan;
        return newItem;
      });
      const payload = {
        dot_number: dotNumber,
        final_price: totalPrice,
        taxOnDevices,
        seller_public_link_token: localStorage.getItem('reseller-public-link-token') || null,
        customer_link_token: localStorage.getItem('customer_link_token') || null,
        is_public: localStorage.getItem('reseller-is-public-link') || false,
        company_name: companyName,
        quick_shipping: quickShipping,
        no_commission: noCommission,
        coupon_code: this.getCoupon(),
        achPaymentUniqueLinkToken,
        is_contact_support: isContactSupport,
        user_info: {
          full_name: `${firstName} ${lastName}`,
          email,
          phone: phNumber,
        },
        billing_info: {
          token: plaidSettings ? null : result.token.id,
          address_line1: plaidSettings ? addressLine1 : billingDetails.addressLine1,
          address_line2: plaidSettings ? addressLine2 : billingDetails.addressLine2,
          city: plaidSettings ? city : billingDetails.city,
          state: plaidSettings ? state : billingDetails.state,
          zipcode: plaidSettings ? zipCode : billingDetails.zipCode,
          country: plaidSettings ? country : billingDetails.country,
        },
        shipping_address: {
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          state,
          zipcode: zipCode,
          country,
        },
        cart_items: items,
      };

      if (plaidSettings) {
        payload.plaidSettings = plaidSettings;
      }

      if (plaidSettings && plaidSettings.generateACHLink) {
        dispatch({
          type: 'user/newAchGenerateLink',
          payload,
        });
      } else if (plaidSettings && isContactSupport) {
        dispatch({
          type: 'user/contactSupportGenerate',
          payload,
        });
      } else {
        dispatch({
          type: 'user/purchase',
          payload,
        });
      }
    } else if (result.result === 'error') {
      notification.error({
        message: 'Error',
        description: result.data.message,
      });
    }
  }

  getCoupon() {
    const {
      user: { couponCode },
    } = this.props;
    return couponCode.isValid ? couponCode.name : null;
  }

  // Next step
  next = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/current',
      payload: true,
    });
  };

  // Previous step
  prev = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/current',
      payload: false,
    });
  };

  hideError = () => {
    localStorage.setItem('errorOnPurchase', '');
    const { dummyState } = this.state;
    const oppositeState = !dummyState;
    this.setState({ dummyState: oppositeState });
  };

  handleSelection = item => {
    this.setState({
      modalVisible: true,
      productSelected: {
        ...item,
      },
    });
  };

  handleDelete = item => {
    const { dispatch } = this.props;
    dispatch({
      type: 'cart/delete',
      payload: item,
    });
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };

  handleCheckout = () => {
    this.next();
    return 0;
  };

  handleChangeInAddressBar = address => {
    this.setState({ addressInSearchBar: address });
  };

  handleProductQuantityChange = (val, item) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'cart/update',
      payload: {
        product: item,
        quantity: val - item.quantity,
        extras: [],
      },
    });
  };

  handleExtraQuantityChange = (val, extra, item) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'cart/update',
      payload: {
        product: item,
        quantity: 0,
        extras: [
          {
            ...extra,
            quantity: val - extra.quantity,
          },
        ],
      },
    });
  };

  renderExtras = item => {
    const { extras } = item;
    const {
      user: {
        userInfo: { pendingACHPayment },
      },
    } = this.props;
    return extras.map(extra => {
      if (extra.quantity !== 0) {
        return (
          <Row type="flex" align="middle" key={extra.id}>
            <Col span={5}>
              <img src={extra.image} alt="Product" width="80px" />
            </Col>
            <Col span={5} className={styles.peripheralText}>
              {extra.name}
            </Col>
            <Col span={5}>
              <InputNumber
                className={styles.periInputNumber}
                size="large"
                defaultValue={1}
                value={extra.quantity}
                disabled={pendingACHPayment}
                min={1}
                onChange={val => this.handleExtraQuantityChange(val, extra, item)}
              />
            </Col>
            <Col span={5} className={styles.peripheralText}>
              ${extra.price}/Truck
            </Col>
            {pendingACHPayment ? (
              ''
            ) : (
              <Col span={4} className={styles.edit}>
                <u onClick={() => this.handleSelection(item)}>Edit Selection</u>
              </Col>
            )}
          </Row>
        );
      }
      return null;
    });
  };

  // Make a separate component
  renderShoppingCart = () => {
    const {
      cart: { cartItems },
      user: {
        userInfo: { pendingACHPayment },
      },
    } = this.props;
    return cartItems.map(item => {
      let planPrice = 0;
      if (pendingACHPayment) {
        if (!isEmpty(item.selectedPlan)) {
          planPrice = item.plan_price;
        }
      } else if (!isEmpty(item.selectedPlan)) {
        planPrice = item.selectedPlan.price;
      }
      return (
        <Row key={item.type}>
          <Card
            bordered={false}
            style={{ paddingLeft: '3%', paddingRight: '3%', marginBottom: '2%' }}
          >
            <Row gutter={[0, 16]}>
              <Col span={8} className={styles.blueText}>
                {startCase(item.name)}
              </Col>
              <Col span={7} className={styles.blueText}>
                {item.price !== 0 ? `$${item.price}` : ''}
              </Col>
              <Col span={1} className={styles.blueText}>
                {item.price !== 0 && !isEmpty(item.selectedPlan) ? '+' : ''}
              </Col>
              <Col span={7} className={item.price === 0 ? styles.blueText : styles.monthlyCharge}>
                {!isEmpty(item.selectedPlan) ? `$${planPrice}/${item.selectedPlan.period}` : ''}
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <img src={item.image} width="auto" height="130px" alt="Product" />
              </Col>
              <Col span={8}>
                <Row className={styles.grayText}>
                  {item.price !== 0 ? 'One-time Hardware Cost' : ''}
                </Row>
                {pendingACHPayment ? (
                  ''
                ) : (
                  <Row type="flex" align="bottom" style={{ height: '100px' }}>
                    <Popconfirm
                      title="Are you sure to delete this item?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => this.handleDelete(item)}
                    >
                      <Button className={styles.delete} type="link">
                        Delete
                      </Button>
                    </Popconfirm>
                  </Row>
                )}
              </Col>
              <Col span={8}>
                <Row className={styles.grayText}>
                  {!isEmpty(item.selectedPlan) ? 'Periodic Service Charge' : ''}
                </Row>
                <Row type="flex" align="bottom" style={{ height: '100px' }}>
                  <InputNumber
                    disabled={pendingACHPayment}
                    className={styles.inputNumber}
                    size="large"
                    defaultValue={1}
                    min={1}
                    value={item.quantity}
                    onChange={val => this.handleProductQuantityChange(val, item)}
                  />
                </Row>
              </Col>
            </Row>
            {item.extras.length > 0 && item.extras.some(extra => extra.quantity !== 0) ? (
              <div>
                <Row className={styles.peripheral}>Pin Adapter</Row>
                <Row>
                  <Card style={{ borderRadius: '20px', border: '2px solid #EBEBEB' }}>
                    {this.renderExtras(item)}
                  </Card>
                </Row>
              </div>
            ) : null}
          </Card>
        </Row>
      );
    });
  };

  renderShippingAddress = () => {
    const { addressInSearchBar, noExpressShipping } = this.state;
    return (
      <ShippingForm
        next={this.next}
        addressInSearchBar={addressInSearchBar}
        handleChangeInAddressBar={this.handleChangeInAddressBar}
        noExpressShipping={noExpressShipping}
      />
    );
  };

  renderPaymentForm = () => {
    const { agreementStatus, totalPrice } = this.state;
    return (
      <Row style={{ backgroundColor: '#FFFFFF', paddingLeft: '3%' }}>
        <NewPaymentCard
          hideError={this.hideError}
          onCardSubmit={this.onCardSubmit}
          onChange={this.handleAgreement}
          agreementStatus={agreementStatus}
          totalPrice={totalPrice}
        />
      </Row>
    );
  };

  onCouponCodeApply = () => {
    const { dispatch } = this.props;
    const { coupon } = this.state;
    dispatch({
      type: 'user/validateCouponCode',
      payload: {
        couponCode: coupon,
      },
    });
  };

  onCouponCodeRemove = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/removeCoupon',
    });
    this.setState({
      coupon: '',
    });
  };

  displayErrorMessage = () => {
    return <Alert message="Invalid coupon code!" type="error" />;
  };

  displaySuccessMessage = () => {
    return <Alert message="Coupon code applied!" type="success" />;
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  getCouponCodeHtml = () => {
    const {
      user: {
        couponCode,
        currentUser,
        userInfo: { pendingACHPayment },
      },
    } = this.props;

    const { coupon } = this.state;

    const divMarginTopAndBottom = {
      margin: '3% 0 2% 0',
    };

    if (!pendingACHPayment && isEmpty(currentUser)) {
      return '';
    }

    if (pendingACHPayment && !couponCode.isValid) {
      return '';
    }

    return (
      <div>
        <Row>
          <Col span={18} style={divMarginTopAndBottom}>
            <Col span={20}>
              <Input
                placeholder="Add Promo Code"
                value={coupon || couponCode.name}
                name="coupon"
                onChange={this.handleChange}
                disabled={couponCode.isValid}
                className={styles.couponInput}
                onPressEnter={couponCode.isValid ? this.onCouponCodeRemove : this.onCouponCodeApply}
              />
            </Col>
            <Col span={2}>
              <Button
                type="primary"
                disabled={!coupon && !couponCode.name}
                onClick={couponCode.isValid ? this.onCouponCodeRemove : this.onCouponCodeApply}
              >
                {couponCode.isValid ? <div>Remove</div> : <div>Apply</div>}
              </Button>
            </Col>
          </Col>
        </Row>
        <Row>
          {/* eslint-disable */
          couponCode.isValid === undefined
            ? ''
            : couponCode.isValid
            ? this.displaySuccessMessage()
            : this.displayErrorMessage()
          /* eslint-enable */
          }
        </Row>
      </div>
    );
  };

  getDevicesShippingCost = (items, isExpress) => {
    const { noExpressShipping } = this.state;
    const smallBoxCost = 10;
    const mediumBoxCost = 20;
    const expressCost = 20;
    const weightConst = 1;
    let totalCost = 0;
    const devicesByWeights = items.map(item => {
      // Missing extras' weight
      let smallBoxWeight = weighBySmallBox(item.device_type) * item.quantity;
      let mediumBoxWeight = weighByMediumBox(item.device_type) * item.quantity;
      if (item.extras.length > 0) {
        for (const extra of item.extras) {
          smallBoxWeight += weighBySmallBox(extra.device_type) * extra.quantity;
          mediumBoxWeight += weighByMediumBox(extra.device_type) * extra.quantity;
        }
      }
      return {
        deviceType: item.device_type,
        smallBoxWeight,
        mediumBoxWeight,
      };
    });
    const reducer = (prev, curr) => {
      prev.smallBoxWeight += curr.smallBoxWeight;
      prev.mediumBoxWeight += curr.mediumBoxWeight;
      return prev;
    };
    const totalCount = devicesByWeights.reduce(reducer, { smallBoxWeight: 0, mediumBoxWeight: 0 });

    const totalSmallBoxWeight = totalCount.smallBoxWeight;
    const totalMediumBoxWeight = totalCount.mediumBoxWeight;
    // const customBoxWeight = totalCount.mediumBoxWeight / 4;
    if (totalSmallBoxWeight <= weightConst) {
      totalCost = smallBoxCost;
      if (isExpress) {
        totalCost += expressCost;
      }
    } else {
      totalCost = Math.ceil(totalMediumBoxWeight) * mediumBoxCost;
      if (!noExpressShipping) {
        this.setState({
          noExpressShipping: true,
        });
      }
    }
    return totalCost;
  };

  handleAgreement() {
    const { agreementStatus } = this.state;
    this.setState({ agreementStatus: !agreementStatus }, () => {});
  }

  renderPricingDetailsView() {
    const {
      cart: { cartItems, totalInCart },
      user: {
        enableCreditCard,
        quickShipping,
        userInfo,
        couponCode,
        currentStep,
        userInfo: { showAddressSearchBar, pendingACHPayment },
      },
    } = this.props;
    const { addressInSearchBar, agreementStatus, totalPrice } = this.state;
    let totalDeviceCost = 0;
    let totalPeriodicCost = 0;
    let shippingCost = 0;
    if (totalInCart !== 0) {
      shippingCost = this.getDevicesShippingCost(cartItems, quickShipping === 'yes');
      // quickShipping === 'yes' ? 30 : 10;
    }
    let tax = 0;
    let ltePrice = 0;
    let period = 1;
    let lteDiscount = 0;
    let bluetoothDiscount = 0;
    let discount = null;
    cartItems.forEach(item => {
      if (item.device_type === 'lte') {
        if (couponCode.isValid) {
          discount = couponCode.details;
          if (discount.type === 'percentage') {
            lteDiscount = ((item.price * discount.value) / 100) * item.quantity;
          } else if (discount.type === 'amount') {
            // Stripe coupon values are in cents, divide by 100
            lteDiscount = discount.value / 100;
          }
        }
        switch (item.subscription_type) {
          case oneTimeLTECharge:
            totalDeviceCost += item.price * item.quantity - lteDiscount;
            break;
          case threeTimesLTECharges:
            totalDeviceCost += (item.price * item.quantity - lteDiscount) / 3;
            ltePrice = (item.price * item.quantity - lteDiscount) / 3;
            period = 3;
            break;
          case sixTimesLTECharges:
            totalDeviceCost += (item.price * item.quantity - lteDiscount) / 6;
            ltePrice = (item.price * item.quantity - lteDiscount) / 6;
            period = 6;
            break;
          default:
            break;
        }
        if (!isEmpty(item.selectedPlan)) {
          if (!pendingACHPayment) {
            totalPeriodicCost += item.selectedPlan.price * item.quantity;
          } else {
            totalPeriodicCost += item.plan_price * item.quantity;
          }
        }
      } else if (item.device_type === 'bluetooth') {
        const defaultDiscount = 0.9;
        if (couponCode.isValid && item.selectedPlan.period === 'yearly') {
          discount = couponCode.details;
          if (discount.type === 'percentage') {
            if (!pendingACHPayment) {
              bluetoothDiscount = parseFloat(
                (
                  (((item.selectedPlan.price / defaultDiscount) * discount.value) / 100) *
                  item.quantity
                ).toFixed(2)
              );
            } else {
              bluetoothDiscount = parseFloat(
                (
                  (((item.plan_price / defaultDiscount) * discount.value) / 100) *
                  item.quantity
                ).toFixed(2)
              );
            }
          } else if (discount.type === 'amount') {
            // Stripe coupon values are in cents, divide by 100
            bluetoothDiscount = discount.value / 100;
          }
        } else if (item.selectedPlan.discount > 0 && item.selectedPlan.period === 'yearly') {
          if (!pendingACHPayment) {
            bluetoothDiscount =
              ((item.selectedPlan.price * item.selectedPlan.discount) / 100) * item.quantity;
          } else {
            bluetoothDiscount =
              ((item.plan_price * item.selectedPlan.discount) / 100) * item.quantity;
          }
          discount = {
            type: 'percentage',
            value: item.selectedPlan.discount,
          };
        }
        totalDeviceCost += item.price * item.quantity;
        if (!isEmpty(item.selectedPlan)) {
          if (!pendingACHPayment) {
            if (bluetoothDiscount > 0) {
              totalPeriodicCost +=
                (item.selectedPlan.price / defaultDiscount) * item.quantity - bluetoothDiscount;
            } else {
              totalPeriodicCost += item.selectedPlan.price * item.quantity;
            }
          } else {
            if (bluetoothDiscount > 0) {
              totalPeriodicCost +=
                (item.plan_price / defaultDiscount) * item.quantity - bluetoothDiscount;
            } else {
              totalPeriodicCost += item.plan_price * item.quantity;
            }
          }
        }
      } else {
        totalDeviceCost += item.price * item.quantity;
        if (!isEmpty(item.selectedPlan)) {
          if (!pendingACHPayment) {
            totalPeriodicCost += item.selectedPlan.price * item.quantity;
          } else {
            totalPeriodicCost += item.plan_price * item.quantity;
          }
        }
      }
      if (item.extras.length > 0) {
        item.extras.forEach(extra => {
          totalDeviceCost += extra.price * extra.quantity;
        });
      }
    });

    const stateVal = userInfo.state && userInfo.state.toLowerCase();
    if (stateVal === 'ca' || stateVal === 'california') {
      if (ltePrice === 0) {
        tax += (totalDeviceCost * 9.5) / 100;
      } else {
        tax += ((totalDeviceCost - ltePrice + ltePrice * period) * 9.5) / 100;
      }
      tax = parseFloat(tax.toFixed(2));
    }
    const totalPayment = parseFloat(
      (totalDeviceCost + totalPeriodicCost + tax + shippingCost).toFixed(2)
    );
    if (totalPayment !== totalPrice) {
      this.setState({
        taxOnDevices: tax,
        totalPrice: totalPayment,
      });
    }

    return (
      <Col xl={6} sm={24} xs={24}>
        <Card style={{ borderRadius: '10px' }}>
          <div className={styles.productSummaryTitle}>Product Summary</div>
          <Row>
            {/* <Row type="flex" justify="space-between" className={styles.productSummary}>
            <Col span={12}>Plan:</Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              Premium Plus
            </Col>
          </Row> */}
            <Row type="flex" justify="space-between" className={styles.productSummary}>
              <Col span={12}>No. of Products:</Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                {totalInCart}
              </Col>
            </Row>
            {couponCode.isValid ? (
              <Row type="flex" justify="space-between" className={styles.productSummary}>
                <Col span={12}>Coupon Applied:</Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  {discount.type === 'amount' ? '$' : ''}
                  {discount.type === 'amount' ? discount.value / 100 : discount.value}
                  {discount.type === 'percentage' ? '% Off' : ''}
                </Col>
              </Row>
            ) : (
              ''
            )}
            {couponCode.isValid && lteDiscount > 0 ? (
              <Row type="flex" justify="space-between" className={styles.productSummary}>
                <Col span={12}>Discount on Wired ELD:</Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  ${lteDiscount}
                </Col>
              </Row>
            ) : (
              ''
            )}
            {bluetoothDiscount > 0 ? (
              <Row type="flex" justify="space-between" className={styles.productSummary}>
                <Col span={12}>Discount on Bluetooth ELD:</Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  ${bluetoothDiscount}
                </Col>
              </Row>
            ) : (
              ''
            )}
            <Row type="flex" justify="space-between" className={styles.productSummary}>
              <Col span={12}>Periodic Charge:</Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                ${totalPeriodicCost}
              </Col>
            </Row>
            <Row type="flex" justify="space-between" className={styles.productSummary}>
              <Col span={12}>Total Periodic Charge:</Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                ${totalPeriodicCost}
              </Col>
            </Row>
            {period !== 1 ? (
              <Row type="flex" justify="space-between" className={styles.productSummary}>
                <Col span={12}>Total Charges:</Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  ${ltePrice * period}
                </Col>
              </Row>
            ) : (
              ''
            )}
            {period !== 1 ? (
              <Row type="flex" justify="space-between" className={styles.productSummary}>
                <Col span={12}>Payment Cycle for Wired ELD:</Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  {period} months
                </Col>
              </Row>
            ) : (
              ''
            )}
            <Row type="flex" justify="space-between" className={styles.productSummary}>
              <Col span={12}>Device Charge:</Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                ${totalDeviceCost}
              </Col>
            </Row>
            <Row type="flex" justify="space-between" className={styles.productSummary}>
              <Col span={12}>Taxes on Device:</Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                ${tax}
              </Col>
            </Row>
            <Row type="flex" justify="space-between" className={styles.productSummary}>
              <Col span={12}>Total Device Charge:</Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                ${(totalDeviceCost + tax).toFixed(2)}
              </Col>
            </Row>
            <Row type="flex" justify="space-between" className={styles.productSummary}>
              <Col span={12}>Shipping &amp; Handling</Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                ${shippingCost}
              </Col>
            </Row>
            <Row type="flex" justify="space-between" className={styles.productSummary}>
              <Col span={12}>
                <b>Total Payment:</b>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <b>${totalPayment}</b>
              </Col>
            </Row>
          </Row>
          <Row type="flex" justify="center">
            {this.getCouponCodeHtml()}
          </Row>
        </Card>
        <Row type="flex" justify="center" className={styles.buttonArea}>
          {currentStep === 0 && (
            <Button
              type="primary"
              disabled={totalInCart === 0}
              className={styles.checkoutButton}
              onClick={this.handleCheckout}
            >
              Check Out
              <Icon type="right" />
            </Button>
          )}
          {(currentStep === 1 || currentStep === 2) && (
            <Col span={12}>
              <Button type="default" className={styles.backButton} onClick={this.prev}>
                Back
              </Button>
            </Col>
          )}
          {currentStep === 1 && (
            <Col span={12}>
              <Button
                className={styles.nextButton}
                type="primary"
                htmlType="submit"
                form="shipping-form"
                disabled={addressInSearchBar === '' && showAddressSearchBar}
              >
                Next
              </Button>
            </Col>
          )}
          {currentStep === 2 && (
            <Col span={12}>
              <Button
                style={
                  !enableCreditCard && totalPrice > THRESHOLD_CREDIT_PAYMENT
                    ? { visibility: 'hidden' }
                    : {}
                }
                type="primary"
                className={styles.nextButton}
                htmlType="submit"
                form="card-form"
                disabled={!agreementStatus}
              >
                Pay ${totalPayment}
                <Tooltip
                  placement="bottom"
                  title="Please check the Auto Pay box in the form to proceed"
                  visible={
                    !agreementStatus && (enableCreditCard || totalPrice <= THRESHOLD_CREDIT_PAYMENT)
                  }
                  overlayStyle={{ marginTop: '2%' }}
                />
              </Button>
            </Col>
          )}
        </Row>
      </Col>
    );
  }

  render() {
    const {
      user: {
        currentStep,
        userInfo: { pendingACHPayment },
      },
      cart: { totalInCart },
    } = this.props;
    const { modalVisible, productSelected } = this.state;
    const steps = [
      {
        title: 'Shopping Basket',
        content: this.renderShoppingCart(),
      },
      {
        title: 'Shipping Address',
        content: this.renderShippingAddress(),
      },
      {
        title: 'Payment',
        content: this.renderPaymentForm(),
      },
    ];
    return (
      <div>
        <ConfirmModal
          visible={modalVisible}
          onCancel={this.handleCancel}
          product={{ ...productSelected }}
          isUpdating
        />
        <Row type="flex" align="middle">
          <Col xl={3} sm={24} xs={24}>
            {pendingACHPayment ? null : (
              <Link to="/new" className={styles.returnHome}>
                <Icon type="left" />
                Continue Shopping
              </Link>
            )}
          </Col>
          <Col xl={15} sm={24} xs={24}>
            <Steps type="navigation" current={currentStep}>
              <Step status="process" title="Shopping Bakset" />
              <Step status="wait" title="Shipping Address" />
              <Step status="wait" title="Payment" />
            </Steps>
          </Col>
        </Row>
        <Row type="flex" gutter={16}>
          <Col xl={{span: 15, offset: 3}} xs={24} sm={24} >
            {totalInCart === 0 ? <Card>Your cart is empty</Card> : steps[currentStep].content}
          </Col>
          {this.renderPricingDetailsView()}
        </Row>
      </div>
    );
  }
}

const CheckoutForm = Form.create()(Checkout);
export default props => (
  <AsyncLoadBizCharts>
    <CheckoutForm {...props} />
  </AsyncLoadBizCharts>
);
