import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Col, Descriptions, Input, Row, message } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import FormError from "../form/FormError";
import DashboardSection from "./DashboardSection";
import { fieldStatus, profileSchema } from "../../utils/forms";

function ProfilePanel({ user, onUpdate, loading }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || user?.Name || "",
      phone: user?.phoneNumber || user?.PhoneNumber || user?.phone || user?.Phone || "",
    },
  });

  useEffect(() => {
    reset({
      name: user?.name || user?.Name || "",
      phone: user?.phoneNumber || user?.PhoneNumber || user?.phone || user?.Phone || "",
    });
  }, [reset, user]);

  const submitForm = async (values) => {
    await onUpdate(values);
    message.success("Profile updated successfully.");
  };

  return (
    <DashboardSection title="Profile">
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={11}>
          <Descriptions
            bordered
            column={1}
            className="[&_.ant-descriptions-item-label]:font-medium"
            items={[
              { key: "name", label: "Name", children: user?.name || user?.Name || "-" },
              { key: "email", label: "Email", children: user?.email || user?.Email || "-" },
              {
                key: "phone",
                label: "Phone",
                children: user?.phoneNumber || user?.PhoneNumber || user?.phone || user?.Phone || "-",
              },
              { key: "role", label: "Role", children: user?.role || user?.Role || "-" },
            ]}
          />
        </Col>

        <Col xs={24} xl={13}>
          <form onSubmit={handleSubmit(submitForm)}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <label className="form-label">Full name</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter your full name"
                      size="large"
                      status={fieldStatus(errors.name)}
                    />
                  )}
                />
                <FormError message={errors.name?.message} />
              </Col>

              <Col xs={24} md={12}>
                <label className="form-label">Phone number</label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter your phone number"
                      size="large"
                      status={fieldStatus(errors.phone)}
                    />
                  )}
                />
                <FormError message={errors.phone?.message} />
              </Col>
            </Row>

            <Button type="primary" htmlType="submit" size="large" loading={loading} className="mt-4">
              Update profile
            </Button>
          </form>
        </Col>
      </Row>
    </DashboardSection>
  );
}

export default ProfilePanel;
