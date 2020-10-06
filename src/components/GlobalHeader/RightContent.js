import React, { PureComponent } from 'react';
import { FormattedMessage } from 'umi/locale';
import { Spin, Tag, Menu, Icon, Avatar, Row, Col } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export default class GlobalHeaderRight extends PureComponent {
  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  getUnreadData = noticeData => {
    const unreadMsg = {};
    Object.entries(noticeData).forEach(([key, value]) => {
      if (!unreadMsg[key]) {
        unreadMsg[key] = 0;
      }
      if (Array.isArray(value)) {
        unreadMsg[key] = value.filter(item => !item.read).length;
      }
    });
    return unreadMsg;
  };

  changeReadState = clickedItem => {
    const { id } = clickedItem;
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeNoticeReadState',
      payload: id,
    });
  };

  render() {
    const {
      currentUser,
      onMenuClick,
      theme,
      showCartButton,
      cartCount,
      handleShowCart,
    } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        {/* <Menu.Item key="userCenter">
          <Icon type="user" />
          <FormattedMessage id="menu.account.center" defaultMessage="account center" />
        </Menu.Item> */}
        {/* <Menu.Item key="userinfo">
          <Icon type="setting" />
          <FormattedMessage id="menu.account.settings" defaultMessage="account settings" />
        </Menu.Item> */}
        <Menu.Divider />
        <Menu.Item key="logout">
          <Icon type="logout" />
          <FormattedMessage id="menu.account.logout" defaultMessage="logout" />
        </Menu.Item>
      </Menu>
    );
    let className = styles.right;
    if (theme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }
    return (
      <div>
        <div className={className}>
          {/* <HeaderSearch
            className={`${styles.action} ${styles.search}`}
            placeholder={formatMessage({ id: 'component.globalHeader.search' })}
            dataSource={[
              formatMessage({ id: 'component.globalHeader.search.example1' }),
              formatMessage({ id: 'component.globalHeader.search.example2' }),
              formatMessage({ id: 'component.globalHeader.search.example3' }),
            ]}
            onSearch={value => {
              console.log('input', value); // eslint-disable-line
            }}
            onPressEnter={value => {
              console.log('enter', value); // eslint-disable-line
            }}
          /> */}

          {/* <NoticeIcon
            className={styles.action}
            count={currentUser.unreadCount}
            onItemClick={(item, tabProps) => {
              console.log(item, tabProps); // eslint-disable-line
              this.changeReadState(item, tabProps);
            }}
            loading={fetchingNotices}
            locale={{
              emptyText: formatMessage({ id: 'component.noticeIcon.empty' }),
              clear: formatMessage({ id: 'component.noticeIcon.clear' }),
              viewMore: formatMessage({ id: 'component.noticeIcon.view-more' }),
              notification: formatMessage({ id: 'component.globalHeader.notification' }),
              message: formatMessage({ id: 'component.globalHeader.message' }),
              event: formatMessage({ id: 'component.globalHeader.event' }),
            }}
            onClear={onNoticeClear}
            onPopupVisibleChange={onNoticeVisibleChange}
            onViewMore={() => message.info('Click on view more')}
            clearClose
          >
            <NoticeIcon.Tab
              count={unreadMsg.notification}
              list={noticeData.notification}
              title="notification"
              emptyText={formatMessage({ id: 'component.globalHeader.notification.empty' })}
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
              showViewMore
            />
            <NoticeIcon.Tab
              count={unreadMsg.message}
              list={noticeData.message}
              title="message"
              emptyText={formatMessage({ id: 'component.globalHeader.message.empty' })}
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
              showViewMore
            />
            <NoticeIcon.Tab
              count={unreadMsg.event}
              list={noticeData.event}
              title="event"
              emptyText={formatMessage({ id: 'component.globalHeader.event.empty' })}
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg"
              showViewMore
            />
          </NoticeIcon> */}
          <Row>
            <Col span={'user_info' in currentUser && currentUser.user_info.first_name ? 12 : 0}>
              {'user_info' in currentUser && currentUser.user_info.first_name ? (
                <HeaderDropdown overlay={menu}>
                  <span className={`${styles.action} ${styles.account}`}>
                    <Avatar
                      size="small"
                      className={styles.avatar}
                      src={currentUser.avatar}
                      alt="avatar"
                    />
                    <span className={styles.name}>
                      {`${currentUser.user_info.first_name} ${currentUser.user_info.last_name}`}
                    </span>
                  </span>
                </HeaderDropdown>
              ) : (
                !showCartButton && <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
              )}
            </Col>
            <Col span={'user_info' in currentUser && currentUser.user_info.first_name ? 12 : 24}>
              {showCartButton && (
                <span>
                  <a
                    onClick={handleShowCart}
                    style={{ fontWeight: '800', fontSize: '14px', color: '#354168' }}
                  >
                    <Row type="flex" justify="center" align="middle">
                      <Col span={5}>Cart</Col>
                      <Col span={6} style={{ paddingTop: '10px' }}>
                        <Icon type="shopping-cart" style={{ fontSize: 'xx-large' }} />
                      </Col>
                      <Col span={7} style={{ marginLeft: '15%' }}>
                        <span className={styles.grey}>{cartCount}</span>
                      </Col>
                    </Row>
                  </a>
                </span>
              )}
            </Col>
          </Row>
          {/* <SelectLang className={styles.action} /> */}
        </div>
        {!showCartButton && (
          <div className={className}>
            <span>
              <a
                target="_blank"
                href={'reseller_info' in currentUser ? currentUser.reseller_info.url : ''}
                rel="noopener noreferrer"
                className={styles.action}
              >
                <img
                  alt=""
                  className="ant-menu-item"
                  style={{ height: 'inherit' }}
                  height="42"
                  width="190"
                  src={'reseller_info' in currentUser ? currentUser.reseller_info.logo : ''}
                />
              </a>
            </span>
          </div>
        )}
      </div>
    );
  }
}
