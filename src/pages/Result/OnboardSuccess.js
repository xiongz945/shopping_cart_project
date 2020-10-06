import React from 'react';
import { Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './OnboardSuccess.less';
import features from '../../assets/features.png';
import successCheck from '../../assets/success-image.png';

export default props => {
  const {
    location: { query },
  } = props;

  /* eslint-disable */
  return (
    <PageHeaderWrapper hidePageHeader={true}>
      <Card bordered={false} className={styles.onBoardSuccess}>
        <img src={successCheck} className={styles.greenCheck} alt="" />
        <h3>{formatMessage({ id: 'app.result.onboarded.success.title' })}</h3>
        <p>{formatMessage({ id: 'app.result.onboarded.success.description' })}</p>
        <img src={features} alt="" />
        <br />
        <br />

        {/* eslint-disable */}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={""}
        >
          <Button type="button" className={styles.primaryBtn}>
            Set your Password
          </Button>
        </a>
      </Card>
    </PageHeaderWrapper>
  );
};
