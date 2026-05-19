import { Component } from "react";
import { Button, Result } from "antd";

class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
          <Result
            status="error"
            title="Something went wrong"
            subTitle={this.state.error.message}
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Reload
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
