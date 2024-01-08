import { useState, useEffect } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './Footer.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Schedule from '~/pages/CreateSchedule';

const cx = classNames.bind(styles);

function Footer() {
    
    return (
    <div className={cx('container')}>
        <div className={cx('footer')}>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Địa chỉ</h2>
                <p>96 Định Công, Hà Nội</p>
            </div>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Liên hệ</h2>
                <p>SĐT: 0987654321</p>
                <p>Mail: nhakhoavietanh@gmail.com</p>
            </div>
            <div className={cx('card')}>
                <h2 className={cx('title')}>Giờ làm việc</h2>
                <p>Thứ 2 - Thứ 6: 9am - 6pm</p>
                <p>Thứ 7 - CN: 9am - 8pm</p>
            </div>
        </div>
    </div>
);
}

export default Footer;