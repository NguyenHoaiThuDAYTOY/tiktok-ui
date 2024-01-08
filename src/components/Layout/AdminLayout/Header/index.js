import { useState, useEffect } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './Header.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { useNavigate, BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserLarge, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, Space } from 'antd';


const cx = classNames.bind(styles);

function Header() {
    const logo = `${ImageUrl.URL_IMAGE}/logo-chu.png`;
    const navigate = useNavigate();
    const account = JSON.parse(localStorage.getItem('account'));

    const items = [
        {
          label: (
            <div className={cx('item')} onClick={() => {}}>
                <p>Thông tin cá nhân</p>
                <FontAwesomeIcon className={cx('log-out')}  icon={faCircleInfo} />
            </div>
          ),
          key: '0',
        },
        {
          type: 'divider',
        },
        {
          label: (
            <div className={cx('item')} onClick={() => {localStorage.removeItem('account');
            navigate('/sign-in');}
            }>
                <p>Đăng xuất</p>
                <LogoutOutlined className={cx('log-out')} onClick={() => {localStorage.removeItem('account');
                                navigate('/sign-in');}
                                }/>
            </div>
          ),
          key: '1',
        },
      ];

    return (
    <div className={cx('container')}>
        <div className={cx('slider')}></div>
        <div className={cx('header')}>
            <div className={cx('header-left')}>
                <img className={cx('logo-img')} src={logo}></img>
            </div>
            <div className={cx('header-right')}>
                {
                    localStorage.getItem('account')? 
                    <div className={cx('account')}>
                        {/* <p className={cx('username')} >{account.fullName}</p>
                        <div className={cx('notifi-icon')}>
                            <div className={cx('count-notifi')}>
                                <p className={cx('count-number')}>5</p>
                            </div>
                            <FontAwesomeIcon icon={faBell} />
                        </div>
                        <LogoutOutlined className={cx('log-out')} onClick={() => {localStorage.removeItem('account');
                        navigate('/sign-in');}
                        }/> */}
                                <p className={cx('username')} >Xin chào, {account.fullName} !</p>
                        <Dropdown
                            menu={{
                            items,
                            }}
                        >
                            <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                <div className={cx('user-icon')}>
                                    <FontAwesomeIcon icon={faUserLarge} className={cx('icon')}/>
                                </div>
                            </Space>
                            </a>
                        </Dropdown>
                    </div> 
                    : 
                    <div>
                        <NavLink to="/sign-in" className={cx('btn')}>Đăng nhập</NavLink>
                        <NavLink to="/sign-up" className={cx('btn')}>Đăng kí</NavLink>
                    </div>
                }
                
            </div>
        </div>
    </div>
);
}

export default Header;