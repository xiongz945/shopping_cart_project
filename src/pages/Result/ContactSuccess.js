import React from 'react';
import { formatMessage } from 'umi/locale';
import { Card } from 'antd';
import Result from '@/components/Result';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';

@connect(({ user }) => ({
  user,
}))
class ContactSuccess extends React.PureComponent {
  render() {
    const {
      user: {
        userInfo: { phNumber },
      },
    } = this.props;
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Result
            type="success"
            title={formatMessage({ id: 'app.result.success.contact.title' })}
            description={formatMessage({ id: 'app.result.success.contact.description' }) + phNumber}
            style={{ marginTop: 48, marginBottom: 16 }}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default ContactSuccess;
