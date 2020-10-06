import React from 'react';
import { Row, Form, Input, Col, Button, Alert, Radio, Spin, Select, message } from 'antd';
import { connect } from 'dva';
import _, { isNumber } from 'lodash';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';

import styles from './index.less';
import Countries from '@/constants/Countries';
import AmericanStates from '../../constants/AmericanStates';
import CanadianStates from '../../constants/CanadianStates';
import MexicanStates from '../../constants/MexicanStates';

const inputStyle = {
  width: '100%',
};
@connect(({ user, loading }) => ({
  user,
  submitting: loading.effects['user/shipping'],
}))
class Step2Form extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      addressInSearchBar: '',
      dropdownCountry: 'US',
    };
    this.selectSearchedAddress = this.selectSearchedAddress.bind(this);
    this.hendleSelectInSearchBarOptions = this.hendleSelectInSearchBarOptions.bind(this);
  }

  setShippingComponent(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/shipping',
      payload,
    });
  }

  setShippingOnLoad(zipCode) {
    const {
      form: { getFieldsValue },
    } = this.props;
    this.setShippingComponent({
      ...getFieldsValue(),
      quickShipping: 'no',
      destination: zipCode,
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

  showSearchBar = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/storeInfo',
      payload: {
        showAddressSearchBar: true,
      },
    });
  };

  onCountrySelect = value => {
    const {
      form: { setFieldsValue },
    } = this.props;

    this.setState({ dropdownCountry: value }, () => {
      setFieldsValue({
        state: '',
      });
    });
  };

  showEditFields = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/storeInfo',
      payload: {
        showAddressSearchBar: false,
      },
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      nextHandler,
      dispatch,
      form: { validateFields },
      numberOfTrucks,
      noOfTrucksForm,
      numberOfTablets,
      iotPurchase,
    } = this.props;

    if (iotPurchase) {
      validateFields((err, values) => {
        if (!err) {
          dispatch({
            type: 'user/storeInfo',
            payload: {
              addressLine1: values.addressLine1,
              addressLine2: values.addressLine2,
              city: values.city,
              state: values.state,
              country: values.country,
              zipCode: values.zipCode,
            },
          });
          nextHandler();
        }
        return 0;
      });
    } else {
      const noOfDevices = numberOfTablets || numberOfTrucks;

      noOfTrucksForm(newError => {
        if ((newError && !isNumber(noOfDevices)) || !noOfDevices) {
          message.error('Please enter number of devices');
        } else {
          validateFields((err, values) => {
            if (!err) {
              dispatch({
                type: 'user/storeInfo',
                payload: {
                  addressLine1: values.addressLine1,
                  addressLine2: values.addressLine2,
                  city: values.city,
                  state: values.state,
                  country: values.country,
                  zipCode: values.zipCode,
                },
              });
              nextHandler();
            }
            return 0;
          });
        }
        return 0;
      });
    }
  };

  handleChangeInAddressBar = address => {
    this.setState({ addressInSearchBar: address });
  };

  quickShippingChange = ({ target }) => {
    const {
      form: { validateFields },
    } = this.props;

    validateFields((err, values) => {
      if (err) {
        throw err;
      }
      this.setShippingComponent({
        ...values,
        quickShipping: target.value,
        destination: values.zipCode,
      });
    });
  };

  clearFields = () => {
    const { dispatch } = this.props;

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
  };

  async hendleSelectInSearchBarOptions(address) {
    await this.setState({ addressInSearchBar: address });
    this.selectSearchedAddress();
  }

  async selectSearchedAddress() {
    const { addressInSearchBar } = this.state;
    const { dispatch } = this.props;

    const results = await geocodeByAddress(addressInSearchBar);
    const addressComponents = results[0].address_components;
    const components = {};

    _.each(addressComponents, (k, v1) => {
      _.each(addressComponents[v1].types, (k2, v2) => {
        components[addressComponents[v1].types[v2]] = addressComponents[v1];
      });
    });

    const addressLine1 =
      ('street_number' in components ? `${components.street_number.long_name} ` : '') +
      ('route' in components ? `${components.route.long_name} ` : '') +
      ('sublocality' in components ? `${components.sublocality.long_name} ` : '');

    const addressLine2 =
      ('premise' in components ? components.premise.long_name : '') +
      ('subpremise' in components ? components.subpremise.long_name : '');

    let city = 'locality' in components ? components.locality.long_name : '';
    if (!city) {
      city =
        'administrative_area_level_2' in components
          ? components.administrative_area_level_2.long_name
          : '';
    }
    const zipCode = 'postal_code' in components ? components.postal_code.long_name : '';

    dispatch({
      type: 'user/storeInfo',
      payload: {
        addressLine1,
        addressLine2,
        city,
        state:
          'administrative_area_level_1' in components
            ? components.administrative_area_level_1.short_name
            : '',
        country: 'country' in components ? components.country.short_name : '',
        zipCode,
        showAddressSearchBar: false,
      },
    });
    this.setShippingOnLoad(zipCode);
  }

  showShippingOptions() {
    const {
      iotPurchase,
      user: {
        quickShipping,
        expressDeliveryDetails,
        deliveryCheck,
        isPurchaseLTE,
        userInfo: { isNewCustomer },
      },
    } = this.props;

    if (isPurchaseLTE) {
      return '';
    }

    if (isNewCustomer || iotPurchase) {
      return (
        <Row>
          <Alert message="Devices will be shipped in 2-3 business days" type="info" />
        </Row>
      );
    }

    let deliveryPlaceholder = null;

    if (deliveryCheck) {
      deliveryPlaceholder = <Spin />;
    } else {
      if (expressDeliveryDetails && expressDeliveryDetails !== 'none') {
        deliveryPlaceholder = <Alert message={expressDeliveryDetails} type="info" />;
      }
      if (expressDeliveryDetails && expressDeliveryDetails === 'none') {
        deliveryPlaceholder = (
          <Alert message="Something went wrong. Please try again" type="error" />
        );
      }
    }
    let shippingOptions = '';
    if (!isPurchaseLTE && !iotPurchase) {
      shippingOptions = (
        <Form.Item>
          <Radio.Group onChange={this.quickShippingChange} value={quickShipping}>
            <Radio value="yes">
              1-day Express Shipping <br />
              (Mon-Fri before 2pm PT)? ($20 extra)
            </Radio>
            <Radio value="no">Package Services</Radio>
          </Radio.Group>
        </Form.Item>
      );
    }

    return (
      <Row>
        {shippingOptions}
        {deliveryPlaceholder}
      </Row>
    );
  }

  showAddressFields() {
    const {
      form: { getFieldDecorator },
      prevHandler,

      user: {
        userInfo: {
          addressLine1,
          addressLine2,
          city,
          state,
          country,
          zipCode,
          showAddressSearchBar,
        },
      },
      hideError,
    } = this.props;
    const { addressInSearchBar, dropdownCountry } = this.state;
    if (showAddressSearchBar) {
      return (
        <div className={styles.searchBox}>
          <PlacesAutocomplete
            value={addressInSearchBar}
            onChange={this.handleChangeInAddressBar}
            onSelect={this.hendleSelectInSearchBarOptions}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div>
                <div className={styles.searchDropdownWrap}>
                  <Input
                    {...getInputProps({
                      placeholder: 'Search location',
                    })}
                    onKeyDown={hideError}
                  />{' '}
                  <div className={styles.autocompleteDropdownContainer}>
                    {loading && <div>Loading...</div>}
                    {suggestions.map(suggestion => {
                      const className = suggestion.active
                        ? 'suggestion-item--active'
                        : 'suggestion-item';
                      // inline style for demonstration purpose
                      const style = suggestion.active
                        ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                        : { backgroundColor: '#ffffff', cursor: 'pointer' };
                      return (
                        <div
                          {...getSuggestionItemProps(suggestion, {
                            className,
                            style,
                          })}
                        >
                          <span>{suggestion.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.enterBtnSearch}>
                  <a onClick={this.showEditFields}>
                    <b>Enter address manually</b>
                  </a>
                </div>
              </div>
            )}
          </PlacesAutocomplete>
          <br />
          <br />
          <Row>
            <Col span={24}>
              <Form.Item>
                <Button style={{ marginLeft: 8 }} onClick={prevHandler}>
                  Previous
                </Button>
                &nbsp;&nbsp;&nbsp;
                <Button
                  type="primary"
                  onClick={this.selectSearchedAddress}
                  disabled={addressInSearchBar === ''}
                >
                  Next
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <Form className={styles.personalInfoForm}>
        <Row>
          <Col span={24}>
            <label className={styles.personalInfoLabel} htmlFor="addressLine1">
              <b>Street Name &nbsp;</b>
            </label>
            <br />
            <Form.Item className={styles.personalInfoInput}>
              {getFieldDecorator('addressLine1', {
                initialValue: addressLine1,
                rules: [{ required: true, message: 'Street Name Required' }],
              })(<Input id="addressLine1" type="text" onKeyDown={hideError} style={inputStyle} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <label className={styles.personalInfoLabel} htmlFor="addressLine2">
              <b>APT/SUIT &nbsp;</b>
            </label>
            <br />
            <Form.Item className={styles.personalInfoInput}>
              {getFieldDecorator('addressLine2', {
                initialValue: addressLine2,
              })(<Input id="addressLine2" type="text" onKeyDown={hideError} style={inputStyle} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xs={24} md={12}>
            <label className={styles.personalInfoLabel} htmlFor="city">
              <b>City &nbsp;</b>
            </label>
            <br />
            <Form.Item className={styles.personalInfoInput}>
              {getFieldDecorator('city', {
                initialValue: city,
                rules: [{ required: true, message: 'City Name Required' }],
              })(<Input id="city" type="text" onKeyDown={hideError} style={inputStyle} />)}
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <label className={styles.personalInfoLabel} htmlFor="country">
              <b>Country &nbsp;</b>
            </label>
            <br />
            <Form.Item className={styles.personalInfoInput}>
              {getFieldDecorator('country', {
                initialValue: country,
                rules: [{ required: true, message: 'Country Required' }],
              })(
                <Select
                  onSelect={this.onCountrySelect}
                  placeholder="Choose country"
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
          <Col xs={24} md={12}>
            <label className={styles.personalInfoLabel} htmlFor="zipCode">
              <b>Zip Code &nbsp;</b>
            </label>
            <br />
            <Form.Item className={styles.personalInfoInput}>
              {getFieldDecorator('zipCode', {
                initialValue: zipCode,
                rules: [{ required: true, message: 'Zipcode Required' }],
              })(<Input id="zipCode" type="number" onKeyDown={hideError} style={inputStyle} />)}
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <label className={styles.personalInfoLabel} htmlFor="state">
              <b>State &nbsp;</b>
            </label>
            <br />
            <Form.Item className={styles.personalInfoInput}>
              {getFieldDecorator('state', {
                initialValue: state,
                rules: [{ required: true, message: 'State Name Required' }],
              })(
                <Select
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
        {this.showShippingOptions()}
        <Row>
          <Col span={24}>
            <Form.Item>
              <Button style={{ marginLeft: 8 }} onClick={prevHandler}>
                Previous
              </Button>
              &nbsp;&nbsp;&nbsp;
              <Button type="primary" onClick={this.handleSubmit}>
                Next
              </Button>
              <a onClick={this.showSearchBar}> Search different address </a>
              <Button
                style={{ float: 'right', marginTop: 5 }}
                type="danger"
                onClick={this.clearFields}
              >
                Clear Fields
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    return <div>{this.showAddressFields()}</div>;
  }
}

export default Form.create({ name: 'devices-address' })(Step2Form);
