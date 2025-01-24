import { useState } from 'react';
import { Form, Input, Button, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '/src/assets/images/logoadw.png';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../states/reducers/authSlice';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoading = useSelector((state) => state.auth.isLoading);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const onFinish = () => {
        dispatch(login({ username, password })).then(async (result) => {
            if (result.payload && result.payload.success) {
                navigate('/shopfloor');
            } else {
                message.error(result.payload ? result.payload.message : 'Login failed');
            }
        });
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f0f2f5',
                backgroundImage: 'url(/src/assets/images/bg-login2.jpg)', // Correct way to define background image
                backgroundSize: 'cover', // To make sure the background image covers the entire screen
                backgroundPosition: 'center', // Center the background image
            }}
        >
            <Row justify="center" align="middle" style={{ width: '100%' }}>
                <Col xs={24} sm={16} md={12} lg={8}>
                    <div
                        style={{
                            backgroundImage: 'url(/src/assets/images/bg-card2.png)', // Tambahkan background pada card
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            padding: 40,
                            borderRadius: 5,
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {/* Displaying the logo */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <img src={logo} alt="Logo" style={{ width: '120px', height: 'auto' }} />
                        </div>
                        <Form
                            name="login_form"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            size="large"
                        >
                            <Form.Item
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                rules={[{ required: true, message: 'Please enter your username!' }]}
                                style={{
                                    borderRadius: '10px',
                                }}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Username"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                rules={[{ required: true, message: 'Please enter your password!' }]}
                                style={{
                                    borderRadius: '10px',
                                }}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Password"
                                />
                            </Form.Item>
                            {/* 
                            <Form.Item name="remember" valuePropName="checked">
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item> */}

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={isLoading}
                                >
                                    Log In
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Login;
