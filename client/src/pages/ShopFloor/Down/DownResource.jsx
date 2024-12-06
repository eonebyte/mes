import { Alert, Col, Spin } from "antd";
import { resources } from "../../../data/fetchResource";
import { useSearchParams } from "react-router-dom";
import DetailResource from "../DetailResource";
import { useEffect, useState } from "react";
import DownWithCategory from "../../../components/ShopFloors/Down/DownWithCategory";
import DownWithoutCategory from "../../../components/ShopFloors/Down/DownWithoutCategory";
import DownHistory from "../../../components/ShopFloors/Down/DownHistory";

function DownResource() {


    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');

    const [loading, setLoading] = useState(true);
    const [resource, setResource] = useState(null);

    console.log(resource);
    

    useEffect(() => {
        setTimeout(() => {
            const resourceData = resources.find((res) => res.id === Number(resourceId));
            setResource(resourceData);
            setLoading(false);
        }, 500);

    }, [resourceId]);

    return (
        <DetailResource>
            {loading ?
                <Col
                    style={{
                        marginTop: 10,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                    lg={24}
                >
                    <Spin tip="Loading...">
                        <Alert
                            style={{ width: '200px', height: '60px' }}
                            type="info"
                        />
                    </Spin>
                </Col>
                :
                <>
                    {/* BODY CONTENT */}
                    <DownWithCategory />
                    {/* ==== */}
                    <DownWithoutCategory />
                    {/* === */}
                    <DownHistory />
                    {/* END BODY CONTENT */}
                </>
            }
        </DetailResource>
    );
}

export default DownResource;