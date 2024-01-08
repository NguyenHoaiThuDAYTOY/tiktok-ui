import { useState, useEffect, useRef } from 'react';
import { sendRequest } from '~/utils/SendRequest';
import styles from './ManagerCustomer.module.scss';
import classNames from 'classnames/bind';
import { Tabs } from 'antd';
import { AppleOutlined, AndroidOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faFileLines } from '@fortawesome/free-solid-svg-icons';
import CustomerInfo from './component/CustomerInfo';
import CustomerAcc from './component/CustomerAcc';

const cx = classNames.bind(styles);

function ManagerCustomer() {
  const labels = ['Thông tin', 'Tài khoản']
  return (
    <Tabs
      className={cx('tabs')}
      defaultActiveKey="2"
      items={[faFileLines, faUser].map((icon, i) => {
        return {
          label: (
            <span>
              <FontAwesomeIcon icon={icon} className={cx('icon')}/>
              <label className={cx('label')}>{labels[i]}</label>
            </span>
          ),
          key: i,
          children: i === 0 ? <CustomerInfo /> : <CustomerAcc />,
        };
      })}
    />
  );
  
}

export default ManagerCustomer;
