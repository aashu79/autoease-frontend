import { Space, Tabs } from "antd";
import { useState } from "react";
import { FiDollarSign, FiList } from "react-icons/fi";
import { AllInvoicesTab, CreateSalesInvoiceTab } from "../staff/StaffInvoice";

function AdminInvoice() {
  const [activeTab, setActiveTab] = useState("all");

  const tabItems = [
    {
      key: "all",
      label: (
        <Space>
          <FiList />
          All Invoices
        </Space>
      ),
      children: <AllInvoicesTab canSendEmail />,
    },
    {
      key: "sales",
      label: (
        <Space>
          <FiDollarSign />
          Create Sales Invoice
        </Space>
      ),
      children: <CreateSalesInvoiceTab />,
    },
  ];

  return (
    <div className="p-6">
      <div className="page-toolbar">
        <h1 className="page-title">Invoice Management</h1>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        type="card"
        className="mt-2"
      />
    </div>
  );
}

export default AdminInvoice;
