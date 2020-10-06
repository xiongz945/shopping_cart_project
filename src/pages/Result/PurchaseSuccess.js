import React from 'react';
import { formatMessage } from 'umi/locale';
import { Card } from 'antd';
import Result from '@/components/Result';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

/* const extra = (
  <Fragment>
    <div
      style={{
        fontSize: 16,
        color: 'rgba(0, 0, 0, 0.85)',
        fontWeight: '500',
        marginBottom: 20,
      }}
    >
      <FormattedMessage id="app.result.success.operate-title" defaultMessage="Project Name" />
    </div>
    <Row style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={12} lg={12} xl={6}>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
          <FormattedMessage id="app.result.success.operate-id" defaultMessage="Project ID：" />
        </span>
        23421
      </Col>
      <Col xs={24} sm={12} md={12} lg={12} xl={6}>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
          <FormattedMessage id="app.result.success.principal" defaultMessage="Principal：" />
        </span>
        <FormattedMessage id="app.result.success.step1-operator" defaultMessage="Qu Lili" />
      </Col>
      <Col xs={24} sm={24} md={24} lg={24} xl={12}>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
          <FormattedMessage
            id="app.result.success.operate-time"
            defaultMessage="Effective time："
          />
        </span>
        2016-12-12 ~ 2017-12-12
      </Col>
    </Row>
    <Steps style={{ marginLeft: -42, width: 'calc(100% + 84px)' }} progressDot current={1}>
      <Step
        title={
          <span style={{ fontSize: 14 }}>
            <FormattedMessage id="app.result.success.step1-title" defaultMessage="Create project" />
          </span>
        }
        description={desc1}
      />
      <Step
        title={
          <span style={{ fontSize: 14 }}>
            <FormattedMessage
              id="app.result.success.step2-title"
              defaultMessage="Departmental preliminary review"
            />
          </span>
        }
        description={desc2}
      />
      <Step
        title={
          <span style={{ fontSize: 14 }}>
            <FormattedMessage
              id="app.result.success.step3-title"
              defaultMessage="Financial review"
            />
          </span>
        }
      />
      <Step
        title={
          <span style={{ fontSize: 14 }}>
            <FormattedMessage id="app.result.success.step4-title" defaultMessage="Finish" />
          </span>
        }
      />
    </Steps>
  </Fragment>
); */

/* const actions = (
  <Fragment>
    <Button type="primary">
      <FormattedMessage id="app.result.success.btn-return" defaultMessage="Back to list" />
    </Button>
    <Button>
      <FormattedMessage id="app.result.success.btn-project" defaultMessage="View project" />
    </Button>
    <Button>
      <FormattedMessage id="app.result.success.btn-print" defaultMessage="Print" />
    </Button>
  </Fragment>
); */

export default () => (
  <PageHeaderWrapper>
    <Card bordered={false}>
      <Result
        type="success"
        title={formatMessage({ id: 'app.result.success.title' })}
        description={formatMessage({ id: 'app.result.success.description' })}
        style={{ marginTop: 48, marginBottom: 16 }}
      />
    </Card>
  </PageHeaderWrapper>
);
