import React, { Component } from 'react';
import { Form, Input, Row, Col, Divider } from 'antd';
import { connect } from 'dva';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';
import ShippingAddressForm from '@/components/ShippingForm/ShippingAddress';
import styles from './index.less';

@connect(({ user }) => ({
  user,
}))
class ShippingForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dummyState: false,
      persistentPersonal: {
        firstName: null,
        lastName: null,
        email: null,
        confirmEmail: null,
        phNumber: null,
        companyName: null,
        dotNumber: null,
      },
      persistentAddress: {
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        country: null,
        zipCode: null,
      },
    };
    this.selectSearchedAddress = this.selectSearchedAddress.bind(this);
    this.handleSelectInSearchBarOptions = this.handleSelectInSearchBarOptions.bind(this);
  }

  componentDidMount() {
    try {
      const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo'));
      if (shippingInfo !== null) {
        this.setState({
          persistentPersonal: {
            firstName: shippingInfo.firstName,
            lastName: shippingInfo.lastName,
            email: shippingInfo.email,
            confirmEmail: shippingInfo.confirmEmail,
            phNumber: shippingInfo.phNumber,
            companyName: shippingInfo.companyName,
            dotNumber: shippingInfo.dotNumber,
          },
          persistentAddress: {
            addressLine1: shippingInfo.addressLine1,
            addressLine2: shippingInfo.addressLine2,
            city: shippingInfo.city,
            state: shippingInfo.state,
            country: shippingInfo.country,
            zipCode: shippingInfo.zipCode,
          },
        });
      }
    } catch (err) {
      return undefined;
    }
    return 0;
  }

  hideError = () => {
    const { dummyState } = this.state;
    const oppositeState = !dummyState;
    this.setState({ dummyState: oppositeState });
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      dispatch,
      form: { validateFields },
      next,
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'user/storeInfo',
          payload: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            confirmEmail: values.confirmEmail,
            phNumber: values.phNumber,
            companyName: values.companyName,
            dotNumber: values.dotNumber,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2,
            city: values.city,
            state: values.state,
            country: values.country,
            zipCode: values.zipCode,
          },
        });
        try {
          localStorage.setItem(
            'shippingInfo',
            JSON.stringify({
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              confirmEmail: values.confirmEmail,
              phNumber: values.phNumber,
              companyName: values.companyName,
              dotNumber: values.dotNumber,
              addressLine1: values.addressLine1,
              addressLine2: values.addressLine2,
              city: values.city,
              state: values.state,
              country: values.country,
              zipCode: values.zipCode,
            })
          );
        } catch (error) {
          return error;
        }

        next();
      }
      return 0;
    });
  };

  compareToEmailAddress = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('email')) {
      callback('Two emails that you enter are inconsistent!');
    } else {
      callback();
    }
  };

  checkPhoneNumber = (rule, value, callback) => {
    const pattern = new RegExp('^[0-9]{3}-[0-9]{3}-[0-9]{4}');
    const patternOnlynumbers = new RegExp('^[0-9]{10}');
    if (patternOnlynumbers.test(value) || pattern.test(`${value}`)) {
      callback();
    } else {
      callback('Please enter correct phone number');
    }
  };

  checkDOTNumber = (rule, value, callback) => {
    const pattern = new RegExp('^[1-9][0-9]{4,11}$');
    const patternZeroAtStart = new RegExp('^[0][0-9]*$');
    if (pattern.test(value)) {
      callback();
    } else if (patternZeroAtStart.test(value)) {
      callback('DOT Number should start with a non-zero digit');
    } else {
      callback('DOT Number length should be between 5 to 12');
    }
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
  
  async selectSearchedAddress() {
    const { addressInSearchBar } = this.props;
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
    // this.setShippingOnLoad(zipCode);
  }

  async handleSelectInSearchBarOptions(address) {
    const { handleChangeInAddressBar } = this.props;
    // await this.setState({ addressInSearchBar: address });
    await handleChangeInAddressBar(address);
    this.selectSearchedAddress();
  }

  renderAddressSearchBar() {
    const { handleChangeInAddressBar, addressInSearchBar } = this.props;
    // const { addressInSearchBar } = this.state;
    return (
      <PlacesAutocomplete
        value={addressInSearchBar}
        onChange={handleChangeInAddressBar}
        onSelect={this.handleSelectInSearchBarOptions}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <div className={styles.searchDropdownWrap}>
              <Input
                className={styles.inputText}
                {...getInputProps({
                  placeholder: 'Search location',
                })}
                // onKeyDown={hideError}
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
    );
  }

  render() {
    const {
      user: {
        userInfo: {
          firstName,
          lastName,
          email,
          confirmEmail,
          phNumber,
          companyName,
          dotNumber,
          addressLine1,
          addressLine2,
          city,
          country,
          state,
          zipCode,
          showAddressSearchBar,
          pendingACHPayment,
        },
      },
      form: { getFieldDecorator, setFieldsValue },
      noExpressShipping,
    } = this.props;
    const { persistentAddress, persistentPersonal } = this.state;
    const address = {
      addressLine1: addressLine1 || persistentAddress.addressLine1,
      addressLine2: addressLine2 || persistentAddress.addressLine2,
      city: city || persistentAddress.city,
      country: country || persistentAddress.country,
      state: state || persistentAddress.state,
      zipCode: zipCode || persistentAddress.zipCode,
      // addressLine1,
      // addressLine2,
      // city,
      // country,
      // state,
      // zipCode
    };
    return (
      <div style={{ backgroundColor: '#FFFFFF', paddingLeft: '5%', paddingTop: '3%' }}>
        <Row className={styles.title}>
          Personal information
          {!firstName && <Divider />}
        </Row>
        <Row>
          <Form id="shipping-form" onSubmit={this.handleSubmit}>
            <Row>
              <Col xs={24} sm={12} className={styles.formLabel}>
                <label htmlFor="firstName">First Name</label>
              </Col>
              <Col xs={24} sm={12} className={styles.formLabel}>
                <label htmlFor="lastName">Last Name</label>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12}>
                <Form.Item>
                  {getFieldDecorator('firstName', {
                    initialValue: firstName || persistentPersonal.firstName,
                    rules: [
                      {
                        required: true,
                        message: 'Please input your first name',
                      },
                    ],
                  })(
                    <Input id="firstName" className={styles.inputText} onKeyDown={this.hideError} />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item>
                  {getFieldDecorator('lastName', {
                    initialValue: lastName || persistentPersonal.lastName,
                    rules: [
                      {
                        required: true,
                        message: 'Please input your last name',
                      },
                    ],
                  })(
                    <Input id="lastName" className={styles.inputText} onKeyDown={this.hideError} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12} className={styles.formLabel}>
                <label htmlFor="email">Email</label>
              </Col>
              <Col xs={24} sm={12} className={styles.formLabel}>
                <label htmlFor="confirmEmail">Email Confirm</label>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12}>
                <Form.Item>
                  {getFieldDecorator('email', {
                    initialValue: email || persistentPersonal.email,
                    rules: [
                      {
                        required: true,
                        message: 'Please input your email address',
                      },
                      {
                        type: 'email',
                        message: 'Please enter valid email address',
                      },
                    ],
                  })(
                    <Input
                      id="email"
                      disabled={pendingACHPayment}
                      className={styles.inputText}
                      onKeyDown={this.hideError}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item>
                  {getFieldDecorator('confirmEmail', {
                    initialValue: confirmEmail || persistentPersonal.confirmEmail,
                    rules: [
                      {
                        required: true,
                        message: 'Please input your email address again',
                      },
                      {
                        type: 'email',
                        message: ' ',
                      },
                      {
                        validator: this.compareToEmailAddress,
                      },
                    ],
                  })(
                    <Input
                      disabled={pendingACHPayment}
                      id="confirmEmail"
                      className={styles.inputText}
                      onKeyDown={this.hideError}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12} className={styles.formLabel}>
                <label htmlFor="phNumber">Phone Number</label>
              </Col>
              <Col xs={24} sm={12} className={styles.formLabel}>
                <label htmlFor="dotNumber">DOT Number</label>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12}>
                <Form.Item>
                  {getFieldDecorator('phNumber', {
                    initialValue: phNumber || persistentPersonal.phNumber,
                    rules: [
                      {
                        required: true,
                        message: 'Please input your phone number',
                      },
                      {
                        validator: this.checkPhoneNumber,
                      },
                    ],
                  })(
                    <Input id="phNumber" className={styles.inputText} onKeyDown={this.hideError} />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item>
                  {getFieldDecorator('dotNumber', {
                    initialValue: dotNumber || persistentPersonal.dotNumber,
                    rules: [
                      {
                        required: true,
                        message: 'Please input your DOT number',
                      },
                      {
                        validator: this.checkDOTNumber,
                      },
                    ],
                  })(
                    <Input
                      disabled={pendingACHPayment}
                      id="dotNumber"
                      className={styles.inputText}
                      onKeyDown={this.hideError}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12} className={styles.formLabel}>
                <label htmlFor="companyName">Company Name</label>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={12}>
                <Form.Item>
                  {getFieldDecorator('companyName', {
                    initialValue: companyName || persistentPersonal.companyName,
                    rules: [
                      {
                        required: true,
                        message: 'Please input your company name',
                      },
                    ],
                  })(
                    <Input
                      id="companyName"
                      className={styles.inputText}
                      onKeyDown={this.hideError}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row>
              {showAddressSearchBar ? (
                this.renderAddressSearchBar()
              ) : (
                <ShippingAddressForm
                  {...this.props}
                  hideError={this.hideError}
                  getFieldDecorator={getFieldDecorator}
                  setFieldsValue={setFieldsValue}
                  address={address}
                  noExpressShipping={noExpressShipping}
                />
              )}
            </Row>
          </Form>
        </Row>
      </div>
    );
  }
}

export default Form.create()(ShippingForm);
