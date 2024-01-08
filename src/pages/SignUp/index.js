import { useState, useEffect } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './SignUp.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { useNavigate, BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import Schedule from '~/pages/CreateSchedule';
import { UserOutlined, LockOutlined } from '@ant-design/icons';


const cx = classNames.bind(styles);

function SignUp() {
    const banner = `${ImageUrl.URL_IMAGE}/banner3.png`;
    const navigate = useNavigate();


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [DOB, setDOB] = useState('');

    const handleSignUp = async () => {
        try {
            const auth = { username, password }
            const res = await sendRequest({
                url: `http://localhost:2001/account`,
                method: 'POST',
                auth: auth,
            });
            console.log('data: ',res);

            if (res.error) {
                throw new Error(res.error)
            }

            // await AsyncStorage.setItem('user', JSON.stringify({ ...data, ...{ password } }))

            switch (res.permission) {
                case 'admin':
                    navigate('/');
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

    return (
            <div className={cx('container')}>
                <img className={cx('banner-img')} src={banner}></img>
                <div className={cx('content')}>
                    <h1>Đăng ký</h1>
                    <div className={cx('input-box')}>
                        <input type="text" placeholder='Họ tên' onChange={e => setFullName(e.target.value)} className={cx('')} required/>
                        <UserOutlined className={cx('input-icon')}/>
                    </div>
                    <div className={cx('input-box')}>
                        <input type="text" placeholder='Tên đăng nhập' onChange={e => setUsername(e.target.value)} className={cx('')} required/>
                        <UserOutlined className={cx('input-icon')}/>
                    </div>
                    <div className={cx('input-box')}>
                        <input type="password" placeholder='Mật khẩu' onChange={e => setPassword(e.target.value)} className={cx('')} required/>
                        <LockOutlined className={cx('input-icon')}/>
                    </div>
                    <div className={cx('input-box')}>
                        <input type="text" placeholder='Số điện thoại' onChange={e => setPhone(e.target.value)} className={cx('')} required/>
                        <LockOutlined className={cx('input-icon')}/>
                    </div>
                    <button  className={cx('btn')} onClick={handleSignUp}>Đăng ký</button>
                    <div className={cx('link')}>
                        <p>Bạn chưa đã có tài khoản ? <NavLink to ='/sign-in'>Đăng nhập</NavLink></p>
                    </div>
                </div>
            </div>
    );
}

export default SignUp;
