import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input, Typography, message } from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import FormError from "../components/form/FormError";
import { useAuth } from "../hooks/useAuth";
import { apiMessage } from "../utils/api";
import { fieldStatus, registerSchema } from "../utils/forms";

const { Title, Text } = Typography;

function Register() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const submitForm = async (values) => {
    try {
      setLoading(true);
      await register(values);
      message.success("Registration successful. Please log in.");
      navigate("/login");
    } catch (error) {
      message.error(apiMessage(error, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page px-4 py-10 md:px-8">
      <Card className="auth-card shadow-xl">
        <div className="auth-panel">
          <span className="auth-kicker">Start here</span>
          <Title className="!mb-6 !font-display">Create a new account</Title>

          <form onSubmit={handleSubmit(submitForm)}>
            <div className="mb-4">
              <label className="form-label">Full name</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="User Name"
                    size="large"
                    status={fieldStatus(errors.name)}
                  />
                )}
              />
              <FormError message={errors.name?.message} />
            </div>

            <div className="mb-4">
              <label className="form-label">Email</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="user@example.com"
                    size="large"
                    status={fieldStatus(errors.email)}
                  />
                )}
              />
              <FormError message={errors.email?.message} />
            </div>

            <div className="mb-4">
              <label className="form-label">Phone</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="1234567890"
                    size="large"
                    status={fieldStatus(errors.phone)}
                  />
                )}
              />
              <FormError message={errors.phone?.message} />
            </div>

            <div className="mb-5">
              <label className="form-label">Password</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="password123"
                    size="large"
                    status={fieldStatus(errors.password)}
                  />
                )}
              />
              <FormError message={errors.password?.message} />
            </div>

            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Register
            </Button>
          </form>

          <Text className="mt-5 block text-center text-slate-500">
            Already have an account? <Link to="/login">Login</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default Register;
