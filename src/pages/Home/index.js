import { useState, useEffect } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './Home.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { useNavigate, BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Select, Button, Space, Table, Input, Popconfirm, Dropdown, message, Form, Typography } from 'antd';

const cx = classNames.bind(styles);

function Home() {
    const banner = `${ImageUrl.URL_IMAGE}/banner3.png`;
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    const getService = async () => {
        const res = await sendRequest({
            url: `http://localhost:2001/service`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setServices(res);
        if (res.message) {
            throw new Error(res.message);
        }
        console.log('data: ',res);
    };

    const getDoctors = async ()=> {
        const res = await sendRequest({
            url: `http://localhost:2001/dentist`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setDoctors(res);
        if (res.message) {
            throw new Error(res.message);
        }
        console.log('data1: ',res);
    }

    useEffect(() => {
        getService();
        getDoctors();
    }, []);

    console.log(services);
    console.log(doctors);

    // console.log(studentSex);
    // const AddStudent = () => {
    //     const newStudent = {
    //         code: studentId,
    //         name: studentName,
    //         sex: studentSex,
    //         class: studentClass,
    //     };
    //     fetch('http://localhost:2001/students', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(newStudent),
    //     })
    //         .then((response) => response.json())
    //         .then((data) => {
    //             console.log(data);
    //             // setStudentId('')
    //             // setStudentName('')
    //             // setStudentClass('')
    //         })
    //         .catch((error) => {
    //             console.error(error);
    //         });
    // };

    // const UpdateStudent = (id) => {
    //     console.log(id);
    //     console.log(studentSex);
    //     const newStudent = {
    //         code: studentId,
    //         name: studentName,
    //         sex: studentSex,
    //         class: studentClass,
    //     };
    //     console.log(newStudent);
    //     fetch(`http://localhost:2001/students/${id}`, {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(newStudent),
    //     })
    //         .then((response) => response.json())
    //         .then((data) => {
    //             console.log(data);
    //         })
    //         .catch((error) => {
    //             console.error(error);
    //         });
    // };

    // const DeleteStudent = (id) => {
    //     console.log(id);
    //     fetch(`http://localhost:2001/students/${id}`, {
    //         method: 'DELETE',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //     })
    //         .then((response) => response.json())
    //         .then((data) => {
    //             console.log(data);
    //         })
    //         .catch((error) => {
    //             console.error(error);
    //         });
    // };

    const handleToCreateSchedule = async () => {
        if(localStorage.getItem('account')){
            navigate('/create-schedule');
        } else {
            message.error('Bạn chưa đăng nhập !');
        }
    }

    return (
        <div className={cx('container')}>
            <div className={cx('content')}>
                <div className={cx('banner')}>      
                    <button 
                        onClick={handleToCreateSchedule}
                        className={cx('btn-schedule')}
                    >
                        Đặt lịch ngay
                    </button>
                    <img className={cx('banner-img')} src={banner}></img>
                </div>
            </div>
        </div>
    );
}

export default Home;
