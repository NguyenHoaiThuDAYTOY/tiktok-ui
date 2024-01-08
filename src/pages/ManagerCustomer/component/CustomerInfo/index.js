import { useState, useEffect, useRef } from 'react';
import { sendRequest } from '~/utils/SendRequest';
import styles from './CustomerInfo.module.scss';
import classNames from 'classnames/bind';
import { Select, Button, Space, Table, Input, Popconfirm, Dropdown, message, Form, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCheck, faCalendarXmark, faCircleCheck, faCalendarCheck, faShuffle, faMagnifyingGlass, faPlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function CustomerInfo() {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState();
  const account = JSON.parse(localStorage.getItem('account'));
  const [customers, setCustomer] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [update, setUpdate] = useState(false);
  const [updateRow, setUpdateRow] = useState({});

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
      title: (
        <div className={cx('custom-header')}>
          Tên khách hàng
        </div>
      ),
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      ...getColumnSearchProps('fullName'),
      fixed: 'left',
      editable: true,
    },
    {
      title: (
        <div className={cx('custom-header')}>
          Ngày sinh
        </div>
      ),
      dataIndex: 'DOB',
      key: 'DOB',
      width: 150,
      ...getColumnSearchProps('DOB'),
      editable: true,
    },
    {
      title: (
        <div className={cx('custom-header')}>
          Giới tính
        </div>
      ),
      dataIndex: 'gender',
      key: 'gender',
      width: 120,
      render: (record) => {
        return (
            <div> 
                {
                    record == '1' ? 'Nam' : record == '0' ? 'Nữ' : null
                }
            </div>
        );
      },
      filters: [
        {
          text: 'Nam',
          value: 1,
        },
        {
          text: 'Nữ',
          value: 0,
        },
      ],
      onFilter: (value, record) => record.gender.indexOf(value) === 0,
      editable: true,
    },
    {
      title: (
        <div className={cx('custom-header')}>
          Email
        </div>
      ),
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ...getColumnSearchProps('email'),
      editable: true,
    },
    {
      title: (
        <div className={cx('custom-header')}>
          Số điện thoại
        </div>
      ),
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      ...getColumnSearchProps('phone'),
      editable: true,
    },
    {
        title: (
            <div className={cx('custom-header')}>
              CMND
            </div>
        ),
        dataIndex: 'identity',
        key: 'identity',
        width: 150,
        ...getColumnSearchProps('identity'),
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
      width: 100,
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
    options,
    defaultValue,
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
        options: [
            {
              value: '1',
              label: 'Nam',
            },
            {
              value: '0',
              label: 'Nữ',
            },
        ],
        defaultValue:
        {
          label: record.gender,
          value: record.gender,
        },
        record,
        inputType: col.dataIndex === 'gender' ? 'select' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleChange = (selected) => {
    console.log(selected); 
    updateRow.gender = selected.value
    setUpdateRow(updateRow)
  };

  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id) => {
    try {
      const row = await form.validateFields();
      console.log(row)
      const newData = [...data];
      if (newData.find((item) => id === item.id)) {
        try {
          const res = await sendRequest({
              url: `http://localhost:2001/customer/${id}`,
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              auth: {
                  username: account.username,
                  password: account.password,
              },
              data: JSON.stringify({
                  fullName: row.fullName,
                  DOB: row.DOB,
                  email: row.email,
                  phone: row.phone,
                  identity: row.identity,
                  gender: updateRow.gender,
              })
          });
          if (res.error) {
              message.error(res.error);
              throw new Error(res.error);
          }
          message.success('Cập nhật thông tin thành công');
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
  
  const getData = async () => {
    try{
      //get data customer
      const resCustomer = await sendRequest({
        url: `http://localhost:2001/customer`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      const keyCustomer = resCustomer.map((customer) => {
        return {
          key: customer.id,
          ...customer,
        };
      });

      setData(keyCustomer);

      if (resCustomer.message) {
          throw new Error(resCustomer.message);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const customRowClassName = (record, index) => {
    // Áp dụng các lớp CSS tùy chỉnh dựa trên điều kiện
    return ;
  };

  useEffect(() => {
     getData();
  }, [update]);

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
              x: 1150,
              y: 350,
            }}
            rowClassName={cx('editable-row', 'custom-row')}
          />
        </Form>
      </div>
  </div>
  );
  
}

export default CustomerInfo;
