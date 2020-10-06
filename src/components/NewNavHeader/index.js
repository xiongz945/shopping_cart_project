import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { bool } from 'prop-types';
import RightContent from '../GlobalHeader/RightContent';
import styles from './index.less';

@connect(({ user }) => ({
  user,
}))
@connect(({ cart }) => ({
  cart,
}))
class NewNavHeader extends PureComponent {
  static propTypes = {
    showRightContent: bool,
    showBaseMenu: bool,
  };

  static defaultProps = {
    showRightContent: true,
    showBaseMenu: true,
  };

  state = {
    maxWidth: undefined,
  };

  static getDerivedStateFromProps(props) {
    return {
      maxWidth: (props.contentWidth === 'Fixed' ? 1200 : window.innerWidth) - 280 - 165 - 40,
    };
  }

  handleShowCart = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'cart/toggleCart',
      payload: true,
    });
  };

  render() {
    const {
      theme,
      contentWidth,
      logo,
      showRightContent,
      cart: { totalInCart, showCartButton },
    } = this.props;
    const { maxWidth } = this.state;
    return (
      <div
        className={`${styles.head} ${styles.onboardHeader} ${
          theme === 'light' ? styles.light : styles.dark
        }`}
      >
        <div
          ref={ref => {
            this.maim = ref;
          }}
          className={`${styles.main} ${contentWidth === 'Fixed' ? styles.wide : ''}`}
        >
          <div className={styles.left}>
            <div className={styles.logo} key="logo" id="logo">
              <a href="https://www.google.com">
                <img src={logo} alt="logo" />
              </a>
            </div>
            <div
              style={{
                maxWidth,
              }}
            />
          </div>
          {showRightContent ? <RightContent {...this.props} /> : ''}
          {showCartButton ? (
            <RightContent
              {...this.props}
              cartCount={totalInCart}
              showCartButton={showCartButton}
              handleShowCart={this.handleShowCart}
            />
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

export default NewNavHeader;
