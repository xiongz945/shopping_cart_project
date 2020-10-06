import React, { Component } from 'react';
import { Drawer, Button, Row, Col, InputNumber, Divider, Card, Popconfirm } from 'antd';
import { connect } from 'dva';
import { Link } from 'umi';
import { startCase } from 'lodash';
import ConfirmModal from '@/components/ConfirmModal';
import styles from './index.less';

@connect(({ cart }) => ({
  cart,
}))
class CartDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      productSelected: { quantity: 1 },
    };
  }

  handleDelete = item => {
    const { dispatch } = this.props;
    dispatch({
      type: 'cart/delete',
      payload: item,
    });
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

  handleEditSelection = item => {
    this.setState({
      modalVisible: true,
      productSelected: {
        ...item,
      },
    });
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };

  renderExtras = item => {
    const {extras} = item;
    return extras.map(extra => {
      if (extra.quantity !== 0) {
        return (
          <Row type="flex" align="middle" key={extra.id}>
            <Col span={6}>
              <img src={extra.image} alt="Product" width="80px" />
            </Col>
            <Col span={6}>
              <Row className={styles.blueSmallText}>{startCase(extra.name)}</Row>
              <Row className={styles.blueSmallText}>${extra.price}/Truck</Row>
            </Col>
            <Col span={6}>
              <InputNumber
                className={styles.periInputNumber}
                size="large"
                defaultValue={1}
                value={extra.quantity}
                onChange={val => this.handleExtraQuantityChange(val, extra, item)}
              />
            </Col>
            <Col span={6} className={styles.edit}>
              <u onClick={() => this.handleEditSelection(item)}>Edit Selection</u>
            </Col>
          </Row>
        );
      } 
        return null;
      
    });
  };

  renderCartItems = () => {
    const {
      cart: { cartItems },
    } = this.props;
    return cartItems.map((item, index) => {
      return (
        <div key={item.device_type}>
          {index > 0 ? <Divider /> : null}
          <Row>
            <Col span={12} className={styles.blueText}>
              {startCase(item.name)}
            </Col>
            <Col span={12} className={styles.blueText}>
              {item.price !== 0 ? `$${item.price}` : ''}
            </Col>
          </Row>
          {item.price !== 0 ? (
            <Row>
              <Col span={12} offset={12} className={styles.graySmallText}>
                One-time Hardware
              </Col>
            </Row>
          ) : (
            ''
          )}
          <Row>
            <Col span={12}>
              <img src={item.image} width="auto" height="130px" alt="Product" />
            </Col>
            <Col span={12}>
              {item.price !== 0 ? <Row>+</Row> : ''}
              <Row className={item.price === 0 ? styles.blueText : styles.grayLargeText}>
                ${item.selectedPlan.price}/{item.selectedPlan.period}
              </Row>
              <Row className={styles.graySmallText}>Periodic Service Charge</Row>
              <Row type="flex" justify="space-between" align="middle">
                <Col span={10}>
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
                </Col>

                <Col span={10}>
                  <InputNumber
                    className={styles.inputNumber}
                    defaultValue={1}
                    min={0}
                    value={item.quantity}
                    onChange={val => this.handleProductQuantityChange(val, item)}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          {item.extras.length > 0 && item.extras.some(extra => extra.quantity !== 0) ? (
            <div>
              <Row className={styles.peripheral}>Pin Adapter</Row>
              <Row>
                <Card className={styles.peripheralArea}>{this.renderExtras(item)}</Card>
              </Row>
            </div>
          ) : null}
        </div>
      );
    });
  };

  render() {
    const {
      visible,
      onClose,
      cart: { totalInCart },
    } = this.props;
    const { modalVisible, productSelected } = this.state;
    const titleStyle = {
      marginTop: '38px',
      textAlign: 'center',
      fontFamily: 'Avenir, sans-serif',
      fontStyle: 'normal',
      fontWeight: '900',
      fontSize: '22px',
      lineHeight: '30px',
      color: '#354168',
    };

    const title = <p style={titleStyle}>Shopping Cart</p>;
    return (
      <div>
        <Drawer title={title} placement="right" visible={visible} onClose={onClose} width={520}>
          {totalInCart === 0 ? (
            <h1 style={{ textAlign: 'center' }}>Your cart is empty</h1>
          ) : (
            this.renderCartItems()
          )}
          <Divider style={{ marginTop: '210px' }} />
          <Row type="flex" justify="center">
            <Col flex={4} className={styles.blueText}>
              {totalInCart} Product
            </Col>
            <Col flex={2} style={{ marginLeft: '225px' }} className={styles.blueText} />
          </Row>
          <Row type="flex" justify="center">
            <Button type="primary" className={styles.checkoutButton} disabled={totalInCart === 0}>
              <Link to="/new/checkout">Check Out</Link>
            </Button>
          </Row>
        </Drawer>
        <div>
          <ConfirmModal
            onCancel={this.handleCancel}
            visible={modalVisible}
            product={{ ...productSelected }}
            isUpdating
          />
        </div>
      </div>
    );
  }
}

export default CartDrawer;
