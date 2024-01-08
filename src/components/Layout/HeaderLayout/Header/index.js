import { useState, useEffect } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './Header.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { useNavigate, BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';


const cx = classNames.bind(styles);

function Header() {
    const logo = `${ImageUrl.URL_IMAGE}/logo-chu.png`;
    const navigate = useNavigate();
    const account = JSON.parse(localStorage.getItem('account'));

    return (
    <div className={cx('container')}>
        <div className={cx('header')}>
            <div className={cx('header-left')}>
                <NavLink to="/" className={cx('logo')}>
                    <img className={cx('logo-img')} src={logo}></img>
                </NavLink>
                <nav className={cx('navbar')}>
                    <ul className={cx('navbar-list')}>
                        <li href='#' className={cx('navbar-link')}>Bác sĩ</li>
                    </ul>
                    <ul className={cx('navbar-list')}>
                        <NavLink to="/schedule" className={cx('navbar-link')}>Lịch khám</NavLink>
                    </ul>
                    <ul className={cx('navbar-list')}>
                        <li href='#' className={cx('navbar-link')}>Giới thiệu</li>
                    </ul>
                    <ul className={cx('navbar-list')}>
                        <li href='#' className={cx('navbar-link')}>Liên hệ</li>
                    </ul>
                </nav>
            </div>
            <div className={cx('header-right')}>
                {
                    localStorage.getItem('account')? 
                    <div className={cx('account')}>
                        <p className={cx('username')} >Xin chào, {account.fullName} !</p>
                        <LogoutOutlined className={cx('log-out')} onClick={() => {localStorage.removeItem('account');
                        navigate('/sign-in');}
                        }/>
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