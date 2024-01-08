import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './ManagerReportCustomer.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Card, Col, Row, Statistic, Button, message } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);
const currentDate = new Date
console.log('dateeeeee', currentDate.toLocaleDateString())

function ManagerReportCustomer() {
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState();
  const account = JSON.parse(localStorage.getItem('account'));
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [newSchedules, setNewSchedules] = useState({});
  const [customers, setCustomer] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [orderCurrentDate, setOrderCurrentDate] = useState([]);
  const [orderCurrentMonth, setOrderCurrentMonth] = useState([]);
  const [scheduleCurrentDate, setScheduleCurrentDate] = useState([]);
  const [scheduleCurrentMonth, setScheduleCurrentMonth] = useState([]);
  const [dentistsHasCalendar, setDentistsHasCalendar] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [calendarsHasDetail, setCalendarsHasDetail] = useState([]);
  const [calendarDetailsWithActive, setCalendarDetailsWithActive] = useState([]);
  const [calendarDetails, setCalendarDetails] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [update, setUpdate] = useState(false);
  const [fileldCalendar, setFileldCalendar] = useState(true);
  const [updateRow, setUpdateRow] = useState({});
  const [calendarsOption, setCalendarsOption] = useState([]);
  const [calendarDetailsOption, setCalendarDetailsOption] = useState([]);
  const [calendarDetailsDefault, setCalendarDetailsDefault] = useState([]);
  const [calendarsDefault, setCalendarsDefault] = useState([]);
  const [unSelectCalendarDetail, setUnSelectCalendarDetail] = useState();


  const handleChangeStatusClick = async (e, record) => {
    console.log('click', record.status, e);
    if (record.status === 'Đã khám') {
      message.info('Lịch khám đã xong');
    }
    else if (record.status === 'Đã xác nhận' && e.key === 'confirmed') {
      message.info('Lịch khám đã được xác nhận');
    }
    else if (record.status === 'Đã hủy' && (e.key === 'confirmed' || e.key === 'done' || e.key === 'cancelled')) {
      message.info('Lịch khám đã bị hủy');
    } 
    else {
      try {
        const res = await sendRequest({
            url: `http://localhost:2001/schedule/${record.id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: account.username,
                password: account.password,
            },
            data: JSON.stringify({
                status: e.key,
            })
        });
        message.success('Cập nhật trạng thái thành công');
        setUpdate(!update);
        if (res.message) {
            throw new Error(res.message);
        }
      } catch (error) {
          console.log(error);
      }
    }  
  };
  
  const getAllData = async () => {
    try{
      //get data order current date
      const resOrderCurrentDate = await sendRequest({
        url: `http://localhost:2001/order?createdAt=${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setOrderCurrentDate(resOrderCurrentDate);
      if (resOrderCurrentDate.message) {
        throw new Error(resOrderCurrentDate.message);
      }

      
      //get data order current date
      const resOrderCurrentMonth = await sendRequest({
        url: `http://localhost:2001/order?month=${currentDate.getFullYear()}-${currentDate.getMonth()+1}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setOrderCurrentMonth(resOrderCurrentMonth);
      if (resOrderCurrentMonth.message) {
        throw new Error(resOrderCurrentMonth.message);
      }
      console.log('orderrrrrrrrrr', resOrderCurrentMonth)

      //get data schedules
      const resSchedule = await sendRequest({
        url: `http://localhost:2001/schedule`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSchedules(resSchedule);
      console.log('jjjjjjjjjjj', resSchedule[resSchedule.length - 1])
      setNewSchedules(resSchedule[resSchedule.length - 1])
      if (resSchedule.message) {
        throw new Error(resSchedule.message);
      }

      //get data order current date
      const resScheduleCurrentDate = await sendRequest({
        url: `http://localhost:2001/schedule?createdAt=${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setScheduleCurrentDate(resScheduleCurrentDate);
      if (resScheduleCurrentDate.message) {
        throw new Error(resScheduleCurrentDate.message);
      }

      
      //get data order current date
      const resScheduleCurrentMonth = await sendRequest({
        url: `http://localhost:2001/schedule?month=${currentDate.getFullYear()}-${currentDate.getMonth()+1}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setScheduleCurrentMonth(resScheduleCurrentMonth);
      if (resScheduleCurrentMonth.message) {
        throw new Error(resScheduleCurrentMonth.message);
      }

      //get data service
      const resService = await sendRequest({
        url: `http://localhost:2001/service`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setServices(resService);
      if (resService.message) {
        throw new Error(resService.message);
      }

      //get data dentist
      const resDentist = await sendRequest({
        url: `http://localhost:2001/dentist`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setDentists(resDentist);
      if (resDentist.message) {
          throw new Error(resDentist.message);
      }

      //get data customer
      const resCustomer = await sendRequest({
        url: `http://localhost:2001/customer`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setCustomer(resCustomer);
      if (resCustomer.message) {
          throw new Error(resCustomer.message);
      }

      //get data calendar
      const resCalendar = await sendRequest({
        url: `http://localhost:2001/calendar`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setCalendars(resCalendar);
      if (resCalendar.message) {
        throw new Error(resCalendar.message);
      }

      //get data calendar active
      const resCalendarActive = await sendRequest({
        url: `http://localhost:2001/calendar?status=active`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setCalendars(resCalendarActive);
      if (resCalendarActive.message) {
        throw new Error(resCalendarActive.message);
      }
      
      //get data calendar detail
      const resCalendarDetail = await sendRequest({
        url: `http://localhost:2001/calendar-detail`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setCalendarDetails(resCalendarDetail)
      if (resCalendarDetail.message) {
        throw new Error(resCalendarDetail.message);
      }
      
      //get data calendar detail active
      const resCalendarDetailWithActive = await sendRequest({
        url: `http://localhost:2001/calendar-detail?status=active`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setCalendarDetailsWithActive(resCalendarDetailWithActive)
      if (resCalendarDetailWithActive.message) {
          throw new Error(resCalendarDetailWithActive.message);
      }

      const matchingCalendar = resCalendarActive.filter((calendar) => (resCalendarDetailWithActive.find((calendarDetail) => calendarDetail.calendarId === calendar?.id)) )
      setCalendarsHasDetail(resCalendarActive.filter((calendar) => (resCalendarDetailWithActive.find((calendarDetail) => calendarDetail.calendarId === calendar?.id)) ))
      setDentistsHasCalendar(resDentist.filter((dentist) =>
      matchingCalendar.some((calendar) => calendar.dentistId === dentist.id && calendar.status === 'active')
      ))

      //get fileld schedule data
      const fullSchedule = resSchedule.map((schedule) => {
        const matchingCustomer = resCustomer.find((customer) => customer.id === schedule.customerId);
        const matchingDentist = resDentist.find((dentist) => dentist.id === schedule.dentistId);
        const matchingCalendar = resCalendar.find((calendar) => calendar.id === schedule.calendarId);
        const matchingCalendarDetail = resCalendarDetail.find((calendarDetail) => calendarDetail.id === schedule.calendarDetailId);
        return {
          key: schedule.id,
          id: schedule.id,
          status: schedule.status === 'pending' ? 'Chờ xác nhận' : schedule.status === 'confirmed' ? 'Đã xác nhận' : schedule.status === 'done' ? 'Đã khám' : 'Đã hủy',
          customer: matchingCustomer ? matchingCustomer.fullName : null,
          dentist: matchingDentist ? matchingDentist.fullName : null,
          calendar: matchingCalendar ? matchingCalendar.date : null,
          calendarDetail: matchingCalendarDetail ? matchingCalendarDetail.time : null,
          calendarDetailId: matchingCalendarDetail ? matchingCalendarDetail.id : null,
        };
      });
      setData(fullSchedule);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
     getAllData();
  }, [update, updateRow.dentistId, updateRow]);


    return (
      <Row gutter={16}>
        <Col span={12}>
          <Statistic title="Khách hàng đã đăng ký" value={customers.length} />
        </Col>
        <Col span={12}>
          <Statistic title="Khách hàng mới đặt" value={customers.find((customer) => customer.id === newSchedules.customerId)?.fullName} />
        </Col>
        <Col span={12}>
          <Statistic title="Tổng số dịch vụ" value={services.length} />
        </Col>
        <Col span={12}>
          <Statistic title="Tổng số bác sĩ" value={dentists.length} />
        </Col>
        <Col span={12}>
          <Statistic title="Lịch khám hôm nay" value={scheduleCurrentDate.length} />
        </Col>
        <Col span={12}>
          <Statistic title="Lịch khám tháng" value={scheduleCurrentMonth.length} />
        </Col>
        <Col span={12}>
          <Statistic title="Lịch khám bị hủy" value={schedules.filter((schedule) => schedule.status === 'cancelled').length} />
        </Col>
        <Col span={12}>
          <Statistic title="Doanh thu hôm nay" value={orderCurrentDate.reduce((sum, item) => sum + parseFloat(item.total), 0)} />
        </Col>
        <Col span={12}>
          <Statistic title="Doanh thu tháng" value={orderCurrentMonth.reduce((sum, item) => sum + parseFloat(item.total), 0)} />
        </Col>
    </Row>
    );
}

export default ManagerReportCustomer;
