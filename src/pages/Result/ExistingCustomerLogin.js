import React from 'react';
import { Card } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './OnboardSuccess.less';
import successCheck from '../../assets/success-image.png';

export default () => {
  return (
    <PageHeaderWrapper>
      <Card bordered={false} className={styles.onBoardSuccess}>
        {/* <Result
            type="success"
            title={formatMessage({ id: 'app.result.onboarded.success.title' })}
            description={formatMessage({ id: 'app.result.onboarded.success.description' })}
            style={{ marginTop: 48, marginBottom: 16 }}
          /> */}
        <img src={successCheck} className={styles.greenCheck} alt="" />
        <h3>Welcome back to Webapp</h3>
        <p>If you want to add more Trucks, Call us!</p>
        <br />
        <div className={styles.supportSection}>
          <p>
            24/7 Support Call <span>+1 650-499-4800</span>
          </p>
        </div>
        <br />
        <p>Or</p>
        <br />
        {/* eslint-disable */}
        <a target="_blank" rel="noopener noreferrer" href="">
          <button className={`${styles.primaryBtn} ${styles.withExtraPadding}`}>Login</button>
        </a>
      </Card>
    </PageHeaderWrapper>
  );
};
