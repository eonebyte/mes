import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, notification, Space } from "antd";

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

const ConfirmReadyMultiplePlan = ({ data, onSuccess }) => {
    Modal.confirm({
        title: 'Start Preparations',
        content: (
            <>
                <Divider />
                <span style={{ fontSize: '18px' }}>Are you sure to open this plan !</span>
                <Divider />
            </>
        ),
        styles: {
            content: {
                padding: 15,
            }
        },
        footer: (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                    <Button
                        color="default"
                        variant="text"
                        style={{
                            color: '#595959',
                            fontSize: '18px',
                            fontWeight: '600',
                            padding: '5px 10px'
                        }}
                        onClick={() => {
                            Modal.destroyAll();
                        }}
                    >
                        <StopOutlined style={{ color: '#595959' }} />
                        CANCEL
                    </Button>
                    <Button
                        color="default"
                        variant="text"
                        style={{
                            color: '#52c41a',
                            fontSize: '18px',
                            fontWeight: '600',
                            padding: '5px 10px'
                        }}
                        onClick={() => {

                            const planIdArray = data.map(item => item.planId);

                            fetch(`${backendUrl}${prefix}/plan/open/multiplan`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ planIdArray, status: 'OK' }),
                            })
                                .then(async res => {
                                    const data = await res.json();

                                    if (!res.ok) {
                                        // ✨ Gabungkan errors array (kalau ada)
                                        const errorMessages = Array.isArray(data.errors)
                                            ? data.errors.join(', ')
                                            : data.message || 'Unknown error';

                                        throw new Error(errorMessages);
                                    }

                                    notification.success({
                                        message: 'Status Updated',
                                        description: 'Plan status changed to Open.',
                                    });
                                    Modal.destroyAll();
                                    onSuccess?.();
                                })
                                .catch(error => {
                                    let description = error.message;

                                    let items = [];

                                    if (description.includes(', ')) {
                                        items = description.split(', ');
                                    } else {
                                        items = [description]; // kalau hanya 1 error, bungkus jadi array
                                    }


                                    // Render sebagai <ul> lengkap dengan link per item
                                    description = (
                                        <ul style={{ paddingLeft: 20, margin: 0 }}>
                                            {items.map((item, index) => {
                                                let link = null;

                                                if (item.toLowerCase().includes('bom')) {
                                                    link = <a href="" style={{ marginLeft: 8 }}>→ Klik tombol Material</a>;
                                                } else if (item.toLowerCase().includes('job order')) {
                                                    link = <a href="/plan/list" style={{ marginLeft: 8 }}>→ Periksa Mold</a>;
                                                }

                                                return (
                                                    <li key={index}>
                                                        {item}
                                                        {link}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    );

                                    notification.error({
                                        message: 'Error',
                                        description, // gunakan variabel yang sudah diolah
                                    });

                                    console.error('Error:', error);
                                });
                        }}
                    >
                        <CheckOutlined style={{ color: '#52c41a', }} />
                        OK
                    </Button>

                </Space>
            </div>
        ),
    });
};

export default ConfirmReadyMultiplePlan;
