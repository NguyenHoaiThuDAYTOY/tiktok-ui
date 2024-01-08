import { useState, useEffect } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './SignIn.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { useNavigate, BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';


const cx = classNames.bind(styles);

function SignIn() {
    const banner = `${ImageUrl.URL_IMAGE}/banner3.png`;
    const navigate = useNavigate();


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const auth = { username, password }
            const res1 = await sendRequest({
                url: `http://localhost:2001/account/login`,
                method: 'GET',
                auth: auth,
            });

            if (res1.error) {
                throw new Error(res1.error)
            }

            const res2 = await sendRequest({
                url: `http://localhost:2001/${res1.permission}/${res1.userId}`,
                method: 'GET',
                auth: auth,
            });

            if (res2.error) {
                throw new Error(res2.error)
            }

            console.log(res2)

            await localStorage.setItem('account', JSON.stringify({ ...res1, ...{ password: password }, ...res2 }))

             switch (res1.permission) {
                case 'admin':
                    navigate('/manager-schedule');
                    break;
                case 'dentist':
                    navigate('/manager-schedule');
                    break;
                case 'receptionist':
                    navigate('/manager-schedule');
                    break;
                case 'customer':
                    navigate('/');
                    break;
                default:
                    break;
            }

        } catch (error) {
            console.log(error.message)
        }
    }

    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          handleLogin();
        }
    });

    return (
            <div className={cx('container')}>
                <img className={cx('banner-img')} src={banner}></img>
                <div className={cx('content')}>
                    <h1>Đăng nhập</h1>
                    <div className={cx('input-box')}>
                        <input type="text" placeholder='Tên đăng nhập' onChange={e => setUsername(e.target.value)} className={cx('')} required/>
                        <UserOutlined className={cx('input-icon')}/>
                    </div>
                    <div className={cx('input-box')}>
                        <input type="password" placeholder='Mật khẩu' onChange={e => setPassword(e.target.value)} className={cx('')} required/>
                        <LockOutlined className={cx('input-icon')}/>
                    </div>
                    <button type='submit' className={cx('btn')} onClick={handleLogin}>Đăng nhập</button>
                    <div className={cx('link')}>
                        <p>Bạn chưa có tài khoản ? <NavLink to ='/sign-up'>Đăng ký</NavLink></p>
                    </div>
                </div>
            </div>
    );
}

export default SignIn;
