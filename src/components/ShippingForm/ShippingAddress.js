import React, { Component } from 'react';
import { Form, Row, Col, Button, Input, Select, Alert, Spin } from 'antd';
import Countries from '@/constants/Countries';
import AmericanStates from '../../constants/AmericanStates';
import CanadianStates from '../../constants/CanadianStates';
import MexicanStates from '../../constants/MexicanStates';
import selectedPic from '../../assets/add-cart-success.png';
import styles from './index.less';

class ShippingAddressForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownCountry: 'US',
    };
  }

  setShippingComponent(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/shipping',
      payload,
    });
  }

  getStatesComponent = country => {
    let states = [];
    switch (country) {
      case 'US':
        states = AmericanStates;
        break;
      case 'CA':
        states = CanadianStates;
        break;
      default:
        states = MexicanStates;
        break;
    }
    return states.map(singleState => (
      <Select.Option key={singleState.code} value={singleState.code}>
        {singleState.name}
      </Select.Option>
    ));
  };

  onCountrySelect = value => {
    const { setFieldsValue } = this.props;

    this.setState({ dropdownCountry: value }, () => {
      setFieldsValue({
        state: '',
      });
    });
  };

  quickShippingChange = val => {
    const {
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (err) {
        throw err;
      }
      this.setShippingComponent({
        quickShipping: val,
        destination: values.zipCode,
      });
    });
  };

  clearFields = () => {
    const {
      form: { resetFields },
      dispatch,
    } = this.props;

    dispatch({
      type: 'user/storeInfo',
      payload: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
    });
    resetFields();
  };

  showSearchBar = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/storeInfo',
      payload: {
        showAddressSearchBar: true,
      },
    });
  };

  showShippingTime() {
    const {
      user: { expressDeliveryDetails, deliveryCheck },
    } = this.props;

    let deliveryTip = null;

    if (deliveryCheck) {
      deliveryTip = <Spin />;
    } else {
      if (expressDeliveryDetails && expressDeliveryDetails !== 'none') {
        deliveryTip = <Alert message={expressDeliveryDetails} type="info" />;
      }
      if (expressDeliveryDetails && expressDeliveryDetails === 'none') {
        deliveryTip = <Alert message="Something went wrong. Please try again" type="error" />;
      }
    }

    return <div>{deliveryTip}</div>;
  }

  render() {
    const { getFieldDecorator, hideError, address, noExpressShipping } = this.props;
    const { dropdownCountry } = this.state;
    return (
      <div>
        <Row>
          <Col span={8} className={styles.title}>
            Shipping Address
          </Col>
          {/* <Col span={8}>
            <Button type="default" onClick={this.clearFields} className={styles.clearButton}>
              Clear
            </Button>
          </Col> */}
          <Col>
            <a onClick={this.showSearchBar}> Search different address </a>
          </Col>
        </Row>
        <Row>
          <Row>
            <Col xs={24} sm={12} className={styles.formLabel}>
              <label htmlFor="addressLine1">Street Name</label>
            </Col>
            <Col xs={24} sm={12} className={styles.formLabel}>
              <label htmlFor="addressLine2">Apt/Suite</label>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={12}>
              <Form.Item>
                {getFieldDecorator('addressLine1', {
                  initialValue: address.addressLine1,
                  rules: [
                    {
                      required: true,
                      message: 'Street Name Required',
                    },
                  ],
                })(
                  <Input
                    className={styles.inputText}
                    id="addressLine1"
                    type="text"
                    onKeyDown={hideError}
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item>
                {getFieldDecorator('addressLine2', {
                  initialValue: address.addressLine2,
                })(
                  <Input
                    className={styles.inputText}
                    id="addressLine2"
                    type="text"
                    onKeyDown={hideError}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={12} className={styles.formLabel}>
              <label htmlFor="city">City</label>
            </Col>
            <Col xs={24} sm={12} className={styles.formLabel}>
              <label htmlFor="country">Country</label>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={12}>
              <Form.Item>
                {getFieldDecorator('city', {
                  initialValue: address.city,
                  rules: [
                    {
                      required: true,
                      message: 'City Name Required',
                    },
                  ],
                })(
                  <Input className={styles.inputText} id="city" type="text" onKeyDown={hideError} />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item>
                {getFieldDecorator('country', {
                  initialValue: address.country,
                  rules: [
                    {
                      required: true,
                      message: 'Country Required',
                    },
                  ],
                })(
                  <Select
                    className={styles['override-ant-select-selection']}
                    onSelect={this.onCountrySelect}
                    placeholder="Choose Country"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {Countries.map(singleCountry => (
                      <Select.Option key={singleCountry.code} value={singleCountry.code}>
                        {singleCountry.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={12} className={styles.formLabel}>
              <label htmlFor="zipCode">Zip Code</label>
            </Col>
            <Col xs={24} sm={12} className={styles.formLabel}>
              <label htmlFor="state">State</label>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={12}>
              <Form.Item>
                {getFieldDecorator('zipCode', {
                  initialValue: address.zipCode,
                  rules: [
                    {
                      required: true,
                      message: 'Zipcode Required',
                    },
                  ],
                })(
                  <Input
                    className={styles.inputText}
                    id="zipCode"
                    type="number"
                    onKeyDown={hideError}
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item>
                {getFieldDecorator('state', {
                  initialValue: address.state,
                  rules: [
                    {
                      required: true,
                      message: 'State Name Required',
                    },
                  ],
                })(
                  <Select
                    className={styles['override-ant-select-selection']}
                    dropdownMenuStyle={{ width: '80%' }}
                    dropdownStyle={{ width: '80%' }}
                    placeholder="Choose State"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    <Select.Option value="">Choose State</Select.Option>
                    {this.getStatesComponent(dropdownCountry)}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={12}>
              <Form.Item>
                <Button
                  style={noExpressShipping ? { visibility: 'hidden' } : {}}
                  className={styles.deliveryCard}
                  value="yes"
                  onClick={e => this.quickShippingChange(e.currentTarget.value)}
                >
                  <div>
                    <Col span={4}>
                      <img src={selectedPic} alt="Delivery Selection" />
                    </Col>
                    <Col span={16}>
                      <Row className={styles.deliveryTitle}>1 Day Express Shipping</Row>
                      <Row>$20 Extra</Row>
                      <Row className={styles.deliveryDesc}>(Mon-Fri before 2pm PT)</Row>
                    </Col>
                  </div>
                </Button>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item>
                <Button
                  className={styles.deliveryCard}
                  value="no"
                  onClick={e => this.quickShippingChange(e.currentTarget.value)}
                >
                  <Row>
                    <Col span={4}>
                      <img src={selectedPic} alt="Delivery Selection" />
                    </Col>
                    <Col span={16}>
                      <Row className={styles.deliveryTitle}>Priority Shipping</Row>
                      <Row className={styles.deliveryDesc}>Delivered</Row>
                    </Col>
                  </Row>
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Row>{this.showShippingTime()}</Row>
        </Row>
      </div>
    );
  }
}

export default ShippingAddressForm;
