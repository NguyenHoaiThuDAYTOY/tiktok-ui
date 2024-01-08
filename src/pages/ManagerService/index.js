import { useState, useEffect, useRef } from 'react';
import { sendRequest } from '~/utils/SendRequest';
import styles from './ManagerService.module.scss';
import classNames from 'classnames/bind';
import { Tabs, TimePicker, Divider, Modal, DatePicker, Select, Button, Space, Table, Input, Popconfirm, Dropdown, message, Form, Typography } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck, faShuffle, faCheck, faXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';

const cx = classNames.bind(styles);
dayjs.extend(customParseFormat);

const { TabPane } = Tabs;

function ManagerService() {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState();
  const account = JSON.parse(localStorage.getItem('account'));
  const [dentists, setDentists] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [services, setServices] = useState([]);
  const [calendarDetails, setCalendarDetails] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [update, setUpdate] = useState(false);
  const [updateRow, setUpdateRow] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState();
  const [selectedServiceCode, setSelectedServiceCode] = useState();
  const [selectedServicePrice, setSelectedServicePrice] = useState();
  const [calendar, setCalendar] = useState([]);
  const [calendarDetail, setCalendarDetail] = useState([]);
  const [modalKey, setModalKey] = useState('1');
  const inputRef = useRef(null);

  const handleAddService = async () => {
    if (data.includes(selectedServiceCode)) {
      message.error('Dịch vụ này đã có');
    } 
    else {
        try {
          console.log('name', selectedServiceName)
          const res = await sendRequest({
              url: `http://localhost:2001/service`,
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
                  name: selectedServiceName,
                  code: selectedServiceCode,
                  price: selectedServicePrice,
              })
          });
          console.log(res);
          if (res.error) {
            message.error(res.error);
            throw new Error(res.error);
          }
          message.success('Thêm dịch vụ thành công');
          setUpdate(!update);
          setSelectedServiceCode();
          setSelectedServiceName();
          setSelectedServicePrice();
          setModalOpen(false);
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
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      ...getColumnSearchProps('name'),
      fixed: 'left',
      editable: true,
    },
    {
      title: 'Mã dịch vụ',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      ...getColumnSearchProps('code'),
      editable: true,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      ...getColumnSearchProps('price'),
      editable: true,
    },
    {
      title: (
        <div className={cx('custom-header')}>
          Tác vụ
        </div>
      ),
      dataIndex: '',
      key: 'action',
      width: 50,
      fixed: 'right',
      render: (record) => {
      const editable = isEditing(record);
      return editable ? (
          <span className={cx('action')}>
            {console.log('data',record)}
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
        record,
        inputType: 'text',
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
      name: record.name,
      code: record.code,
      price: record.price,
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
              url: `http://localhost:2001/service/${id}`,
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              auth: {
                  username: account.username,
                  password: account.password,
              },
              data: JSON.stringify({
                  name: row.name,
                  code: row.code,
                  price: row.price,
              })
          });
          if (res.error) {
            message.error(res.error);
            throw new Error(res.error);
          }
          message.success('Cập nhật dịch vụ thành công');
          setUpdate(!update);
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
      label: 'Đặt lịch',
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

  const getAllData = async () => {
    try{
      //get data service
      const resService = await sendRequest({
        url: `http://localhost:2001/service`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setServices(resService);

      //get fileld schedule data
      const fullSerrvice = resService.map((service) => {
        return {
          key: service.id,
          id: service.id,
          name: service.name,
          price: service.price,
          code: service.code,
        };
      });

      console.log('data', fullSerrvice)

      setData(fullSerrvice)

    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
     getAllData();
  }, [update, selectedServiceCode, selectedServiceName, selectedServicePrice]);

  return (
    <div className={cx('container')}>
      <div className={cx('content')}>
        <div className={cx('add')}>
          <button className={cx('add-btn')} onClick={() => setModalOpen(true)} >Thêm +</button>
        </div>
        <Modal
          title="Thêm dịch vụ"
          centered
          open={modalOpen}
          onOk={handleAddService}
          onCancel={() => setModalOpen(false)}
          okText="Thêm"
          cancelText="Hủy"
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
            <Form.Item label="Tên dịch vụ">
              <Input
                value={selectedServiceName}
                onChange={(e) => setSelectedServiceName(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Mã dịch vụ">
              <Input
                value={selectedServiceCode}
                onChange={(e) => setSelectedServiceCode(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Đơn giá">
              <Input
                value={selectedServicePrice}
                onChange={(e) => setSelectedServicePrice(e.target.value)}
              />
            </Form.Item>
          </Form>
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
              x: 900,
              y: 400,
            }}
          />
        </Form>
      </div>
  </div>
  );
  
}

export default ManagerService;
