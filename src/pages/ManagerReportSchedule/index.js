import { useState, useEffect } from 'react';
import axios from 'axios';
import { sendRequest } from '~/utils/SendRequest';
import styles from './ManagerReportSchedule.module.scss';
import classNames from 'classnames/bind';
import ImageUrl from '~/constants/ImageUrl';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Menu, Switch } from 'antd';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function ManagerReportSchedule() {
    return (
      <div>Manager Report Schedule</div>
    );
}

export default ManagerReportSchedule;
