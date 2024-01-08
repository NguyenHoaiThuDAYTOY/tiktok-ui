import { useState, useEffect, useRef } from 'react';
import { sendRequest } from '~/utils/SendRequest';
import styles from './ManagerStaff.module.scss';
import classNames from 'classnames/bind';
import { message, Tabs, Tooltip, Modal, Form, Checkbox, Radio, Input, Select, TreeSelect, Cascader, DatePicker, InputNumber, Upload, Slider, Switch, Button } from 'antd';
import { AppleOutlined, AndroidOutlined, PlusOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faFileLines } from '@fortawesome/free-solid-svg-icons';
import StaffInfo from './component/StaffInfo';
import StaffAcc from './component/StaffAcc';
import { useNavigate, BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const formatNumber = (value) => new Intl.NumberFormat().format(value);
const NumericInput = (props) => {
  const { value, onChange } = props;
  const handleChange = (e) => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      onChange(inputValue);
    }
  };

  // '.' at the end or only '-' in the input box.
  const handleBlur = () => {
    let valueTemp = value;
    if (value.charAt(value.length - 1) === '.' || value === '-') {
      valueTemp = value.slice(0, -1);
    }
    onChange(valueTemp.replace(/0*(\d+)/, '$1'));
  };
  const title = value ? (
    <span className="numeric-input-title">{value !== '-' ? formatNumber(Number(value)) : '-'}</span>
  ) : (
    'Input a number'
  );
  return (
    <Tooltip trigger={['focus']} title={title} placement="topLeft" overlayClassName="numeric-input">
      <Input
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Input a number"
        maxLength={16}
      />
    </Tooltip>
  );
};

function ManagerStaff() {
  const navigate = useNavigate();
  const account = JSON.parse(localStorage.getItem('account'));
  const labels = ['Thông tin', 'Tài khoản']
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [identity, setIdentity] = useState('');
  const [permission, setPermission] = useState('');
  const [gender, setGender] = useState('');
  const [DOB, setDOB] = useState('');
  const [update, setUpdate] = useState(false);

  console.log(DOB)

  const emailValidator = (_, value) => {
    // Sử dụng regex để kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value || emailRegex.test(value)) {
      return Promise.resolve();
    }

    return Promise.reject('Email không hợp lệ!');
  };

  const handeleCreateStaff = async () => {
    try {
      const resInfo = await sendRequest({
          url: `http://localhost:2001/${permission}`,
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          auth: {
              username: account.username,
              password: account.password,
          },
          data: JSON.stringify({
              fullName: fullName,
              DOB: DOB,
              email: email,
              phone: phone,
              identity: identity,
              gender: gender,
          })
      });
      console.log('test', resInfo)
      if (resInfo.error) {
        message.error(resInfo.error);
        throw new Error(resInfo.error);
      }

      const resAcc = await sendRequest({
        url: `http://localhost:2001/account`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        auth: {
            username: account.username,
            password: account.password,
        },
        data: JSON.stringify({
            username: username,
            password: password,
            permission: permission,
            userId: resInfo.id,
        })
      });
      console.log('test', resAcc)
      if (resAcc.error) {
        message.error(resAcc.error);
        throw new Error(resAcc.error);
      }
      message.success('Thêm nhân viên thành công');
      setModalOpen(false);
      setUpdate(!update);
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  }

  return (
    <div>
      <div className={cx('add')}>
        <button className={cx('add-btn')} onClick={() => setModalOpen(true)}>Thêm +</button>
      </div>
      <Modal
          title="Thêm nhân viên"
          centered
          open={modalOpen}
          onOk={() => handeleCreateStaff()}
          onCancel={() => setModalOpen(false)}
          okText="Thêm"
          cancelText="Hủy"
      >
      <Form
        labelCol={{
          span: 7,
        }}
        wrapperCol={{
          span: 14,
        }}
        layout="horizontal"
        style={{
          maxWidth: 500,
        }}
      >
        <Form.Item label="Tên nhân viên">
          <Input value={fullName} onChange={e => setFullName(e.target.value)}/>
        </Form.Item>
        <Form.Item label="Tên đăng nhập">
          <Input value={username} onChange={e => setUsername(e.target.value)}/>
        </Form.Item>
        <Form.Item label="Mật khẩu">
          <Input.Password value={password} onChange={e => setPassword(e.target.value)} placeholder="input password" />
        </Form.Item>
        <Form.Item label="SDT">
          <NumericInput
            value={phone}
            onChange={setPhone}
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input 
            value={email}         
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { validator: emailValidator }
            ]}
            onChange={e => setEmail(e.target.value)}/>
        </Form.Item>
        <Form.Item label="CMND">
          <NumericInput
            value={identity}
            onChange={setIdentity}
          />
        </Form.Item>
        <Form.Item label="Ngày sinh">
          <DatePicker onChange={(date, dateString) => setDOB(dateString)} dateFormat="yyyy/MM/dd"/>
        </Form.Item>
        <Form.Item label="Giới tính">
          <Radio.Group onChange={e => setGender(e.target.value)}>
            <Radio value="male"> Nam </Radio>
            <Radio value="female"> Nữ </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Chức vụ">
          <Radio.Group onChange={e => setPermission(e.target.value)}>
            <Radio value="dentist"> Bác sĩ </Radio>
            <Radio value="receptionist"> Lễ tân </Radio>
            <Radio value="admin"> Quản trị </Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
      </Modal>
      <Tabs
        className={cx('tabs')}
        defaultActiveKey="2"
        items={[faFileLines, faUser].map((icon, i) => {
          return {
            label: (
              <span>
                <FontAwesomeIcon icon={icon} className={cx('icon')}/>
                <label className={cx('label')}>{labels[i]}</label>
              </span>
            ),
            key: i,
            children: i === 0 ? <StaffInfo updateStaff ={update}/> : <StaffAcc updateStaff ={update}/>,
          };
        })}
      />
    </div>
  );
  
}

export default ManagerStaff;
