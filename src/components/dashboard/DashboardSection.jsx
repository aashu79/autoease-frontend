import { Card, Space, Typography } from "antd";

const { Text, Title } = Typography;

function DashboardSection({ title, subtitle, extra, children }) {
  return (
    <Card className="border border-slate-200 shadow-sm !rounded-lg">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Title level={4} className="!mb-1 !font-display">
            {title}
          </Title>
          {subtitle ? <Text className="text-slate-500">{subtitle}</Text> : null}
        </div>
        {extra ? <Space wrap>{extra}</Space> : null}
      </div>
      {children}
    </Card>
  );
}

export default DashboardSection;
