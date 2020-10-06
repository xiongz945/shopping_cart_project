import React, { Component } from 'react';
import { Modal, InputNumber, Row, Col, Button } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, startCase } from 'lodash';
import success from '../../assets/add-cart-success.png';
import styles from './index.less';

@connect(({ cart }) => ({
  cart,
}))
class ConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productQuantity: 1,
      initialQuantity: 1,
      extrasQuantity: {},
    };
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      product: { quantity },
      product,
      isUpdating,
    } = this.props;
    const { extrasQuantity } = this.state;
    if (quantity !== prevProps.product.quantity) {
      this.setState({
        productQuantity: quantity,
        initialQuantity: quantity,
      });
    }
    if (product !== prevProps.product) {
      if (isUpdating) {
        const {extras} = product;
        if (extras && extras.length > 0) {
          const extrasQuant = {};
          for (const extra of extras) {
            extrasQuant[extra.id] = extra.quantity;
          }
          this.setState({
            extrasQuantity: {
              ...extrasQuantity,
              ...extrasQuant,
            },
          });
        }
      }
    }
  }

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  handleSubmit = isCheckingOut => {
    const { dispatch, product, onCancel, isUpdating } = this.props;
    const { productQuantity, initialQuantity, extrasQuantity } = this.state;

    const newExtras = product.extras
      // .filter(extra => {
      //   if (extra.id in extrasQuantity) {
      //     return true;
      //   }
      //   return false;
      // })
      .map(extra => {
        if (!isUpdating) {
          return {
            ...extra,
            quantity: extra.id in extrasQuantity ? extrasQuantity[extra.id] : 0,
          };
        } 
          return {
            ...extra,
            quantity: extra.id in extrasQuantity ? extrasQuantity[extra.id] - extra.quantity : 0,
          };
        
      });

    dispatch({
      type: 'cart/update',
      payload: {
        product,
        quantity: productQuantity - initialQuantity,
        extras: newExtras,
      },
    });

    this.setState({
      extrasQuantity: {},
    });
    if (!isCheckingOut) {
      onCancel();
    } else {
      dispatch(
        routerRedux.push({
          pathname: '/new/checkout',
        })
      );
    }
  };

  handleProductQuantityChange = value => {
    this.setState({
      productQuantity: value,
    });
  };

  handleExtraQuantityChange = (val, extra) => {
    const { extrasQuantity } = this.state;

    this.setState({
      extrasQuantity: {
        ...extrasQuantity,
        [extra.id]: val,
      },
    });
  };

  renderExtras = () => {
    const {
      product: { extras },
    } = this.props;
    const { extrasQuantity } = this.state;
    return extras
      ? extras.map(extra => {
          return (
            <Row type="flex" justify="center" align="middle" key={extra.id}>
              <Col span={4}>
                <Row type="flex" justify="center">
                  <img src={extra.image} alt={extra.name} width="57px" />
                </Row>
              </Col>
              <Col span={6} className={styles.text}>
                {startCase(extra.name)}
              </Col>
              <Col span={2}>
                <InputNumber
                  defaultValue={0}
                  min={0}
                  value={extrasQuantity[extra.id] || 0}
                  className={styles.periInputNumber}
                  onChange={val => this.handleExtraQuantityChange(val, extra)}
                />
              </Col>
              <Col span={6} className={styles.text}>
                ${extra.price}/Truck <span className={styles.gray}>(one time only)</span>
              </Col>
            </Row>
          );
        })
      : null;
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
    const { visible, product, isUpdating } = this.props;
    const { productQuantity } = this.state;
    return (
      <Modal
        visible={visible}
        onCancel={this.handleCancel}
        footer={null}
        className={styles.addToCartModal}
      >
        <Row type="flex" justify="center">
          <Col xs={24} sm={24} xl={8} style={isUpdating ? { visibility: 'hidden' } : {}}>
            <Row className={styles.title}>
              <img src={success} alt="success" />
              Product added to the basket
            </Row>
          </Col>
        </Row>
        <Row type="flex" justify="center" style={{ marginTop: '5%' }}>
          <Col xs={24} sm={24} xl={10} className={styles.productName}>
            {product.name}
          </Col>
          <Col xs={9} sm={9} xl={5} className={styles.price1}>
            {product.price !== 0 ? `$${product.price}` : ''}
          </Col>
          <Col xs={6} sm={6} xl={3} className={styles.price1}>
            {product.price !== 0 && !isEmpty(product.selectedPlan) ? '+' : ''}
          </Col>
          <Col xs={9} sm={9} xl={6} pull={product.price === 0 ? 8 : 0} className={product.price !== 0 ? styles.price2 : styles.price1}>
            {!isEmpty(product.selectedPlan)
              ? `$${parseFloat(
                  (
                    product.selectedPlan.price / this.periodInMonth(product.selectedPlan.period)
                  ).toFixed(2)
                )}/mo`
              : ''}
          </Col>
        </Row>
        <Row type="flex" justify="center">
          <Col xs={12} sm={15} xl={7} offset={10} className={styles.priceDesc}>
            {product.price !== 0 ? 'One-time Hardware Cost' : ''}
          </Col>
          <Col xs={12} sm={9} xl={6} offset={1} offset={1} pull={product.price === 0 ? 8 : 0} className={styles.priceDesc}>
            {!isEmpty(product.selectedPlan) ? 'Periodic Service Charge' : ''}
          </Col>
        </Row>
        <Row type="flex" align="bottom">
          <Col xs={12} sm={12} xl={6} offset={4} className={styles.productTaglineBottom}>
            <img src={product.image} alt="product" className={styles.productPic} />
          </Col>
          <Col xs={12} sm={12} xl={8} className={styles.productQty}>
            <InputNumber
              min={1}
              defaultValue={productQuantity}
              className={styles.inputNumber}
              value={productQuantity}
              onChange={this.handleProductQuantityChange}
            />
          </Col>
        </Row>
        {product.extras && product.extras.length > 0 ? (
          <div>
            <Row
              type="flex"
              justify="center"
              className={styles.extraTitle}
              style={{ marginTop: '20px' }}
            >
              <Col xs={12} sm={12} xl={8} offset={8} className={styles.removeOffset}>
                Choose Pin Adapter for your Vehicle
              </Col>
              <Col xs={12} sm={12} xl={2} offset={6} className={styles.required}>
                * Required
              </Col>
            </Row>
            <div className={styles.xtrasStyling}>{this.renderExtras()}</div>
          </div>
        ) : null}
        <Row className={styles.productModalListing}>
          <Col xs={12} sm={12} xl={{span:6, offset:4}}>
            <Button
              type="default"
              className={styles.shopping}
              onClick={() => this.handleSubmit(false)}
            >
              Continue Shopping
            </Button>
          </Col>
          <Col xs={12} sm={12} xl={{span: 6, offset: 2}}>
            <Button
              type="primary"
              className={styles.proceed}
              onClick={() => this.handleSubmit(true)}
            >
              Proceed Order
            </Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ConfirmModal;
