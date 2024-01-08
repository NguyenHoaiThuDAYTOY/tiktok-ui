import { Carousel, message, Result, Button, Steps } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { sendRequest } from '~/utils/SendRequest';
import ScheduleApi from '~/api/Schedule';
import styles from './CreateSchedule.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { LeftCircleOutlined, RightCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';


const cx = classNames.bind(styles);

function Schedule() {
    const banner = `${ImageUrl.URL_IMAGE}/banner-create-schedule-1.jpg`;
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();
    const [dentists, setDentists] = useState([]);
    const [calendars, setCalendars] = useState([]);
    const [calendarDetails, setCalendarDetails] = useState([]);
    const [dentistId, setDentistId] = useState();
    const [calendarId, setCalendarId] = useState();
    const [calendarDetailId, setCalendarDetailId] = useState();
    const [isActive, setIsActive] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [isCarouselVisible, setIsCarouselVisible] = useState(true);
    const [isResultVisible, setIsResultVisible] = useState(false);

    const buttonDentist = (buttonId) => {
        return cx({
            'card-button': true, // Lớp CSS mặc định
            'card-active': buttonId === dentistId, // Lớp CSS dựa trên câu điều kiệ
        });
    };

    const buttonCalendar = (buttonId) => {
        return cx({
            'card-button': true, // Lớp CSS mặc định
            'card-active': buttonId === calendarId, // Lớp CSS dựa trên câu điều kiệ
        });
    };

    const buttonCalendarDetail = (buttonId) => {
        return cx({
            'card-button': true, // Lớp CSS mặc định
            'card-active': buttonId === calendarDetailId, // Lớp CSS dựa trên câu điều kiệ
        });
    };

    const getDentist = async ()=> {
        const resDentist = await sendRequest({
            url: `http://localhost:2001/dentist`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (resDentist.message) {
            throw new Error(resDentist.message);
        }


        const resCalendar = await sendRequest({
            url: `http://localhost:2001/calendar?status=active`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (resCalendar.message) {
            throw new Error(resCalendar.message);
        }

        const resCalendarDetail = await sendRequest({
            url: `http://localhost:2001/calendar-detail?status=active`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (resCalendarDetail.message) {
            throw new Error(resCalendarDetail.message);
        }

        const matchingCalendar = resCalendar.filter((calendar) => (resCalendarDetail.find((calendarDetail) => calendarDetail.calendarId === calendar?.id)) )
        const filterDentist = resDentist.filter((dentist) =>
            matchingCalendar.some((calendar) => calendar.dentistId === dentist.id && calendar.status === 'active')
        );
        console.log('calendarrrrrrr', matchingCalendar)
        console.log('filterrrrrrrrrr', filterDentist)
        setDentists(filterDentist);
    }

    const getCalendar = async ()=> {
        const resCalendar = await sendRequest({
            url: `http://localhost:2001/calendar?dentistId=${dentistId}&status=active`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (resCalendar.message) {
            throw new Error(resCalendar.message);
        }


        const resCalendarDetail = await sendRequest({
            url: `http://localhost:2001/calendar-detail?status=active`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (resCalendarDetail.message) {
            throw new Error(resCalendarDetail.message);
        }

        const filterCalendar = resCalendar?.filter((calendar) => (resCalendarDetail.find((calendarDetail) => calendarDetail.calendarId === calendar?.id)) )
        console.log('filterrrrrrrrrr', filterCalendar)
        console.log('calendarrrrrrr', resCalendar)
        setCalendars(filterCalendar)
    }

    const getCalendarDetail = async ()=> {
        await fetch(`http://localhost:2001/calendar-detail?calendarId=${calendarId}&status=active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((calendarDetails) => {
                setCalendarDetails(calendarDetails);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        getDentist();
        getCalendar();
        getCalendarDetail();
    }, [dentistId, calendarId, calendarDetailId]);

    console.log(dentists);
    console.log(calendars)
    console.log(calendarDetails)

    const handleBookingSchedule = async () => {
        const account = JSON.parse(localStorage.getItem('account'));
        const newSchedule = {
            customerId: account.id,
            calendarId: calendarId,
            calendarDetailId: calendarDetailId,
            dentistId: dentistId,
            status: "pending",
            lastModifiedBy: account.id,
        };
        if( calendarId && calendarDetailId && dentistId){

            await fetch('http://localhost:2001/schedule', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSchedule),
            })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error(error);
            });
            await fetch(`http://localhost:2001/calendar-detail/${calendarDetailId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'inactive',
                lastModifiedBy: account.id,
            }),
        })
            .then((response) => response.json())
            .catch((error) => {
                console.error(error);
            });
            await messageApi.open({
                type: 'success',
                content: 'Đặt lịch khám thành công',
            });
            setDentistId();
            setCalendarId();
            setCalendarDetailId();
            setIsCarouselVisible(false);
            setIsResultVisible(true);
            // navigate('/');
        } else {
            await messageApi.open({
                type: 'info',
                content: 'Mời bạn chọn khung giờ khám',
            });
        }
    };

    const steps = [
        {
          title: 'Bác sĩ',
          description: 'Chọn bác sĩ bạn muốn khám',
          content: 
            <div>
                <div className={cx('contentStyle')}>
                    {dentists.map(dentist =>
                    <button className={buttonDentist(dentist.id)} key={dentist.id} onClick={() => {setDentistId(dentist.id); setCurrent(current + 1)}}>{dentist.fullName}</button>
                    )}
                </div>
            </div>,
        },
        {
          title: 'Ngày đặt lịch',
          description: 'Chọn ngày khám còn trống',
          content: 
            <div className={cx('contentStyle')}>
                {calendars.map(calendar => 
                (<button className={buttonCalendar(calendar.id)}  key={calendar.id} onClick={() => {setCalendarId(calendar.id); setCurrent(current + 1)}}>{calendar.date}</button>
                ))}
            </div>,
        },
        {
          title: 'Khung giờ',
          description: 'Chọn khung giờ còn trống',
          content: 
            <div className={cx('contentStyle')}>
                {console.log(calendarDetails)}
                {calendarDetails.map(calendarDetail => (

                    <button className={buttonCalendarDetail(calendarDetail.id)} key={calendarDetail.id} onClick={() => {setCalendarDetailId(calendarDetail.id); console.log(calendarDetail.id)}}>{calendarDetail.time}</button>
                    
                ))}
            </div>,
        },
    ];

    const handlePrev = () => {
        setCurrent(current - 1);
    };

    const handleNext = () => {
        current === 0 && dentistId ?
        setCurrent(current + 1) :
        current === 1 && calendarId ?
        setCurrent(current + 1) :
        current === 2 && calendarDetailId ?
        setCurrent(current + 1) : messageApi.open({
            type: 'info',
            content: `Mời bạn chọn ${current === 0 ? 'bác sĩ' : 'ngày khám'}`,
        });
    };

    return (
        <div className={cx('container')}>
            <img className={cx('banner-img')} src={banner}></img>
            {contextHolder}
            <div className={cx('content')}>
                {
                    isResultVisible &&
                    <div className={cx('result')}>
                        <Result
                            className={cx('result-content')}
                            status="success"
                            title="Đặt lịch khám thành công!"
                            subTitle="Quý khách vui lòng chờ nhân viên xác nhận lịch khám và đến phòng khám đúng giờ nhé !"
                            extra={[
                            <button onClick={() => navigate('/schedule')} className={cx('my-schedule-button')}>
                                Xem lịch khám
                            </button>,
                            <button onClick={() => {setIsCarouselVisible(true); setIsResultVisible(false); setCurrent(0)}} className={cx('continue-schedule-button')}>Đặt tiếp</button>,
                            ]}
                        />
                    </div>
                }
                {
                    isCarouselVisible &&
                    <div> 
                        <Steps
                            current={current}
                            items={steps.map((item) => ({
                                key: item.title,
                                title: item.title,
                                description: item.description,
                            }))}
                            className={cx('step')}
                        />
                        <div>{steps[current].content}</div>
                        {current > 0 && (
                            <div className={cx('prev-button')} onClick={handlePrev}>
                                <LeftCircleOutlined className={cx('prev-icon')}/>
                            </div>
                        )}
                        {current < steps.length - 1 && (
                            <div className={cx('next-button')} onClick={handleNext}>
                                <RightCircleOutlined className={cx('next-icon')}/>
                            </div>
                        )}
                        {current === steps.length - 1 && (
                            <button onClick={handleBookingSchedule} className={cx('schedule-button')}>Đặt lịch</button>
                        )}
                    </div>
                }
            </div>
        </div>
    );
}

export default Schedule;

