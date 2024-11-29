import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, Select, Space } from "antd";


const ConfirmSetup = () => {
    const onChange = (value) => {
        console.log(`selected ${value}`);
    };
    const onSearch = (value) => {
        console.log('search:', value);
    };
    Modal.confirm({
        title: 'Confirm Setup',
        content: (
            <> <Divider />
                <Select
                    showSearch
                    style={{width: '100%'}}
                    placeholder="Select a setup"
                    optionFilterProp="label"
                    onChange={onChange}
                    onSearch={onSearch}
                    options={[
                        {
                            value: 'Setup Mold',
                            label: 'Setup Mold',
                        },
                        {
                            value: 'Teardown Mold',
                            label: 'Teardown Mold',
                        },
                        {
                            value: 'Settings',
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
                            alert('OK');
                            Modal.destroyAll();
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