import React, { PureComponent } from 'react';
import { bool } from 'prop-types';
import RightContent from '../GlobalHeader/RightContent';
import BaseMenu from '../SiderMenu/BaseMenu';
import { getFlatMenuKeys } from '../SiderMenu/SiderMenuUtils';
import styles from './index.less';

export default class TopNavHeader extends PureComponent {
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

  render() {
    const { theme, contentWidth, menuData, logo, showRightContent, showBaseMenu } = this.props;
    const { maxWidth } = this.state;
    const flatMenuKeys = getFlatMenuKeys(menuData);
    return (
      <div className={`${styles.head} ${styles.onboardHeader} ${theme === 'light' ? styles.light : styles.dark}`}>
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
            >
              {showBaseMenu ? (
                <BaseMenu {...this.props} flatMenuKeys={flatMenuKeys} className={styles.menu} />
              ) : null}
            </div>
          </div>
          {showRightContent ? <RightContent {...this.props} /> : null}
        </div>
      </div>
    );
  }
}
