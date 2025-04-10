import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, notification, Select, Space } from "antd";


const ConfirmSetup = ({ planId, resourceId, onSuccess }) => {

    let selectedStatus = null;
    const onChange = (value) => {
        selectedStatus = value;
    };
    const onSearch = (value) => {
        selectedStatus = value;
    };
    Modal.confirm({
        title: 'Confirm Setup',
        content: (
            <> <Divider />
                <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Select a setup"
                    optionFilterProp="label"
                    onChange={onChange}
                    onSearch={onSearch}
                    options={[
                        {
                            value: 'SETUP_MOLD',
                            label: 'Setup Mold',
                        },
                        {
                            value: 'TEARDOWN_MOLD',
                            label: 'Teardown Mold',
                        },
                        {
                            value: 'SETTINGS',
                            label: 'Settings',
                        },
                    ]}
                />
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
                            fetch('http://localhost:3080/api/plans/status/event', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ planId, resourceId, status: selectedStatus }),
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
                                        description: `Plan status changed to ${selectedStatus}`,
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
                                                } else if (item.toLowerCase().includes('mold pada mesin')) {
                                                    link = <a href={`/resource/mold?resourceId=${resourceId}`} style={{ marginLeft: 8 }}>→ Periksa Mold</a>;
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

export default ConfirmSetup;