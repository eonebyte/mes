import { Alert, Col, Spin } from "antd";
import { useSearchParams } from "react-router-dom";
import ResourceLayout from "./ResourceLayout";
import { useEffect, useState } from "react";
import DownWithCategory from "../../../components/ShopFloors/Down/DownWithCategory";
// import DownWithoutCategory from "../../../components/ShopFloors/Down/DownWithoutCategory";
import DownHistory from "../../../components/ShopFloors/Down/DownHistory";
import { fetchResourceById } from "../../../data/fetchs";
import { useDispatch } from "react-redux";
import { refreshResources } from "../../../states/reducers/resourceSlice";

function DownResource() {
    const dispatch = useDispatch();


    const [searchParams] = useSearchParams();
    const resourceId = searchParams.get('resourceId');

    const [loading, setLoading] = useState(true);
    const [resource, setResource] = useState(null);

    const loadResource = async () => {

        setLoading(true);
        // Fetch resource data
        const fetchedResource = await fetchResourceById(resourceId);
        setResource(fetchedResource);
        // Fetch plan data

        setLoading(false);
    };

    const handleSuccess = () => {
        loadResource();
        dispatch(refreshResources());
    }



    useEffect(() => {
        if (resourceId) {
            loadResource();
        }
    }, [resourceId]);

    return (
        <ResourceLayout>
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
                    {loading ? (
                        <Spin tip="Loading Resource..." size="large" />
                    ) : resource ? (
                        <DownWithCategory onSuccess={handleSuccess} resource={resource} />
                    ) : (
                        <p>Data tidak ditemukan</p>
                    )}
                    {/* ==== */}
                    {/* <DownWithoutCategory /> */}
                    {/* === */}
                    <DownHistory />
                    {/* END BODY CONTENT */}
                </>
            }
        </ResourceLayout>
    );
}

export default DownResource;