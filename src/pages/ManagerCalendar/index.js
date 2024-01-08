import { useState, useEffect, useRef } from 'react';
import { sendRequest } from '~/utils/SendRequest';
import styles from './ManagerCalendar.module.scss';
import classNames from 'classnames/bind';
import { Tabs, TimePicker, Divider, Modal, DatePicker, Select, Button, Space, Table, Input, Popconfirm, Dropdown, message, Form, Typography } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck, faShuffle } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';

const cx = classNames.bind(styles);
dayjs.extend(customParseFormat);

const { TabPane } = Tabs;

function ManagerCalendar() {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState();
  const account = JSON.parse(localStorage.getItem('account'));
  const [dentists, setDentists] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [calendarDetails, setCalendarDetails] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [update, setUpdate] = useState(false);
  const [updateRow, setUpdateRow] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState();
  const [selectedCalendar, setSelectedCalendar] = useState();
  const [selectedTime, setSelectedTime] = useState();
  const [selectDentist, setSelectDentist] = useState([]);
  const [selectCalendar, setSelectCalendar] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [calendarDetail, setCalendarDetail] = useState([]);
  const [modalKey, setModalKey] = useState('1');
  const inputRef = useRef(null);

  const onChangeModalKey = (key) => {
    setModalKey(key);
    setSelectedCalendar();
    setSelectedTime();
    setSelectedDentist();
  };

  const addCalendar = async () => {
    const currentDate = new Date();
    const selectedDate = new Date(selectedCalendar);
    console.log('date', calendar)
    console.log('date----', selectedCalendar)
    console.log('curr-date----', currentDate)
    if (calendar.includes(selectedCalendar)) {
      message.error('Ngày khám này đã có');
    } 
    else if (selectedDate < currentDate) {
      message.error('Vui lòng chọn ngày mới');
    }
      else {
        try {
          console.log('date', selectCalendar)
          const res = await sendRequest({
              url: `http://localhost:2001/calendar`,
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              auth: {
                  username: account.username,
                  password: account.password,
              },
              data: JSON.stringify({
                  lastModifiedBy: account.id,
                  date: selectedCalendar,
                  dentistId: selectedDentist,
              })
          });
          console.log(res);
          message.success('Thêm ngày khám thành công');
          setUpdate(!update);
          if (res.message) {
              throw new Error(res.message);
          }
        } catch (error) {
            console.log(error);
        }
      }
  };

  //Filter
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Tìm ${dataIndex === 'customer' ? 'khách hàng' : dataIndex === 'dentist' ? 'bác sĩ' : dataIndex === 'calendar' ? 'ngày khám' : dataIndex === 'symptom' ? 'triệu chứng' : dataIndex === 'status' ? 'trạng thái' : 'giờ khám'}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className={cx('search-input')}
        />
        <Space>
          <Button
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            className={cx('search-btn')}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            className={cx('search-reset')}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
            className={cx('search-filter')}
          >
            Lọc
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
            className={cx('search-close')}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  //Field data table
  const columns = [
    {
      title: 'Bác sĩ',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
      ...getColumnSearchProps('dentist'),
      fixed: 'left',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      ...getColumnSearchProps('date'),
      editable: true,
    },
    {
      title: 'Giờ',
      dataIndex: '',
      key: 'time',
      width: 300,
      filters: [
        {
          text: 'Còn trống',
          value: 'active',
        },
        {
          text: 'Đã đặt',
          value: 'inactive',
        },
      ],
      onFilter: (value, record) => record.time.status === value,
      render: (record) =>
      <Space >
          {console.log('time', record.time)}
          {record.time.map((item, index) => (
          <div key={index}>
            <Dropdown.Button
              menu={{
                items,
                onClick: (e) => handleChangeStatusClick(e, item),
              }} 
              placement="bottom" 
              icon={<FontAwesomeIcon icon={faShuffle} />}
            >
              <div className={item.status === 'active' ? cx('blue') : cx('grey')}>
                {item.time}
              </div>
            </Dropdown.Button>
          </div>
        ))}
        </Space>
    },
  ];

  //----------Handle Edit---------------
  const isEditing = (record) => record.id === editingKey;

  const EditableCell = ({
    defaultValue,
    options,
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'select' ? 
      <Select 
        options={options} 
        onChange={handleChange} 
        labelInValue 
        defaultValue={defaultValue}
      /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };
  
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        options: col.dataIndex === 'dentist' ?
        dentists.map(dentist => ({
          label: dentist.fullName,
          value: dentist.id,
          title: 'dentist'
        })) : col.dataIndex === 'calendar' ?
        calendars.map(calendar => ({
          label: calendar.date,
          value: calendar.id,
          title: 'calendar'
        })) : 
        calendarDetails.map(calendarDetail => ({
          label: calendarDetail.time,
          value: calendarDetail.id,
          title: 'calendarDetail'
        })),
        defaultValue: col.dataIndex === 'dentist' ?
        {
          label: record.dentist,
          value: record.dentist,
        } : col.dataIndex === 'calendar' ?
        {
          label: record.calendar,
          value: record.calendar,
        } : 
        {
          label: record.calendarDetail,
          value: record.calendarDetail,
        },
        record,
        inputType: col.dataIndex === 'dentist' || col.dataIndex === 'calendar' || col.dataIndex === 'calendarDetail' ? 'select' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleChange = (selected) => {
    console.log(selected); 
    if (selected.title === 'dentist') {
      updateRow.dentistId = selected.value
    } else if (selected.title === 'calendar') {
      updateRow.calendarId = selected.value
    } else if (selected.title === 'calendarDetail') {
      updateRow.calendarDetailId = selected.value
    }
    setUpdateRow(updateRow)
  };

  const edit = (record) => {
    form.setFieldsValue({
      symptom: record.symptom,
    });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      if (newData.find((item) => id === item.id)) {
        try {
          const res = await sendRequest({
              url: `http://localhost:2001/schedule/${id}`,
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              auth: {
                  username: account.username,
                  password: account.password,
              },
              data: JSON.stringify({
                  symptom: row.symptom,
                  dentistId: updateRow.dentistId,
                  calendarId: updateRow.calendarId,
                  calendarDetailId: updateRow.calendarDetailId,
              })
          });
          message.success('Cập nhật lịch khám thành công');
          setUpdate(!update);
          if (res.message) {
              throw new Error(res.message);
          }
        } catch (error) {
            console.log(error);
        }
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  //--------------Handle Change Status------------------
  const items = [
    {
      label: 'Hủy kích hoạt',
      key: 'done',
      icon: <FontAwesomeIcon className={cx('blue')} icon={faCalendarCheck} />,
      disabled: false,
    },
  ];

  const handleChangeStatusClick = async (e, item) => {
    console.log('click', item.status, e);
    if (item.status === 'inactive') {
      message.info('Khung giờ không còn trống');
    }
    else {
      try {
        const res = await sendRequest({
            url: `http://localhost:2001/calendar-detail/${item.id}`,
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
                lastModifiedBy: account.id,
            })
        });
        console.log(res);
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

  const handleAddCalendarDetail = async () => {
    console.log('time test',calendarDetail)
    console.log(selectedTime)
    if (calendarDetail.includes(selectedTime)) {
      message.error('Giờ khám này đã có');
    } else {
      try {
        console.log('time', selectedTime)
        const res = await sendRequest({
            url: `http://localhost:2001/calendar-detail`,
            method: 'POST',
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
                time: selectedTime,
                calendarId: selectedCalendar,
            })
        });
        console.log(res);
        message.success('Thêm lịch ca thành công');
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
      //get data dentist
      const resDentist = await sendRequest({
        url: `http://localhost:2001/dentist`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setDentists(resDentist);
      setSelectDentist(resDentist.map(dentist => ({
        label: dentist.fullName,
        value: dentist.id,
        title: 'dentist'
      })));
      if (resDentist.message) {
          throw new Error(resDentist.message);
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

      setCalendar(resCalendar.filter((calendar) => calendar.dentistId === selectedDentist).map(calendar => (calendar.date)))

      setSelectCalendar(resCalendar.filter((calendar) => calendar.dentistId === selectedDentist));
      if (resCalendar.message) {
          throw new Error(resCalendar.message);
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

      // const matchingTime = resCalendarDetail.filter((calendarDetail) => calendarDetail.calendarId === selectedCalendar)
      // console.log('matching time', matchingTime)
      
      setCalendarDetail(resCalendarDetail.filter((calendarDetail) => calendarDetail.calendarId === selectedCalendar).map(calendarDetail => (calendarDetail.time)))

      if (resCalendarDetail.message) {
          throw new Error(resCalendarDetail.message);
      }
      
      //get fileld schedule data
      const fullCalendar = resCalendar.map((calendar) => {
        const matchingDentist = resDentist.find((dentist) => dentist.id === calendar.dentistId);
        const matchingCalendarDetail = resCalendarDetail.filter((calendarDetail) => calendarDetail.calendarId === calendar.id);
        console.log(matchingCalendarDetail)
        return {
          key: calendar.id,
          id: calendar.id,
          fullName: matchingDentist ? matchingDentist.fullName : null,
          date: calendar.date,
          time: matchingCalendarDetail ? matchingCalendarDetail : null,
        };
      });

      console.log('data', fullCalendar)

      setData(fullCalendar)

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSwitchClick = () => {
    console.log('keyyyyyyy',modalKey)
    if (modalKey === '1') {
      console.log('11111111')
      handleAddCalendarDetail()
    } else {
      addCalendar()
    }
  }

  useEffect(() => {
     getAllData();
  }, [update, selectedDentist, selectedCalendar]);

  return (
    <div className={cx('container')}>
      <div className={cx('content')}>
        <div className={cx('add')}>
          <button className={cx('add-btn')} onClick={() => setModalOpen(true)} >Thêm +</button>
        </div>
        <Modal
          title="Lịch ca"
          centered
          open={modalOpen}
          onOk={handleSwitchClick}
          onCancel={() => setModalOpen(false)}
          okText="Thêm"
          cancelText="Hủy"
        >
          <Tabs 
          defaultActiveKey="1" 
          onChange={onChangeModalKey}>
            <TabPane
              key="1"
              tab={
                <span>
                  Thêm giờ khám
                </span>
              }
            >
              <Form
                labelCol={{
                  span: 12,
                }}
                wrapperCol={{
                  span: 14,
                }}
                layout="horizontal"
                style={{
                  maxWidth: 300,
                }}
              >
                <Form.Item label="Bác sĩ">
                  <Select
                    value={selectedDentist}
                    placeholder="Chọn bác sĩ"
                    onChange={(value) => setSelectedDentist(value)}
                    options={selectDentist}
                  />
                </Form.Item>
                <Form.Item label="Ngày">
                  <Select
                    value={selectedCalendar}
                    placeholder="Chọn ngày"
                    onChange={(value) => setSelectedCalendar(value)}
                    dropdownRender={(menu) => (
                      <div key={menu}>
                        {menu}
                        <Divider
                          style={{
                            margin: '8px 0',
                          }}
                        />
                      </div>
                    )}
                    options={selectCalendar.map((item) => ({
                      label: item.date,
                      value: item.id,
                    }))}
                  />
                </Form.Item>
                <Form.Item label="Giờ">
                  <TimePicker 
                    placeholder="Chọn giờ"
                    onChange={(time, timeString) => setSelectedTime(timeString)} 
                    defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')} 
                  />
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane
              key="2"
              tab={
                <span>
                  Thêm ngày khám
                </span>
              }
            >
              <Form
                labelCol={{
                  span: 12,
                }}
                wrapperCol={{
                  span: 14,
                }}
                layout="horizontal"
                style={{
                  maxWidth: 300,
                }}
              >
                <Form.Item label="Bác sĩ">
                  <Select
                    value={selectedDentist}
                    placeholder="Chọn bác sĩ"
                    onChange={(value) => setSelectedDentist(value)}
                    options={selectDentist}
                  />
                </Form.Item>
                <Form.Item label="Ngày">
                    <DatePicker 
                      value={selectedCalendar ? moment(selectedCalendar) : null}
                      ref={inputRef}
                      placeholder="Thêm ngày mới"
                      onChange={(date, dateString) => {setSelectedCalendar(dateString)}} 
                      dateFormat="yyyy/MM/dd"/>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Modal>
        <Form form={form} component={false}>
          <Table 
            components={{
              body: {
                cell: EditableCell,
              },
            }} 
            rowClassName="editable-row" 
            className={cx('table')} 
            columns={mergedColumns} 
            dataSource={data} 
            bordered 
            pagination={{ 
              onChange: cancel, 
              pageSize: 9, 
              pageSizeOptions: ['6', '10', '20', '50'],
            }} 
            scroll={{
              x: 1000,
              y: 400,
            }}
          />
        </Form>
      </div>
  </div>
  );
  
}

export default ManagerCalendar;
