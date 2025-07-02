import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, notification, Space } from "antd";

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const prefix = '/api/v1';

const ConfirmStart = ({ planId, navidate, resourceId }) => {
    Modal.confirm({
        title: 'Confirm Start',
        content: (
            <>
                <Divider />
                <span style={{ fontSize: '18px' }}>Are you sure to start the task ?</span>
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
                            color: 'red',
                            fontSize: '18px',
                            fontWeight: '600',
                            padding: '5px 10px'
                        }}
                        onClick={() => {
                            Modal.destroyAll();
                        }}
                    >
                        <StopOutlined style={{ fontSize: '18px', color: 'red' }} />
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
                            fetch(`${backendUrl}${prefix}/plan/resource/start`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ planId, resourceId }),
                                credentials: 'include',
                            })
                                .then(async res => {
                                    const data = await res.json();

                                    if (!res.ok) {
                                        // ✨ Gabungkan errors array (kalau ada)
                                        const errorMessages = Array.isArray(data.messages)
                                            ? data.messages.join(', ')
                                            : data.message || 'Unknown error';

                                        throw new Error(errorMessages);
                                    }
                                    notification.success({
                                        message: 'Status Updated',
                                        description: 'Plan status changed to START.',
                                    });
                                    Modal.destroyAll();
                                    navidate(`/resource?resourceId=${resourceId}`);
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
                                                } else if (item.toLowerCase().includes('pada mesin')) {
                                                    link = <a href={`/resource/mold?resourceId=${resourceId}`} style={{ marginLeft: 8 }}>→ Periksa Mold</a>;
                                                } else if (item.toLowerCase().includes('job order')) {
                                                    link = <a href={`/plan/list`} style={{ marginLeft: 8 }}>→ Periksa Plan</a>;
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
                        <CheckOutlined style={{ fontSize: '24px', color: '#52c41ad' }} />
                        OK
                    </Button>
                </Space>
            </div>
        ),
    });
};

export default ConfirmStart;