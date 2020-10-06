import React, { Component } from 'react';
import { PlaidLink } from 'react-plaid-link';
import { connect } from 'dva';
import { Button } from 'antd/lib';
import styles from './NewACHPayment.less';

@connect(({ user, loading }) => ({
  user,
  submitting: loading.effects['user/purchase'],
}))
@connect(({ reseller }) => ({
  reseller,
}))
class NewACHPayment extends Component {
  getCoupon() {
    const {
      plans: { selectedPlan },
      user: {
        couponCode,
        duration,
        isPurchaseLTE,
        userInfo: { isNewCustomer },
      },
    } = this.props;

    if (isNewCustomer) {
      return selectedPlan[selectedPlan.selectedDuration].coupon;
    }
    return (duration === 'yearly' || isPurchaseLTE) && couponCode.isValid ? couponCode.name : null;
  }

  handleOnSuccess = (publicToken, metadata) => {
    // send token to server
    const { onCardSubmit } = this.props;

    const plaidSettings = {
      publicToken,
      accountID: metadata.account_id ? metadata.account_id : metadata.accounts[0].id,
    };

    onCardSubmit({ token: true }, null, plaidSettings);
  };

  render() {
    return (
      <span className={styles.payButtonWrapper}>
        <PlaidLink
          clientName="Demo Inc"
          env={PLAID_ENV}
          product={['auth', 'transactions']}
          publicKey={PLAID_PUBLIC_KEY}
          onSuccess={this.handleOnSuccess}
        >
          <Button type="primary" className={styles.payButton}>
            Pay Using ACH
          </Button>
        </PlaidLink>
      </span>
    );
  }
}

export default NewACHPayment;
