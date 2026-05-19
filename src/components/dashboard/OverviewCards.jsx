import { Card, Col, Row, Statistic } from "antd";

function OverviewCards({ stats }) {
  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat) => (
        <Col xs={24} sm={12} xl={6} key={stat.label}>
          <Card className="border border-slate-200 !rounded-lg shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <Statistic title={stat.label} value={stat.value} />
              {stat.icon ? (
                <div className="rounded-lg bg-teal-50 p-3 text-xl text-teal-700">{stat.icon}</div>
              ) : null}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default OverviewCards;
