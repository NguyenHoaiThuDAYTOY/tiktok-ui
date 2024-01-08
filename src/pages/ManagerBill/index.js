import { useState, useEffect, useRef } from 'react';
import { sendRequest } from '~/utils/SendRequest';
import styles from './ManagerBill.module.scss';
import classNames from 'classnames/bind';
import { Popover, Modal, Select, Button, Space, Table, Input, Popconfirm, Dropdown, message, Form, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck, faShuffle, faCheck, faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ManagerBill() {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [data, setData] = useState();
  const account = JSON.parse(localStorage.getItem('account'));
  const [dentists, setDentists] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [update, setUpdate] = useState(false);
  const [updateRow, setUpdateRow] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState();
  const [selectedCustomer, setSelectedCustomer] = useState();
  const [selectedService, setSelectedService] = useState();

  const handleAddInvoice = async () => {
    console.log('dentistttttt', selectedDentist)
    console.log('customerrrrrrrr', selectedCustomer)
    console.log('servicerrrr', selectedService)
    try {
      const resCreateInvoice = await sendRequest({
        url: `http://localhost:2001/order`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        auth: {
            username: account.username,
            password: account.password,
        },
        data: JSON.stringify({
          dentistId: selectedDentist,
          customerId: selectedCustomer,
          status: 'pending',
          lastModifiedBy: account.id,
        }),
      });
      console.log('updatetttttttttdetailllll', resCreateInvoice);
      if (resCreateInvoice.message) {
          throw new Error(resCreateInvoice.message);
      }
      for(let i = 0; i < (selectedService.length); i++) {
        const resCreateOrderDetail = await sendRequest({
          url: `http://localhost:2001/order-detail`,
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          auth: {
              username: account.username,
              password: account.password,
          },
          data: JSON.stringify({
              serviceId: selectedService[i],
              orderId: resCreateInvoice.id,
              price: selectedService[i],
          }),
        });
        console.log('updatetttttttttdetailllll', resCreateOrderDetail);
        if (resCreateOrderDetail.message) {
            throw new Error(resCreateOrderDetail.message);
        }
      }
      setSelectedCustomer();
      setSelectedDentist();
      setSelectedService();
      message.success('Lập hóa đơn thành công');
      setUpdate(!update);
      setModalOpen(false);

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
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 200,
      ...getColumnSearchProps('customerName'),
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'dentistName',
      key: 'dentistName',
      width: 200,
      ...getColumnSearchProps('dentistName'),
      fixed: 'left',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'service',
      key: 'service',
      editable: true,
      width: 200,
      render: (record) =>
        <Space >
          {console.log('recordddddddddd', record)}
          <Popover 
            content={record.map((item, index) => (
              <div key={index} className={cx('service-item')}>
                  <div>
                    {item.serviceName}
                  </div>
                  <div className={cx('service-price')}>
                    {item.price}
                  </div>
              </div>
            ))} 
            title="Dịch vụ"
          >
            <Button>Xem chi tiết</Button>
          </Popover>
        </Space>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      ...getColumnSearchProps('total'),
    },
    {
      title: 'Trạng thái',
      dataIndex: '',
      key: 'status',
      // width: 70,
      filters: [
        {
          text: 'Đã thanh toán',
          value: 'paided',
        },
        {
          text: 'Chưa thanh toán',
          value: 'pending',
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
            <div className={record.status === 'paided' ? cx('blue') : cx('grey')}>
              {record.status === 'paided' ? 'Đã thanh toán' : 'Chưa thanh toán'}
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
    const inputNode = inputType === 'add-service' ? 
      <div>
          <Space
            style={{
              width: '100%',
            }}
            direction="vertical"
          >
            {console.log('defffffffffffff', defaultValue)}
            {console.log('optionnnnnn', options)}
            <Select
              mode="multiple"
              allowClear
              style={{
                width: '100%',
              }}
              placeholder="Chọn dịch vụ"
              defaultValue={defaultValue}
              onChange={handleChangeService}
              options={options}
              optionLabelProp='price'
            />
          </Space>
      </div> : 'select' ? 
      <Select 
        options={options} 
        onChange={handleChange} 
        labelInValue 
        defaultValue={defaultValue}
      /> : <Input />;
    return (
      <td {...restProps}>
        {editing? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: inputType === 'add-service'? false : true,
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
        options: col.dataIndex === 'service' ?
        services.map(service => ({
          label: service.name,
          value: service.id,
          price: service.price,
          title: 'service',
        })) : null,
        defaultValue: col.dataIndex === 'service' ?
        record.service.map(service => ({
          label: service.serviceName,
          value: service.id,          
          price: service.price,
        })) : null,
        record,
        inputType: col.dataIndex === 'service' ? 'add-service' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  
  const handleChangeService = async (selected, price) => {
    console.log(`selecteddddddd ${selected}`);
    try {
      const resOrderDetail = await sendRequest({
          url: `http://localhost:2001/order-detail?orderId=${editingKey}`,
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          auth: {
              username: account.username,
              password: account.password,
          },
      });
      console.log('detailllll', resOrderDetail);
      console.log('lengthhh', selected.length);
      if (resOrderDetail.message) {
          throw new Error(resOrderDetail.message);
      }

      if (selected.length > resOrderDetail.length){
        for(let i = resOrderDetail.length; i < (selected.length); i++) {
          const resUpdateOrderDetail = await sendRequest({
            url: `http://localhost:2001/order-detail`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: account.username,
                password: account.password,
            },
            data: JSON.stringify({
              serviceId: selected[i] === 0 ? null : selected[i],
              orderId: editingKey,
              price: price[i].price,
            }),
          });
          console.log('updatetttttttttdetailllll', resUpdateOrderDetail);
          if (resUpdateOrderDetail.message) {
              throw new Error(resUpdateOrderDetail.message);
          }
        }
      } else if (selected.length <= resOrderDetail.length) {
        for(let i = 0; i < resOrderDetail.length; i++) {
          const resUpdateOrderDetail = await sendRequest({
            url: `http://localhost:2001/order-detail/${resOrderDetail[i].id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: account.username,
                password: account.password,
            },
            data: i < selected.length ? JSON.stringify({
                serviceId:  selected[i],
                price: price[i].price,
            }) : JSON.stringify({
              serviceId:  null,
              price: 0,
          }),
          });
          console.log('updatetttttttttdetailllll', resUpdateOrderDetail);
          if (resUpdateOrderDetail.message) {
              throw new Error(resUpdateOrderDetail.message);
          }
        }
        const resOrderDetailAfter = await sendRequest({
          url: `http://localhost:2001/order-detail?orderId=${editingKey}`,
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
          auth: {
              username: account.username,
              password: account.password,
          },
        });
        if (resOrderDetailAfter.message) {
            throw new Error(resOrderDetailAfter.message);
        }
        const resUpdateTotalInvoice = await sendRequest({
          url: `http://localhost:2001/order/${editingKey}`,
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          auth: {
              username: account.username,
              password: account.password,
          },
          data: {
            total: resOrderDetailAfter.reduce((sum, item) => sum + parseFloat(item.price), 0),
          },
        });
        if (resUpdateTotalInvoice.message) {
            throw new Error(resUpdateTotalInvoice.message);
        }
      }
      
      // message.success('Cập nhật trạng thái thành công');
      // setUpdate(!update);
    } catch (error) {
        console.log(error);
    }
  };

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
    if(record.status === 'paided'){
      message.info('Hóa đơn này đã thanh toán');
    } else {
      form.setFieldsValue({
        symptom: record.symptom,
      });
      setEditingKey(record.id);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id) => {
  console.log(`selecteddddddd ${selectedService}`);
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
          message.success('Cập nhật hóa đơn thành công');
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
      label: 'Thanh toán',
      key: 'paided',
      icon: <FontAwesomeIcon className={cx('blue')} icon={faCalendarCheck} />,
      disabled: false,
    },
    {
      label: 'Hủy thanh toán',
      key: 'pending',
      icon: <FontAwesomeIcon className={cx('red')} icon={faXmark} />,
      disabled: false,
    },
  ];

  const handleChangeStatusClick = async (e, item) => {
    console.log('click', item.status, e);
    try {
      const res = await sendRequest({
          url: `http://localhost:2001/order/${item.id}`,
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
      if (resDentist.message) {
          throw new Error(resDentist.message);
      }

      //get data Customer
      const resCustomer = await sendRequest({
        url: `http://localhost:2001/customer`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setCustomers(resCustomer);
      if (resCustomer.message) {
          throw new Error(resCustomer.message);
      }

      //get data order
      const resOrder = await sendRequest({
        url: `http://localhost:2001/order`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setOrders(resOrder);
      if (resOrder.message) {
          throw new Error(resOrder.message);
      }

      //get data order detail
      const resOrderDetail = await sendRequest({
        url: `http://localhost:2001/order-detail`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setOrderDetails(resOrderDetail)
      if (resOrderDetail.message) {
          throw new Error(resOrderDetail.message);
      }

      const resService = await sendRequest({
        url: `http://localhost:2001/service`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      });
      setServices(resService)
      if (resService.message) {
          throw new Error(resService.message);
      }
      
      //get fileld schedule data
      const fullBill = resOrder.map((order) => {
        const matchingDentist = resDentist.find((dentist) => dentist.id === order.dentistId);
        const matchingCustomer = resCustomer.find((customer) => customer.id === order.customerId);
        const matchingOrderDetail = resOrderDetail.filter((orderDetail) => orderDetail.orderId === order.id && orderDetail.serviceId !== null);
        console.log('datadetaillllllllllll', matchingOrderDetail)
        const matchingService = matchingOrderDetail.map((orderDetail) => {
          const matchingServiceName = resService.find((service) => service.id === orderDetail.serviceId );
          return { id: matchingServiceName?.id, serviceName: matchingServiceName?.name, price: matchingServiceName?.price}
        })
        console.log('dataserviceeeeeeeeeeee', matchingService)
        return {
          key: order.id,
          id: order.id,
          status: order.status,
          total: order.total,
          dentistName: matchingDentist ? matchingDentist.fullName : null,
          customerName: matchingCustomer ? matchingCustomer.fullName : null,
          service: matchingService ? matchingService : null,
        };
      });

      console.log('data', fullBill)

      setData(fullBill)

    } catch (error) {
      console.error('Error:', error);
    }
  };
  console.log('dataaaaaaaaaaaaaa', data)

  useEffect(() => {
     getAllData();
  }, [update, selectedDentist, selectedCustomer, selectedService]);

  return (
    <div className={cx('container')}>
      <div className={cx('content')}>
        <div className={cx('add')}>
          <button className={cx('add-btn')} onClick={() => setModalOpen(true)} >Lập hóa đơn +</button>
        </div>
        <Modal
          title="Lập hóa đơn"
          centered
          open={modalOpen}
          onOk={handleAddInvoice}
          onCancel={() => setModalOpen(false)}
          okText="Lập"
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
                <Form.Item label="Bác sĩ">
                  <Select
                    placeholder="Chọn bác sĩ"
                    value={selectedDentist}
                    onChange={(value) => setSelectedDentist(value)}
                    options={
                      dentists.map(dentist => ({
                        label: dentist.fullName,
                        value: dentist.id,
                        title: 'dentist',
                      })) 
                    }
                  />
                </Form.Item>
                <Form.Item label="Khách hàng">
                  <Select
                    placeholder="Chọn khách hàng"
                    value={selectedCustomer}
                    onChange={(value) => setSelectedCustomer(value)}
                    options={
                      customers.map(customer => ({
                        label: customer.fullName,
                        value: customer.id,
                        title: 'customer',
                      })) 
                    }
                  />
                </Form.Item>
                <Form.Item
                  name="select-service"
                  label="Dịch vụ"
                  rules={[
                    {
                      required: true,
                      message: 'Mời bạn chọn dịch vụ cho hóa đơn!',
                      type: 'array',
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    style={{
                      width: '100%',
                    }}
                    value={selectedService}
                    defaultValue={selectedService}
                    placeholder="Chọn dịch vụ"
                    onChange={(value) => setSelectedService(value)}
                    options={
                      services.map(service => ({
                        label: service.name,
                        value: service.id,
                        title: 'service',
                      })) 
                    }
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
              x: 1100,
              y: 350,
            }}
          />
        </Form>
      </div>
  </div>
  );
  
}

export default ManagerBill;
