import { useState, useEffect } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './TabMenu.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { useNavigate, BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Schedule from '~/pages/CreateSchedule';
import { Menu, Switch } from 'antd';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartPie, faBarsProgress } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const account = JSON.parse(localStorage.getItem('account'));
console.log('ssssssssssss', account)

const getItem = (label, key, icon, children, type, route) => {
  return {
    key,
    route,
    icon,
    children,
    label,
    type,
  };
}
const items = [
  getItem('Thống kê', 'sub1', <FontAwesomeIcon icon={faChartPie} />, [
    getItem('Lịch khám', '/manager-report-schedule'),
    getItem('Khách hàng', '/manager-report-customer'),
  ]),
  getItem('Quản lý', 'sub2', <FontAwesomeIcon icon={faBarsProgress} />, [
    getItem('Lịch khám', '/manager-schedule'),
    account.permission!=='receptionist' ? getItem('Ca khám', '/manager-calendar'): '',
    getItem('Dịch vụ', '/manager-service'),
    getItem('Hóa đơn', '/manager-bill'),
    getItem('Khách hàng', '/manager-customer'),
    account.permission==='admin' ? getItem('Nhân viên', '/manager-staff'): '',
  ]),
  getItem('Cài đặt', 'sub3', <SettingOutlined />, [
    getItem('Cài đặt hệ thống', '9'),
    getItem('Chế độ', '10',  <SettingOutlined />),
  ]),
];

const rootSubmenuKeys = ['sub1', 'sub2', 'sub3'];

function TabMenu() {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('dark');
    const changeTheme = (value) => {
      setTheme(value ? 'dark' : 'light');
    };
    const onClick = async (e) => {
      console.log('click ', e);
      console.log('route ', e.route);
      navigate(e.key);
    };
    const [openKeys, setOpenKeys] = useState(['sub1']);
    const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };
    return (
      <>
        <Switch
        checked={theme === 'dark'}
        onChange={changeTheme}
        checkedChildren="Dark"
        unCheckedChildren="Light"
        className={cx('theme')}
        />
        <div className={cx('tab')}>
          <Menu
            theme={theme}
            style={{
              width: 256,
              height: '100%',
              position: 'relative',
              zIndex: 1,
              top: 0,
              left: 0,
              bottom: 0,
            }}
            onClick={onClick}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            mode="inline"
            items={items}
            className={cx('menu')}
          />
        </div>
      </>
    );
}

export default TabMenu;