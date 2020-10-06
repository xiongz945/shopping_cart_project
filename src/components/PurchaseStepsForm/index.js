import React from 'react';
import { Row, Form, Input, Col, Button, Steps, Alert, Tooltip, Icon, message } from 'antd';
import { connect } from 'dva';
import { isNumber } from 'lodash';
import InputMask from 'react-input-mask';
import styles from './index.less';
import PaymentCard from '@/components/payment-card';
import Step2Form from './Step2Form';

const { Step } = Steps;

const inputStyle = {
  width: '100%',
};

@connect(({ user, loading }) => ({
  user,
  submitting: loading.effects[('user/current', 'user/storeInfo')],
}))
class PurchaseStepsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dummyState: false,
    };
  }

  componentDidMount() {
    const {
      totalPurchasePrice,
      taxOnDevices,
      noOfSixPins,
      noOfSixteenPins,
      numberOfTrucks,
      numberOfTablets,
      adapterFees,
      totalPeriodicChargeLTE,
      totalDeviceChargeLTE,
      dispatch,
    } = this.props;

    const deviceDetails = {
      totalPurchasePrice,
      taxOnDevices,
      noOfSixPins,
      noOfSixteenPins,
      numberOfTrucks,
      numberOfTablets,
      adapterFees,
      totalPeriodicChargeLTE,
      totalDeviceChargeLTE,
    };

    dispatch({
      type: 'user/setDeviceDetails',
      payload: {
        deviceDetails,
      },
    });
  }

  getErrorOnPurchaseMessage() {
    const {
      user: { errorOnPurchase },
    } = this.props;
    const error = localStorage.getItem('errorOnPurchase');
    if (errorOnPurchase && error !== '') {
      return (
        <Alert
          message="Error On Purchase"
          description={
            <div>
              {errorOnPurchase} <br /> {this.getErrorsList(error)}
              <br />
              If the problem persists, please call +1 650-600-0008. We are available 24/7
            </div>
          }
          type="error"
          closable
          onClose={this.hideError}
        />
      );
    }
    return <div />;
  }

  getErrorsList = errors => {
    if (Array.isArray(errors)) {
      return (
        <ul>
          {errors.map((value, index) => {
            // eslint-disable-next-line react/no-array-index-key
            return <li key={index}>{value}</li>;
          })}
        </ul>
      );
    }
    return <div>{errors}</div>;
  };

  // hiding error on typing and clicking close and then force calling render()
  hideError = () => {
    localStorage.setItem('errorOnPurchase', '');
    const { dummyState } = this.state;
    const oppositeState = !dummyState;
    this.setState({ dummyState: oppositeState });
  };

  next = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/current',
      payload: true,
    });
  };

  prev = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/current',
      payload: false,
    });
  };

  compareToEmailAddress = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('email')) {
      callback('Two emails that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      dispatch,
      form: { validateFields },
      numberOfTrucks,
      numberOfTablets,
      noOfTrucksForm,
      iotPurchase,
    } = this.props;

    const noOfDevices = numberOfTablets || numberOfTrucks;

    if (iotPurchase) {
      validateFields((err, values) => {
        if (!err) {
          dispatch({
            type: 'user/storeInfo',
            payload: {
              fullName: values.fullName,
              email: values.email,
              confirmEmail: values.confirmEmail,
              phNumber: values.phNumber,
              companyName: values.companyName,
              dotNumber: values.dotNumber,
            },
          });
          this.next();
        }
        return 0;
      });
    } else {
      noOfTrucksForm(newError => {
        if (newError && (!isNumber(noOfDevices) || !noOfDevices)) {
          message.error('Please enter number of devices');
        } else {
          validateFields((err, values) => {
            if (!err) {
              dispatch({
                type: 'user/storeInfo',
                payload: {
                  fullName: values.fullName,
                  email: values.email,
                  confirmEmail: values.confirmEmail,
                  phNumber: values.phNumber,
                  companyName: values.companyName,
                  dotNumber: values.dotNumber,
                },
              });
              this.next();
            }
            return 0;
          });
        }
        return 0;
      });
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

  renderPersonalInfo() {
    const {
      user: {
        userInfo: {
          fullName,
          email,
          confirmEmail,
          phNumber,
          companyName,
          dotNumber,
          isNewCustomer,
          pendingACHPayment,
        },
      },
    } = this.props;
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div>
        <Form className={styles.personalInfoForm}>
          <Row>
            <Col span={24}>
              <label className={styles.personalInfoLabel} htmlFor="fullName">
                <b>Full Name &nbsp;</b>
              </label>
              <br />
              <Form.Item className={styles.personalInfoInput}>
                {getFieldDecorator('fullName', {
                  initialValue: fullName,
                  rules: [
                    {
                      required: true,
                      message: 'Please input full name!',
                    },
                  ],
                })(<Input id="fullName" onKeyDown={this.hideError} style={inputStyle} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} md={12}>
              <label className={styles.personalInfoLabel} htmlFor="email">
                <b>Email &nbsp;</b>
              </label>
              <br />
              <Form.Item className={styles.personalInfoInput}>
                {getFieldDecorator('email', {
                  initialValue: email,
                  rules: [
                    {
                      required: true,
                      message: 'Please enter your email address',
                    },
                    {
                      type: 'email',
                      message: 'Please enter valid email address!',
                    },
                  ],
                })(
                  <Input
                    disabled={pendingACHPayment ? 'disabled' : ''}
                    suffix={
                      <Tooltip title="Make sure this is an owner email">
                        <Icon type="info-circle-o" style={{ color: 'rgba(0,0,0,.45)' }} />{' '}
                      </Tooltip>
                    }
                    id="email"
                    onKeyDown={this.hideError}
                    style={inputStyle}
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <label className={styles.personalInfoLabel} htmlFor="confirmEmail">
                <b>Confirm Email &nbsp;</b>
              </label>
              <br />
              <Form.Item className={styles.personalInfoInput}>
                {getFieldDecorator('confirmEmail', {
                  initialValue: confirmEmail,
                  rules: [
                    {
                      required: true,
                      message: 'Please enter your email address',
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
                    disabled={pendingACHPayment ? 'disabled' : ''}
                    id="confirmEmail"
                    onKeyDown={this.hideError}
                    style={inputStyle}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} md={12}>
              <label className={styles.personalInfoLabel} htmlFor="phNumber">
                <b>Phone Number &nbsp;</b>
              </label>
              <br />
              <Form.Item className={styles.personalInfoInput}>
                {getFieldDecorator('phNumber', {
                  initialValue: phNumber,
                  rules: [
                    { required: true, message: 'Please input your phone number!' },
                    {
                      validator: this.checkPhoneNumber,
                    },
                  ],
                })(
                  <InputMask
                    className={styles.devicesInfoPhNumber}
                    id="phNumber"
                    style={inputStyle}
                    type="tel"
                    mask="999-999-9999"
                    alwaysShowMask="true"
                    maskChar="_"
                    onKeyDown={this.hideError}
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <label className={styles.personalInfoLabel} htmlFor="dotNumber">
                <b>DOT Number &nbsp;</b>
              </label>
              <br />
              <Form.Item className={styles.personalInfoInput}>
                {getFieldDecorator('dotNumber', {
                  initialValue: dotNumber,
                  rules: [
                    {
                      required: true,
                      message: 'Please input your DOT Number!',
                    },
                    {
                      validator: this.checkDOTNumber,
                    },
                  ],
                })(
                  <Input
                    min="1"
                    type="number"
                    id="dotNumber"
                    disabled={isNewCustomer || pendingACHPayment ? 'disabled' : ''}
                    onKeyDown={this.hideError}
                    style={inputStyle}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <label className={styles.personalInfoLabel} htmlFor="companyName">
                <b>Company Name &nbsp;</b>
              </label>
              <br />
              <Form.Item className={styles.personalInfoInput}>
                {getFieldDecorator('companyName', {
                  initialValue: companyName,
                  rules: [{ required: true, message: 'Please input your company name!' }],
                })(<Input id="companyName" onKeyDown={this.hideError} style={inputStyle} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item>
                <Button type="primary" onClick={this.handleSubmit}>
                  Next
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }

  renderCheckoutForm() {
    const {
      totalPurchasePrice,
      taxOnDevices,
      noOfSixPins,
      noOfSixteenPins,
      numberOfTrucks,
      numberOfTablets,
      adapterFees,
      totalPeriodicChargeLTE,
      totalDeviceChargeLTE,
      noOfTrucksForm,
      iotPurchase,
    } = this.props;

    const billingDetails = {
      last_4: '2343',
      numberOfTrucks,
      numberOfTablets,
    };

    const deviceAndPersonalDetails = {
      totalPurchasePrice,
      taxOnDevices,
      noOfSixPins,
      noOfSixteenPins,
      numberOfTrucks,
      numberOfTablets,
    };
    return (
      <div>
        <PaymentCard
          iotPurchase={iotPurchase}
          isNew={false}
          billingDetails={billingDetails}
          deviceAndPersonalDetails={deviceAndPersonalDetails}
          prevHandler={this.prev}
          hideError={this.hideError}
          adapterFees={adapterFees}
          totalPeriodicChargeLTE={totalPeriodicChargeLTE}
          totalDeviceChargeLTE={totalDeviceChargeLTE}
          noOfTrucksForm={noOfTrucksForm}
        />
      </div>
    );
  }

  render() {
    const {
      user: { currentStep },
      numberOfTrucks,
      noOfTrucksForm,
      numberOfTablets,
      iotPurchase,
    } = this.props;
    const steps = [
      {
        title: 'Personal Info',
        content: this.renderPersonalInfo(),
      },
      {
        title: 'Shipping Address',
        content: (
          <Step2Form
            iotPurchase={iotPurchase}
            numberOfTrucks={numberOfTrucks}
            numberOfTablets={numberOfTablets}
            nextHandler={this.next}
            prevHandler={this.prev}
            stateValues={this.state}
            hideError={this.hideError}
            noOfTrucksForm={noOfTrucksForm}
          />
        ),
      },
      {
        title: 'Payment Details',
        content: this.renderCheckoutForm(),
      },
    ];
    return (
      <div className={styles.stepsBox}>
        <Steps current={currentStep}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className={styles.stepsWrapper}>{this.getErrorOnPurchaseMessage()}</div>
        <div className={styles.stepsWrapper}>
          <div className={styles.stepsContent}>{steps[currentStep].content}</div>
        </div>
      </div>
    );
  }
}

export default Form.create()(PurchaseStepsForm);
