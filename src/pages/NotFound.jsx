import { Button, Result } from "antd";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <Result
        status="404"
        title="404"
        subTitle="The page you requested does not exist."
        extra={
          <Link to="/">
            <Button type="primary" size="large">
              Back to home
            </Button>
          </Link>
        }
      />
    </div>
  );
}

export default NotFound;
