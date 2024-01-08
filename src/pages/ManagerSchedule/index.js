import { useState, useEffect, useRef } from 'react';
import { sendRequest } from '~/utils/SendRequest';
import styles from './ManagerSchedule.module.scss';
import classNames from 'classnames/bind';
import { Select, Button, Space, Table, Input, Popconfirm, Dropdown, message, Form, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCheck, faCalendarXmark, faCircleCheck, faCalendarCheck, faShuffle, faMagnifyingGlass, faPlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ManagerSchedule() {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState();
  const account = JSON.parse(localStorage.getItem('account'));
  const [schedules, setSchedules] = useState([]);
  const [customers, setCustomer] = useState([]);
  const [dentists, setDentists] = useState([]);
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
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      width: 200,
      ...getColumnSearchProps('customer'),
      fixed: 'left',
      editable: true,
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'dentist',
      key: 'dentist',
      width: 150,
      ...getColumnSearchProps('dentist'),
      editable: true,
    },
    {
      title: 'Ngày',
      dataIndex: 'calendar',
      key: 'calendar',
      width: 150,
      ...getColumnSearchProps('calendar'),
      editable: true,
    },
    {
      title: 'Giờ',
      dataIndex: 'calendarDetail',
      key: 'calendarDetail',
      width: 150,
      ...getColumnSearchProps('calendarDetail'),
      editable: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: '',
      key: 'status',
      // width: 50,
      // ...getColumnSearchProps('status'),
      filters: [
        {
          text: 'Đã hủy',
          value: 'Đã hủy',
        },
        {
          text: 'Đã khám',
          value: 'Đã khám',
        },
        {
          text: 'Đã xác nhận',
          value: 'Đã xác nhận',
        },
        {
          text: 'Chờ xác nhận',
          value: 'Chờ xác nhận',
        },
      ],
      onFilter: (value, record) => record.status.indexOf(value) === 0,
      render: (record) =>
        <Space >
          <Dropdown.Button
            menu={{
              items,
              onClick: (e) => handleChangeStatusClick(e, record),
            }} 
            placement="bottom" 
            icon={<FontAwesomeIcon icon={faShuffle} />}
          >
            <div className={record.status === 'Đã xác nhận' ? cx('green') : record.status === 'Đã hủy' ? cx('red') : record.status === 'Đã khám' ? cx('blue') : cx('grey')}>
              {record.status}
            </div>
          </Dropdown.Button>
        </Space>
    },
    {
      title: 'Tác vụ',
      dataIndex: '',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (record) => {
      const editable = isEditing(record);
      return editable ? (
        <span className={cx('action')}>
          <Typography.Link
            onClick={() => save(record.id)}
            style={{
              marginRight: 8,
            }}
          >
            <FontAwesomeIcon icon={faCheck} className={cx('save')}/>
          </Typography.Link>
          <Popconfirm 
            title="Bạn có chắc muốn hủy?" 
            onConfirm={cancel} 
            okText="Hủy" 
            cancelText="Không"
          >
            <a><FontAwesomeIcon icon={faXmark} className={cx('cancel')}/></a>
          </Popconfirm>
        </span>
      ) : (
        <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
          <div className={cx('action')}>
          <FontAwesomeIcon className={cx('edit-icon')} icon={faPenToSquare} />
          </div>
        </Typography.Link>
      );
    },
        
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
        dentistsHasCalendar.map(dentist => ({
          label: dentist.fullName,
          value: dentist.id,
          title: 'dentist'
        })) : col.dataIndex === 'customer' ?
        customers.map(customer => ({
          label: customer.fullName,
          value: customer.id,
          title: 'customer'
        })) : col.dataIndex === 'calendar' ?
        calendarsOption : 
        calendarDetailsOption,
        defaultValue: col.dataIndex === 'dentist' ?
        {
          label: record.dentist,
          value: record.dentist,
        } : col.dataIndex === 'customer' ?
        {
          label: record.customer,
          value: record.customer,
        } : col.dataIndex === 'calendar' ?
        null: 
        null,
        record,
        inputType: col.dataIndex === 'dentist' || col.dataIndex === 'customer' || col.dataIndex === 'calendar' || col.dataIndex === 'calendarDetail' ? 'select' : 'text',
        dataIndex: col.dataIndex ,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleChange = (selected) => {
    console.log(selected); 
    console.log('changeeeeeeeeeeee', calendars.filter(calendar => calendar.dentistId === selected.value).map(calendar => ({
      label: calendar.date,
      value: calendar.id,
      title: 'calendar'
    })) )
    if (selected.title === 'customer') {
      updateRow.customerId = selected.value
      setUpdateRow(updateRow)
      
    } else if (selected.title === 'dentist') {
      updateRow.dentistId = selected.value
      setUpdateRow(updateRow)
      setCalendarsOption(calendarsHasDetail.filter(calendar => calendar.dentistId === selected.value).map(calendar => ({
        label: calendar.date,
        value: calendar.id,
        title: 'calendar'
      })))
      
    } else if (selected.title === 'calendar') {
      updateRow.calendarId = selected.value
      setUpdateRow(updateRow)
      setCalendarDetailsOption(calendarDetailsWithActive.filter(calendarDetail => calendarDetail.calendarId === selected.value).map(calendarDetail => ({
        label: calendarDetail.time,
        value: calendarDetail.id,
        title: 'calendarDetail'
      })))

    } else if (selected.title === 'calendarDetail') {
      updateRow.calendarDetailId = selected.value
    setUpdateRow(updateRow)

    }
    console.log('updateeeeeeeee', updateRow)
  };

  const edit = (record) => {
    form.setFieldsValue({
      customer: record.customer,
      dentist: record.dentist,
      calendar: record.calendar,
      calendarDetail: record.calendarDetail,
    });
    setEditingKey(record.id);
    setUnSelectCalendarDetail(record.calendarDetailId);
    console.log('testttttttt', record.calendarDetailId)
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
                  customerId: updateRow?.customerId,
                  dentistId: updateRow?.dentistId,
                  calendarId: updateRow?.calendarId,
                  calendarDetailId: updateRow?.calendarDetailId,
              })
          });
          if (res.message) {
            throw new Error(res.message);
          }
          if(updateRow?.calendarDetailId) {
            const resUpdateInactive = await sendRequest({
              url: `http://localhost:2001/calendar-detail/${updateRow.calendarDetailId}`,
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
            if (resUpdateInactive.message) {
              throw new Error(resUpdateInactive.message);
            }
            const resUpdateActive = await sendRequest({
              url: `http://localhost:2001/calendar-detail/${unSelectCalendarDetail}`,
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
            if (resUpdateActive.message) {
              throw new Error(resUpdateActive.message);
            }
          }
          setUpdate(!update);
          message.success('Cập nhật lịch khám thành công');
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
      label: 'Xác nhận',
      key: 'confirmed',
      icon: <FontAwesomeIcon className={cx('green')} icon={faCalendarCheck}/>,
    },
    {
      label: 'Đã khám',
      key: 'done',
      icon: <FontAwesomeIcon className={cx('blue')} icon={faCircleCheck} />,
      disabled: false,
    },
    {
      label: 'Hủy',
      key: 'cancelled',
      icon: <FontAwesomeIcon className={cx('red')} icon={faCalendarXmark} />,
      disabled: false,
    },
  ];

  const handleChangeStatusClick = async (e, record) => {
    console.log('click', record, e);
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
        if(e.key === 'cancelled') {
          const resActiveCalendar = await sendRequest({
            url: `http://localhost:2001/calendar-detail/${record.calendarDetailId}`,
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
        }
      } catch (error) {
          console.log(error);
      }
    }  
  };
  
  const getAllData = async () => {
    try{
      //get data schedules
      const resSchedule = await sendRequest({
        url: `http://localhost:2001/schedule`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSchedules(resSchedule);
      if (resSchedule.message) {
        throw new Error(resSchedule.message);
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
    <div className={cx('container')}>
      <div className={cx('content')}>
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
              x: 950,
              y: 400,
            }}
          />
        </Form>
      </div>
  </div>
  );
  
}

export default ManagerSchedule;
