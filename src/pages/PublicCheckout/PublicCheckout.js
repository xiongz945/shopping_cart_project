import React, { Component } from 'react';
import { AsyncLoadBizCharts } from '@/components/Charts/AsyncLoadBizCharts';
import { connect } from 'dva';
import Checkout from '../Checkout/Checkout';

@connect(({ user }) => ({
  user,
}))
class PublicCheckout extends Component {
  constructor(props) {
    super(props);

    const { dispatch } = this.props;
    dispatch({
      type: 'user/setNoCommission',
    });

    const {
      location: { query },
    } = this.props;

    let achPaymentUniqueLink = null;
    if (query.ach_payment) {
      achPaymentUniqueLink = query.ach_payment;
      dispatch({
        type: 'user/newFetchACHPendingPaymentDetails',
        payload: {
          achPaymentUniqueLink,
        },
      });
    }

    let enableCreditCard = false;
    if (query.enable_cc === 'true') {
      enableCreditCard = true;
      dispatch({
        type: 'user/enableCreditCardOption',
        payload: {
          data: { enableCreditCard },
        },
      });
    }

    const {
      user: { couponToApply },
    } = this.props;
    if (couponToApply !== null) {
      dispatch({
        type: 'user/validateCouponCode',
        payload: {
          couponCode: couponToApply,
        },
      });
    }
  }

  render() {
    return <Checkout />;
  }
}

export default props => (
  <AsyncLoadBizCharts>
    <PublicCheckout {...props} />
  </AsyncLoadBizCharts>
);
