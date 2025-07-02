import { Button, Result } from "antd"
import { useNavigate } from "react-router-dom"

export default function Forbidden() {
    const navigate = useNavigate();
    return (
        <div>
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={<Button onClick={() => navigate(-1)} type="primary">Back</Button>}
            />
        </div>
    )
}
