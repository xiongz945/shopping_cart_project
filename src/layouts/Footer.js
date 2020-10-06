import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';

const { Footer } = Layout;
const FooterView = () => (
  <Footer style={{ padding: 0 }}>
    <GlobalFooter
      links={[
        {
          key: 'Privacy',
          title: 'Privacy',
          href: 'https://google.com/privacy',
          blankTarget: true,
        },
        {
          key: 'Terms & Conditions',
          title: 'Terms & Conditions',
          href: 'https://google.com/terms-conditions',
          blankTarget: true,
        },
      ]}
      copyright={
        <Fragment>
          Copyright <Icon type="copyright" /> All rights reserved.
        </Fragment>
      }
    />
  </Footer>
);
export default FooterView;
