import { useState, useEffect, useRef } from 'react';
import { sendRequest } from '~/utils/SendRequest';
import styles from './CustomerAcc.module.scss';
import classNames from 'classnames/bind';
import { Select, Button, Space, Table, Input, Popconfirm, Popover, message, Form, Typography, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCheck, faCalendarXmark, faCircleCheck, faCalendarCheck, faShuffle, faMagnifyingGlass, faPlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function CustomerAcc() {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState();
  const account = JSON.parse(localStorage.getItem('account'));
  const [accounts, setAccounts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [update, setUpdate] = useState(false);
  const [updateRow, setUpdateRow] = useState({});
  const [password, setPassword] = useState('');
  const [updateId, setUpdateId] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = (id) => {
    setIsModalOpen(true); 
    setUpdateId(id)
  }
  const handleChangePassword = async () => {
    try {
        console.log('id', updateId)
        const res = await sendRequest({
            url: `http://localhost:2001/account/${updateId}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: account.username,
                password: account.password,
            },
            data: JSON.stringify({
                password: password,
            })
        });
        setIsModalOpen(false);
        message.success('Đổi mật khẩu thành công');
        setUpdate(!update);
        console.log('change',res)
        if (res.message) {
            throw new Error(res.message);
        }
    } catch (error) {
        console.log(error);
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
      title: (
        <div className={cx('custom-header')}>
          Tên tài khoản
        </div>
      ),
      dataIndex: 'username',
      key: 'username',
      width: 250,
      ...getColumnSearchProps('username'),
      fixed: 'left',
      editable: true,
    },
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
        editable: true,
    },
    {
      title: (
        <div className={cx('custom-header')}>
          Mật khẩu
        </div>
      ),
      dataIndex: 'password',
      key: 'password',
      width: 250,
      render: () => {
        return (
            <input type='password' defaultValue={'xxxxxxxx'} className={cx('password')}/>
        );
      },
    },
    {
      title: (
        <div className={cx('custom-header')}>
          Quyền
        </div>
      ),
      dataIndex: 'permission',
      key: 'permission',
      render: (record) => {
        return (
            <div> 
                {
                    record == 'admin' ? 'Quản trị' : record == 'customer' ? 'Người dùng' : 'Nhân viên'
                }
            </div>
        );
      },
      filters: [
        {
            text: 'Quản trị',
            value: 'admin',
        },
        {
            text: 'Người dùng',
            value: 'customer',
        },
        {
            text: 'Nhân viên',
            value: 'staff',
        },
      ],
      onFilter: (value, record) => {
        console.log('Filter', record)
        if (value === 'staff') {
        return record.permission === 'dentist' || record.permission === 'receptionist';
        }
        return record.permission === value;
      },
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
      width: 150,
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
          <div className={cx('action')}>
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                <FontAwesomeIcon className={cx('edit-icon')} icon={faPenToSquare} />
            </Typography.Link>
            <Popover content='Đổi mật khẩu' title={null}>
                <Button onClick={() => handleOpenModal(record.id)} className={cx('change-pasword')} ><FontAwesomeIcon className={cx('change-pasword-icon')} icon={faShuffle} /></Button>
            </Popover>
          </div>
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
        // defaultValue={defaultValue}
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
              value: 'dentist',
              label: 'Bác sĩ',
            },
            {
              value: 'admin',
              label: 'Quản trị',
            },
            {
                value: 'receptionist',
                label: 'Lễ tân',
            },
            {
                value: 'customer',
                label: 'Người dùng',
            },
        ],
        // defaultValue:
        // {
        //   label: record.permission,
        //   value: record.permission,
        // },
        record,
        inputType: col.dataIndex === 'permission' ? 'select' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleChange = (selected) => {
    console.log(selected); 
    updateRow.permission = selected.value
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
              url: `http://localhost:2001/account/${id}`,
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              auth: {
                  username: account.username,
                  password: account.password,
              },
              data: JSON.stringify({
                  username: row.username,
                  permission: updateRow.permission,
              })
          });
          message.success('Cập nhật tài khoản thành công');
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
  
  const getData = async () => {
    try{
      //get data customer
      const resAccount = await sendRequest({
        url: `http://localhost:2001/account`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
       });
       console.log('data',resAccount);

      //get data customer
      const resCustomer = await sendRequest({
        url: `http://localhost:2001/customer`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (resCustomer.message) {
          throw new Error(resCustomer.message);
      }

      const fullAccount = resAccount.map((account) => {
        const matchingCustomer = resCustomer.find((customer) => customer.id == account.userId);
        console.log(matchingCustomer)
        if (matchingCustomer){
            return {
                key: account.id,
                fullName: matchingCustomer.fullName,
                ...account,
              };
        } else {
            return {
                key: account.id,
                ...account,
            };
        }

      });

      setData(fullAccount);


      if (resAccount.message) {
          throw new Error(resAccount.message);
      }

    } catch (error) {
      console.error('Error:', error);
    }
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
              x: 1050,
              y: 350,
            }}
            rowClassName={cx('editable-row', 'custom-row')}
          />
        </Form>
        <Modal 
            className={cx('modal-password')} 
            title="Đổi mật khẩu" 
            open={isModalOpen} 
            onOk={() => handleChangePassword()} 
            onCancel={() => setIsModalOpen(false)}
            okText="Đổi"
            cancelText="Hủy"
        >
            <Input.Password 
                className={cx('input-password')} 
                placeholder="Mật khẩu mới" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
            />
        </Modal>
      </div>
  </div>
  );
  
}

export default CustomerAcc;
