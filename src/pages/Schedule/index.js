import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './Schedule.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ClockCircleOutlined, QuestionCircleOutlined, LeftCircleOutlined, RightCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserDoctor, faHospitalUser, faCalendarDays, faClock, faNotesMedical, faCircleCheck, faCalendarXmark, faCalendarCheck, faTrashCan, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Popover, Modal, Button, Popconfirm, Carousel, message } from 'antd';

const cx = classNames.bind(styles);

function Schedule() {
    const banner = `${ImageUrl.URL_IMAGE}/banner3.png`;
    const [schedules, setSchedules] = useState([]);
    const [account, setAccount] = useState(JSON.parse(localStorage.getItem('account')));
    console.log('test', account)
    const [customer, setCustomer] = useState([]);
    const [dentists, setDentists] = useState([]);
    const [calendars, setCalendars] = useState([]);
    const [calendarDetails, setCalendarDetails] = useState([]);
    const [calendarDetailsWithInactive, setCalendarDetailsWithInactive] = useState([]);
    const [calendarDetailWithInactive, setCalendarDetailWithInactive] = useState([]);
    const [activeCalendarDetail, setActiveCalendarDetail] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState();
    const [selectedDentist, setSelectedDentist] = useState();
    const [selectedCaledar, setSelectedCaledar] = useState();
    const [selectedCaledarDetail, setSelectedCaledarDetail] = useState();
    const [selectedNewCaledarDetail, setSelectedNewCaledarDetail] = useState();
    const [unselectedCaledarDetailId, setUnselectedCaledarDetailId] = useState();
    const [symptom, setSymptom] = useState(selectedSchedule?.symptom);
    const [modalOpen, setModalOpen] = useState(false);
    const [update, setUpdate] = useState(false);

    const getSchedule = async () => {
        const res1 = await sendRequest({
            url: `http://localhost:2001/schedule?customerId=${account.userId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        setSchedules(res1);
        if (res1.message) {
            throw new Error(res1.message);
        }
        console.log('data: ',res1);
    };

    const getDentist = async () => {
        const res = await sendRequest({
            url: `http://localhost:2001/dentist`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setDentists(res);
        if (res.message) {
            throw new Error(res.message);
        }
        console.log('data: ',res);
    };

    const getCustomer = async () => {
        const res = await sendRequest({
            url: `http://localhost:2001/customer?id=${account.userId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setCustomer(res);
        if (res.message) {
            throw new Error(res.message);
        }
        console.log('data: ',res);
    };

    const getCalendar = async () => {
        const res = await sendRequest({
            url: `http://localhost:2001/calendar`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setCalendars(res);
        if (res.message) {
            throw new Error(res.message);
        }
        console.log('data: ',res);
    };

    const getCalendarDetail = async () => {
        const res = await sendRequest({
            url: `http://localhost:2001/calendar-detail?status=active`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setCalendarDetails(res)
        if (res.message) {
            throw new Error(res.message);
        }
    };

    const getCalendarDetailWithInactive = async () => {
        const res = await sendRequest({
            url: `http://localhost:2001/calendar-detail`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setCalendarDetailsWithInactive(res)
        if (res.message) {
            throw new Error(res.message);
        }
    };

    useEffect(() => {
        getSchedule();
        getDentist();
        getCustomer();
        getCalendar();
        getCalendarDetail();
        getCalendarDetailWithInactive();
    }, [update, selectedDentist, account, selectedCaledar, selectedCaledarDetail]);

    const handleRemoveSchedule = async (schedule) => {
        try {
            setUpdate(!update);
            const res = await sendRequest({
                url: `http://localhost:2001/schedule/${schedule.id}`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: account.username,
                    password: account.password,
                },
                data: JSON.stringify({
                    status: 'cancelled',
                })
            });
            if (res.message) {
                throw new Error(res.message);
            }
            const resActiveCalendar = await sendRequest({
                url: `http://localhost:2001/calendar-detail/${schedule.calendarDetailId}`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: account.username,
                    password: account.password,
                },
                data: JSON.stringify({
                    status: 'active',
                    lastModifiedBy: account.id,
                })
            });
            if (resActiveCalendar.message) {
                throw new Error(resActiveCalendar.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    console.log('customer', customer)
    console.log('check', parseInt(customer.updatedCount, 10))
    console.log('checktype', typeof(customer.updatedCount))
    console.log('check-int', (customer.updatedCount - '1'))
    console.log('selecccccccccccc', activeCalendarDetail)


    const getEditSchedule = async (scheduleId) => {
        console.log(account)
        if(account.updatedCount >=3){
            message.error('Bạn đã sửa lịch khám quá nhiều');
        }
        else{
            try {
                // const res2 = await sendRequest({
                //     url: `http://localhost:2001/customer/${account.userId}`,
                //     method: 'PUT',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     auth: {
                //         username: account.username,
                //         password: account.password,
                //     },
                //     data: JSON.stringify({
                //         updatedCount: account.updatedCount + 1,
                //     })
                // });
                // console.log('upppp',res2);
                // await localStorage.setItem('account', JSON.stringify({ ...account, ...{ updatedCount: account.updatedCount + 1 }}))
                // setAccount(JSON.parse(localStorage.getItem('account')))
                // console.log('acccccc', account)
                setModalOpen(true)
                
                const selectedSchedule = schedules.find((item) => item.id === scheduleId);
                const selectedDentist = dentists.find((item) => item.id === selectedSchedule.dentistId);
                const selectedCaledar = calendars.find((item) => item.id === selectedSchedule.calendarId);
                const selectedCaledarDetail = calendarDetailsWithInactive.find((item) => item.id === selectedSchedule.calendarDetailId);
                console.log('schedueleeeeeee',selectedSchedule)
                console.log('dentistttttttt',selectedDentist)
                console.log('calendarrrrrr',selectedCaledar)
                console.log('detaillllllll',selectedCaledarDetail)

                setCalendarDetailWithInactive([...calendarDetails, selectedCaledarDetail]);
                setSelectedSchedule(selectedSchedule)
                setSelectedDentist(selectedDentist)
                setSelectedCaledar(selectedCaledar)
                setSelectedCaledarDetail(selectedCaledarDetail)
                setUnselectedCaledarDetailId(selectedCaledarDetail)
            } catch (error) {
                console.log(error);
            }
        }    
    }

    const handleEditSchedule = async () => {
        try {
            const res2 = await sendRequest({
                url: `http://localhost:2001/schedule/${selectedSchedule?.id}`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: account.username,
                    password: account.password,
                },
                data: JSON.stringify({
                    dentistId: selectedDentist?.id,
                    calendarId: selectedCaledar?.id,
                    calendarDetailId: selectedCaledarDetail?.id,
                })
            });
            if (res2.message) {
                throw new Error(res2.message);
            }
            if(unselectedCaledarDetailId.id !== selectedCaledarDetail.id) {
                const res3 = await sendRequest({
                    url: `http://localhost:2001/calendar-detail/${selectedCaledarDetail?.id}`,
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    auth: {
                        username: account.username,
                        password: account.password,
                    },
                    data: JSON.stringify({
                        status: 'inactive',
                        lastModifiedBy: 1,
                    })
                });
                if (res3.message) {
                    throw new Error(res3.message);
                }

                const res4 = await sendRequest({
                    url: `http://localhost:2001/calendar-detail/${unselectedCaledarDetailId?.id}`,
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    auth: {
                        username: account.username,
                        password: account.password,
                    },
                    data: JSON.stringify({
                        status: 'active',
                        lastModifiedBy: 1,
                    })
                });
                if (res4.message) {
                    throw new Error(res4.message);
                }
                message.success('Sửa lịch khám thành công');
                setSelectedCaledarDetail()
            }
            
            setUpdate(!update);
            setModalOpen(false)
        } catch (error) {
            console.log(error);
        }
        console.log('select', selectedCaledarDetail)
        console.log('un-select', unselectedCaledarDetailId)
    }

    const onChange = (currentSlide) => {
        console.log(currentSlide);
      };

    const carouselRef = useRef(null);

    const handlePrev = () => {
    carouselRef.current.prev();
    };

    const handleNext = () => {
    carouselRef.current.next();
    };

    return (
        <div className={cx('container')}>
            <div className={cx('content')}>
                <div className={cx('card-content')}>
                {
                    // schedules.length === 0 ? 
                    // <div>
                    //     <div  className={cx('nodata-icon')}>
                    //         <WarningOutlined/>
                    //     </div>
                    //     <p className={cx('nodata')}>Chưa có lịch khám</p> 
                    //     <button className={cx('schedule-button')}><NavLink className={cx('schedule-link')} to='/create-schedule'>Đặt lịch khám</NavLink></button>
                    // </div>
                    // :
                    schedules.map(schedule=> (
                    <div className={cx('card')} key={schedule.id}>
                        <div className={cx('card-title')}>
                        {
                            schedule.status === 'pending' ? 
                            <div className={cx('status', 'grey')}>
                                <ClockCircleOutlined />
                                <p>Chờ xác nhận</p>
                            </div>:
                            schedule.status === 'confirmed' ? 
                            <div className={cx('status', 'green')}>
                                <FontAwesomeIcon icon={faCalendarCheck}/>
                                <p>Đã xác nhận</p>
                            </div>:
                            schedule.status === 'cancelled' ? 
                            <div className={cx('status', 'red')}>
                                <FontAwesomeIcon icon={faCalendarXmark} />
                                <p>Đã hủy</p>
                            </div>:
                            <div className={cx('status', 'blue')}>
                                <FontAwesomeIcon icon={faCircleCheck} />
                                <p>Đã khám</p>
                            </div>
                        }
                            <div className={cx('card-title-right')}>
                                <Button 
                                    type='none' 
                                    disabled={schedule.status === 'cancelled' || schedule.status === 'done' || schedule.status === 'confirmed' ? true : false}
                                    className={schedule.status === 'cancelled' || schedule.status === 'done' || schedule.status === 'confirmed' ? cx('disable-edit-icon') : cx('edit-icon')} 
                                    style={{MozUserFocus: 'none'}} 
                                    onClick={() => getEditSchedule(schedule.id)}
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </Button>
                                <Modal
                                    title="Sửa lịch khám"
                                    centered
                                    open={modalOpen}
                                    onOk={() => handleEditSchedule()}
                                    onCancel={() => setModalOpen(false)}
                                    okText="Sửa"
                                    cancelText="Hủy"
                                >
                                    <Carousel afterChange={onChange} ref={carouselRef} infinite={true} dots={true}>
                                        <div>
                                            <div className={cx('contentStyle')}>
                                                <div>
                                                    {dentists.map(dentist =>
                                                    <button className={selectedDentist && dentist?.id === selectedDentist?.id ? cx('card-active', 'card-button') : cx('card-button')} key={dentist?.id} onChange={() => {setSelectedDentist(dentist)}} onClick={() => {setSelectedDentist(dentist)}}>{dentist.fullName}</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className={cx('contentStyle')}>
                                                <div>
                                                    {calendars.filter((calendar) => calendar.dentistId === (selectedDentist?.id || null)).map(calendar =>
                                                    <button className={selectedCaledar && calendar.id === (selectedCaledar?.id || null) ? cx('card-active', 'card-button') : cx('card-button')} key={calendar.id} onClick={() => {setSelectedCaledar(calendar)}} >{calendar.date}</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className={cx('contentStyle')}>
                                                {calendarDetailsWithInactive.filter((calendarDetail) => calendarDetail?.calendarId === (selectedCaledar?.id || null)).map(calendarDetail =>
                                                <button className={selectedCaledarDetail && calendarDetail.id === selectedCaledarDetail?.id ? cx('card-active', 'card-button') : cx('card-button')} key={calendarDetail?.id} onClick={() => {setSelectedCaledarDetail(calendarDetail)}}>{calendarDetail?.time}</button>
                                                )}
                                            </div>
                                        </div>
                                    </Carousel>
                                    <div className={cx('prev-button')} onClick={handlePrev}>
                                        <LeftCircleOutlined className={cx('prev-icon')}/>
                                    </div>
                                    <div className={cx('next-button')} onClick={handleNext}>
                                        <RightCircleOutlined className={cx('next-icon')}/>
                                    </div>
                                </Modal>
                                <Popconfirm
                                    title="Xóa lịch khám"
                                    description="Bạn có chắc muốn xóa lịch khám ?"
                                    onConfirm={() => handleRemoveSchedule(schedule)}
                                    onOpenChange={() => console.log('open change')}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    icon={
                                    <QuestionCircleOutlined
                                        style={{
                                        color: 'red',
                                        }}
                                    />
                                    }
                                >
                                    <Button 
                                        type='none' 
                                        disabled={schedule.status === 'done' || schedule.status === 'confirmed' || schedule.status === 'cancelled' ? true : false}
                                        className={schedule.status === 'done' || schedule.status === 'confirmed' || schedule.status === 'cancelled' ? cx('disable-remove-icon') : cx('remove-icon')}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan}/>
                                    </Button>
                                </Popconfirm>
                            </div>
                        </div>
                        <div className={cx('card-info')}>
                            <div className={cx('info')}>
                                <FontAwesomeIcon icon={faHospitalUser} />
                                <p>{account.fullName}</p>
                            </div>
                            <div className={cx('info')}>
                                <FontAwesomeIcon icon={faUserDoctor} />
                                <p>
                                    {
                                        (dentists.find((item) => item.id === schedule.dentistId)) ? 
                                        dentists.find((item) => item.id === schedule.dentistId).fullName : null
                                    }
                                </p>
                            </div>
                            <div className={cx('info')}>
                                <FontAwesomeIcon icon={faCalendarDays} />
                                <p>
                                    {
                                        (calendars.find((item) => item.id === schedule.calendarId)) ? 
                                        calendars.find((item) => item.id === schedule.calendarId).date : null
                                    }
                                </p>
                            </div>
                            <div className={cx('info')}>
                                <FontAwesomeIcon icon={faClock} />
                                <p>
                                    {console.log('timeeeeeee', calendarDetailsWithInactive)}
                                    {
                                        (calendarDetailsWithInactive.find((item) => item.id === schedule.calendarDetailId)) ? 
                                        calendarDetailsWithInactive.find((item) => item.id === schedule.calendarDetailId)?.time : null
                                    }
                                </p>
                            </div>
                            <div className={cx('info')}>
                                <FontAwesomeIcon icon={faNotesMedical} />
                                <Popover className={cx('popover')} content={(<div className={cx('content-symptom')}>{schedule.symptom}</div>)} title={(<p className={cx('title-symptom')}>Ghi chú</p>)} trigger="hover">
                                    Ghi chú
                                </Popover>
                            </div>
                        </div>
                    </div>
                    ))
                }

                </div>
            </div>
        </div>
    );
}

export default Schedule;
